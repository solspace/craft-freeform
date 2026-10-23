<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Export\Collections\FieldDescriptorCollection;
use Solspace\Freeform\Bundles\Export\Implementations\Csv\ExportCsv;
use Solspace\Freeform\Bundles\Export\Objects\Column;
use Solspace\Freeform\Bundles\Export\Objects\FieldDescriptor;
use Solspace\Freeform\Bundles\Fields\FieldsBundle;
use Solspace\Freeform\Bundles\Fields\Implementations\SummaryField\SummaryFormatter;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Bundles\Fields\Validation\RequiredFieldValidation;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Other\Google\GooglePlaces\GooglePlaces;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Attributes\LocationAttributesCollection;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\DataObjects\ExportSettings;
use yii\base\Event;
use yii\di\Container;

#[CoversClass(LocationField::class)]
class LocationFieldTest extends TestCase
{
    #[TestWith([Freeform::EDITION_EXPRESS, false])]
    #[TestWith([Freeform::EDITION_LITE, false])]
    #[TestWith([Freeform::EDITION_PRO, true])]
    public function testLocationIsRegisteredOnlyForPro(string $edition, bool $available): void
    {
        $previousApp = \Yii::$app;
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods([])->getMock();
        $plugin->edition = $edition;
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];

        try {
            $event = new RegisterFieldTypesEvent();
            $bundle = (new \ReflectionClass(FieldsBundle::class))->newInstanceWithoutConstructor();
            $bundle->registerFieldTypes($event);
            self::assertSame($available, \in_array(LocationField::class, $event->getTypes(), true));
            self::assertContains(TextField::class, $event->getTypes());
        } finally {
            \Yii::$app = $previousApp;
        }
    }

    public function testRoundTripsStructuredStorageAndRejectsNestedOrUnknownValues(): void
    {
        $field = new LocationField($this->createMock(Form::class));
        $field->setValue(['search' => '123 Main St', 'line1' => '123 Main St', 'city' => ' Winnipeg ', 'state' => ['bad'], 'unknown' => 'ignore']);
        self::assertSame(['search' => '123 Main St', 'line1' => '123 Main St', 'city' => 'Winnipeg'], $field->getValue());
        self::assertSame('123 Main St, Winnipeg', $field->getValueAsString());
        $json = json_encode($field->getValue());
        $field->setValue(null);
        self::assertSame([], $field->getValue());
        $field->setValue($json);
        self::assertSame('Winnipeg', $field->getValue()['city']);
        $field->setValue('Manually entered address');
        self::assertSame('Manually entered address', $field->getValueAsString());
    }

    #[TestWith([['line1'], 'included', 'Address'])]
    #[TestWith([['line1', 'city'], 'included', 'Address'])]
    #[TestWith([['line1', 'line2'], 'included', 'Address Line 1'])]
    #[TestWith([['line1'], 'mapped', 'Address Line 1'])]
    public function testAddressLabelMatchesIncludedAddressLines(array $included, string $mode, string $label): void
    {
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['translate', 'getBrowserApiKey', 'getAttributes', 'getHandle', 'getIdAttribute'])->getMock();
        $field->method('translate')->willReturnCallback(static fn ($key, $default) => $default);
        $field->method('getBrowserApiKey')->willReturn('');
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getHandle')->willReturn('address');
        $field->method('getIdAttribute')->willReturn('address-id');
        (new \ReflectionProperty(LocationField::class, 'includedComponents'))->setValue($field, $included);
        (new \ReflectionProperty(LocationField::class, 'addressFields'))->setValue($field, $mode);
        self::assertSame($label, $field->getComponentLabels()['line1']);
        self::assertSame($label, $field->getLocationConfig()['labels']['line1']);
        if ('included' === $mode) {
            $html = (new \ReflectionMethod(LocationField::class, 'getInputHtml'))->invoke($field);
            $document = new \DOMDocument();
            @$document->loadHTML($html);
            self::assertSame($label, (new \DOMXPath($document))->query('//label[@for="address-id-line1"]')->item(0)->textContent);
        }
    }

    public function testRequiredValidationRejectsEmptyAndWhitespaceComponents(): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$form])->onlyMethods(['isRequired', 'getRequiredErrorMessage'])->getMock();
        $field->method('isRequired')->willReturn(true);
        $field->method('getRequiredErrorMessage')->willReturn('Please enter an address');
        $field->setValue(['search' => ' ', 'city' => '  ']);
        $validator = new RequiredFieldValidation();

        try {
            $validator->validate(new ValidateEvent($form, $field));
            self::assertSame(['Please enter an address'], $field->getErrors());
        } finally {
            Event::off(FieldInterface::class, FieldInterface::EVENT_VALIDATE, [$validator, 'validate']);
        }
    }

    #[TestWith(['basic', true])]
    #[TestWith(['basic', false])]
    #[TestWith(['bootstrap', true])]
    #[TestWith(['bootstrap', false])]
    public function testFloatingLabelSamplesKeepLabelsValuesAndTargetedErrors(string $theme, bool $showSearch): void
    {
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['getAttributes', 'getLocationConfig', 'getHandle', 'getIdAttribute', 'getLabel'])->getMock();
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection(['input' => ['class' => 'sample-input'], 'label' => ['class' => 'sample-label']]));
        $field->method('getLocationConfig')->willReturn(['labels' => LocationField::COMPONENTS, 'showSearch' => $showSearch]);
        $field->method('getHandle')->willReturn('address');
        $field->method('getIdAttribute')->willReturn('address-id');
        $field->method('getLabel')->willReturn('Location');
        $field->setParameters(['locationLabelPosition' => 'after', 'locationSearchLabel' => true]);
        $wrapperClass = 'freeform-location-floating'.('bootstrap' === $theme ? ' form-floating' : '');
        (new \ReflectionProperty(LocationField::class, 'locationAttributes'))->setValue($field, new LocationAttributesCollection([
            'searchContainer' => ['class' => $wrapperClass],
            'componentContainer' => ['class' => $wrapperClass],
        ]));
        (new \ReflectionProperty(LocationField::class, 'required'))->setValue($field, true);
        (new \ReflectionProperty(LocationField::class, 'requiredComponents'))->setValue($field, ['line1', 'city']);
        $field->setValue(['city' => 'Winnipeg']);
        $field->addError('Complete the address');
        $previousApp = \Craft::$app;
        \Craft::$app = (object) ['charset' => 'UTF-8'];

        try {
            $html = (new \ReflectionMethod(LocationField::class, 'getInputHtml'))->invoke($field);
        } finally {
            \Craft::$app = $previousApp;
        }
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(7, $xpath->query('//input')->length);
        self::assertSame(7, $xpath->query('//label')->length);
        $wrapperCount = $showSearch ? 7 : 6;
        self::assertSame($wrapperCount, $xpath->query('//div[contains(@class, "freeform-location-floating")]/input/following-sibling::label')->length);
        self::assertSame('bootstrap' === $theme ? $wrapperCount : 0, $xpath->query('//div[contains(@class, "form-floating")]')->length);
        self::assertSame($wrapperCount, $xpath->query('//input[@type="text"][string-length(@placeholder) > 0]')->length);
        self::assertSame('Winnipeg', $xpath->query('//input[@name="address[city]"]')->item(0)->getAttribute('value'));
        self::assertSame('address-id-city', $xpath->query('//label[text()="City"]')->item(0)->getAttribute('for'));
        self::assertSame(1, $xpath->query('//input[@aria-invalid="true"]')->length);
        self::assertSame('address[line1]', $xpath->query('//input[@aria-invalid="true"]')->item(0)->getAttribute('name'));
        self::assertSame(1, $xpath->query('//label[@for="address-id"]')->length);
    }

    public function testIncludedAndHiddenComponentsHaveDistinctNamesAndEscapeValues(): void
    {
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['getAttributes', 'getLocationConfig', 'getHandle', 'getIdAttribute'])->getMock();
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getHandle')->willReturn('address');
        $field->method('getIdAttribute')->willReturn('address-id');
        $field->method('getLocationConfig')->willReturn(['labels' => LocationField::COMPONENTS]);
        $field->setValue(['city' => '<script>alert(1)</script>', 'line1' => '123 Main St']);
        (new \ReflectionProperty(LocationField::class, 'includedComponents'))->setValue($field, ['line1', 'city']);
        $html = (new \ReflectionMethod(LocationField::class, 'getInputHtml'))->invoke($field);
        self::assertStringNotContainsString('<script>', $html);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(7, $xpath->query('//input')->length);
        self::assertSame('text', $xpath->query('//input[@name="address[city]"]')->item(0)->getAttribute('type'));
        self::assertSame('hidden', $xpath->query('//input[@name="address[country]"]')->item(0)->getAttribute('type'));
        self::assertSame('address-id', $xpath->query('//input[@name="address[search]"]')->item(0)->getAttribute('id'));
        self::assertSame('hidden', $xpath->query('//input[@name="address[search]"]')->item(0)->getAttribute('type'));
        self::assertSame(0, $xpath->query('//div[@data-freeform-location-components]/@style')->length);
    }

    #[TestWith([['search' => 'Google address'], ['line1', 'city'], true])]
    #[TestWith([['line1' => '123 Main', 'city' => ' '], ['city'], true])]
    #[TestWith([['line1' => '123 Main', 'city' => 'Winnipeg', 'line2' => ''], [], false])]
    public function testSelectedRequiredComponentsAreValidatedIndividually(array $value, array $missing, bool $invalid): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$form])->onlyMethods(['getRequiredErrorMessage', 'getComponentLabels'])->getMock();
        $field->method('getRequiredErrorMessage')->willReturn('Please complete the address');
        $field->method('getComponentLabels')->willReturn(LocationField::COMPONENTS);
        (new \ReflectionProperty(LocationField::class, 'required'))->setValue($field, true);
        (new \ReflectionProperty(LocationField::class, 'requiredComponents'))->setValue($field, ['line1', 'city']);
        $field->setValue($value);
        self::assertSame($missing, $field->getMissingRequiredComponents());
        $validator = new RequiredFieldValidation();

        try {
            $validator->validate(new ValidateEvent($form, $field));
            self::assertSame($invalid, $field->hasErrors());
        } finally {
            Event::off(FieldInterface::class, FieldInterface::EVENT_VALIDATE, [$validator, 'validate']);
        }
    }

    public function testRequirementsRespectIncludedComponentsModeAndRequiredToggle(): void
    {
        $field = new LocationField($this->createMock(Form::class));
        (new \ReflectionProperty(LocationField::class, 'required'))->setValue($field, true);
        (new \ReflectionProperty(LocationField::class, 'requiredComponents'))->setValue($field, ['city', 'country', 'invalid']);
        (new \ReflectionProperty(LocationField::class, 'includedComponents'))->setValue($field, ['city']);
        self::assertSame(['city'], $field->getRequiredComponents());
        (new \ReflectionProperty(LocationField::class, 'addressFields'))->setValue($field, 'mapped');
        self::assertSame([], $field->getRequiredComponents());
        (new \ReflectionProperty(LocationField::class, 'addressFields'))->setValue($field, 'included');
        (new \ReflectionProperty(LocationField::class, 'required'))->setValue($field, false);
        self::assertSame([], $field->getRequiredComponents());
    }

    #[TestWith(['search', [], ['line1', 'city'], null, true, 'Please enter an address.'])]
    #[TestWith(['search', ['search' => 'Main Street'], ['line1', 'city'], null, true, 'Please choose a complete address from the suggestions.'])]
    #[TestWith(['search', ['line1' => '123 Main'], ['line1', 'city'], null, true, 'Please choose a complete address from the suggestions.'])]
    #[TestWith(['always', [], ['line1', 'city'], null, true, 'Please fill in the required address fields: {fields}.'])]
    #[TestWith(['selected', [], ['line1', 'city'], null, true, 'Please fill in the required address fields: {fields}.'])]
    #[TestWith(['search', [], ['line1', 'city'], 'Custom address message', true, 'Custom address message'])]
    #[TestWith(['search', [], [], null, true, 'Please enter an address.'])]
    #[TestWith(['search', [], ['line1', 'city'], null, false, 'Please fill in the required address fields: {fields}.'])]
    public function testRequiredMessagesDescribeTheVisibleAddressInput(string $display, array $value, array $required, ?string $customMessage, bool $provider, string $expected): void
    {
        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$form])->onlyMethods(['getRequiredErrorMessage', 'getComponentLabels', 'getAddressDisplay', 'getLocationConfig'])->getMock();
        $field->method('getRequiredErrorMessage')->willReturn($customMessage);
        $field->method('getComponentLabels')->willReturn(LocationField::COMPONENTS);
        $field->method('getAddressDisplay')->willReturn($display);
        $field->method('getLocationConfig')->willReturn(['apiKey' => $provider ? 'test' : '']);
        (new \ReflectionProperty(LocationField::class, 'required'))->setValue($field, true);
        (new \ReflectionProperty(LocationField::class, 'requiredComponents'))->setValue($field, $required);
        $field->setValue($value);
        $validator = new RequiredFieldValidation();

        try {
            $validator->validate(new ValidateEvent($form, $field));
            self::assertSame([$expected], $field->getErrors());
        } finally {
            Event::off(FieldInterface::class, FieldInterface::EVENT_VALIDATE, [$validator, 'validate']);
        }
    }

    public function testOnlyMissingRequiredInputsReceiveRenderedErrorStyles(): void
    {
        $field = new class($this->createMock(Form::class)) extends LocationField {
            public function getAttributes(): FieldAttributesCollection
            {
                $attributes = new FieldAttributesCollection();
                $attributes->getInput()->set('class', $this->hasErrors() ? 'input input-error' : 'input')->set('required', true);
                $attributes->getLabel()->set('class', $this->isRequired() ? 'label required' : 'label');

                return $attributes;
            }

            public function getLocationConfig(): array
            {
                return ['showSearch' => true, 'labels' => self::COMPONENTS];
            }

            public function getHandle(): ?string
            {
                return 'address';
            }

            public function getIdAttribute(): string
            {
                return 'address';
            }
        };
        (new \ReflectionProperty(LocationField::class, 'required'))->setValue($field, true);
        (new \ReflectionProperty(LocationField::class, 'requiredComponents'))->setValue($field, ['line1', 'city']);
        $field->setValue(['line1' => '123 Main']);
        $field->addError('Complete the address');
        $html = (new \ReflectionMethod(LocationField::class, 'getInputHtml'))->invoke($field);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(1, $xpath->query('//input[@aria-invalid="true"]')->length);
        self::assertSame('address[city]', $xpath->query('//input[@aria-invalid="true"]')->item(0)->getAttribute('name'));
        self::assertSame('input input-error', $xpath->query('//input[@name="address[city]"]')->item(0)->getAttribute('class'));
        self::assertSame('input', $xpath->query('//input[@name="address[line1]"]')->item(0)->getAttribute('class'));
        self::assertSame(2, $xpath->query('//input[@required]')->length);
        self::assertSame(2, $xpath->query('//label[@class="label required"]')->length);
        self::assertSame('City', $xpath->query('//label[@for="address-city"]')->item(0)->textContent);
        self::assertTrue($field->hasErrors());
    }

    #[TestWith(['always', [], false, true])]
    #[TestWith(['search', ['city' => 'Winnipeg'], false, false])]
    #[TestWith(['selected', [], false, false])]
    #[TestWith(['selected', ['city' => 'Winnipeg'], false, true])]
    #[TestWith(['search', [], true, false])]
    #[TestWith(['search', ['city' => 'Winnipeg'], true, false])]
    #[TestWith(['selected', [], true, true])]
    public function testAddressDisplayPreservesInputsAndRevealsValidationErrors(string $display, array $value, bool $errors, bool $visible): void
    {
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['getAttributes', 'getLocationConfig', 'getHandle', 'getIdAttribute'])->getMock();
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getLocationConfig')->willReturn(['apiKey' => 'test', 'showSearch' => true, 'labels' => LocationField::COMPONENTS]);
        $field->method('getHandle')->willReturn('address');
        $field->method('getIdAttribute')->willReturn('address');
        (new \ReflectionProperty(LocationField::class, 'integration'))->setValue($field, $this->createMock(GooglePlaces::class));
        (new \ReflectionProperty(LocationField::class, 'addressDisplay'))->setValue($field, $display);
        (new \ReflectionProperty(LocationField::class, 'required'))->setValue($field, true);
        (new \ReflectionProperty(LocationField::class, 'requiredComponents'))->setValue($field, ['line1', 'city']);
        $field->setValue($value);
        if ($errors) {
            $field->addError('Required');
        }
        $html = (new \ReflectionMethod(LocationField::class, 'getInputHtml'))->invoke($field);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(7, $xpath->query('//input')->length);
        self::assertSame(!$visible, $xpath->query('//div[@data-freeform-location-components]')->item(0)->hasAttribute('hidden'));
        self::assertSame($value['city'] ?? '', $xpath->query('//input[@name="address[city]"]')->item(0)->getAttribute('value'));
        if ('search' === $display && $errors) {
            self::assertSame(1, $xpath->query('//input[@aria-invalid="true"]')->length);
            self::assertSame('address[search]', $xpath->query('//input[@aria-invalid="true"]')->item(0)->getAttribute('name'));
        }
    }

    #[TestWith(['included', false, false])]
    #[TestWith(['included', true, true])]
    #[TestWith(['mapped', false, true])]
    public function testManualIncludedFieldsHideSearchWhileConfiguredAndMappedFieldsKeepIt(string $mode, bool $configured, bool $visible): void
    {
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['getAttributes', 'getBrowserApiKey', 'getHandle', 'getIdAttribute', 'translate'])->getMock();
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getBrowserApiKey')->willReturn(''); // Previews suppress external requests.
        $field->method('getHandle')->willReturn('address');
        $field->method('getIdAttribute')->willReturn('address-id');
        $field->method('translate')->willReturnCallback(static fn ($key, $label) => $label);
        (new \ReflectionProperty(LocationField::class, 'addressFields'))->setValue($field, $mode);
        if ($configured) {
            (new \ReflectionProperty(LocationField::class, 'integration'))->setValue($field, $this->createMock(GooglePlaces::class));
        }
        self::assertSame($visible, $field->getLocationConfig()['showSearch']);
        $html = (new \ReflectionMethod(LocationField::class, 'getInputHtml'))->invoke($field);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame($visible ? 'text' : 'hidden', $xpath->query('//input[@name="address[search]"]')->item(0)->getAttribute('type'));
        self::assertSame('included' === $mode ? 6 : 0, $xpath->query('//div[@class="freeform-location-components"]/div')->length);
    }

    public function testCsvExportsEachComponentInStableColumns(): void
    {
        $field = $this->getMockBuilder(LocationField::class)->disableOriginalConstructor()->onlyMethods(['getComponentLabels', 'getHandle', 'getLabel'])->getMock();
        $field->method('getComponentLabels')->willReturn(LocationField::COMPONENTS);
        $field->method('getHandle')->willReturn('address');
        $field->method('getLabel')->willReturn('Address');
        $form = $this->createMock(Form::class);
        $form->method('get')->willReturn($field);
        $descriptor = new FieldDescriptor('address', 'Address');
        $descriptors = new FieldDescriptorCollection([$descriptor]);
        $export = $this->getMockBuilder(ExportCsv::class)->disableOriginalConstructor()->onlyMethods(['getForm', 'getSettings', 'getFieldDescriptors', 'getRowBatch'])->getMock();
        $export->method('getForm')->willReturn($form);
        $export->method('getSettings')->willReturn(new ExportSettings());
        $export->method('getFieldDescriptors')->willReturn($descriptors);
        $export->method('getRowBatch')->willReturnCallback(static function () use ($descriptor, $field) {
            yield [[new Column(0, $descriptor, $field, ['line1' => '123 Main', 'city' => 'Winnipeg', 'country' => 'Canada'])]];
        });
        $resource = fopen('php://temp', 'w+');
        $export->export($resource);
        rewind($resource);
        $headings = fgetcsv($resource, escape: '\\');
        $values = fgetcsv($resource, escape: '\\');
        fclose($resource);
        self::assertCount(7, $headings);
        self::assertSame('Address: City', $headings[3]);
        self::assertSame(['', '123 Main', '', 'Winnipeg', '', '', 'Canada'], $values);
    }

    public function testConfigSurvivesHydrationAndFiltersMappingsToThisForm(): void
    {
        $form = $this->createMock(Form::class);
        $target = $this->createMock(TextField::class);
        $target->method('getUid')->willReturn('city-uid');
        $target->method('getType')->willReturn('text');
        $target->method('getHandle')->willReturn('myCity');
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$target]));
        $form->method('getLayout')->willReturn($layout);
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$form])->onlyMethods(['translate'])->getMock();
        $field->method('translate')->willReturnCallback(static fn ($key, $default) => $default);
        foreach (['addressFields' => 'mapped', 'cityField' => $target, 'countries' => 'ca,US,ca,invalid', 'countryFormat' => 'code', 'includedComponents' => ['city', 'invalid']] as $key => $value) {
            (new \ReflectionProperty(LocationField::class, $key))->setValue($field, $value);
        }
        $config = $field->getLocationConfig();
        self::assertSame(['city' => 'myCity'], (array) $config['mappings']);
        self::assertSame(['CA', 'US'], $config['countries']);
        self::assertSame(['city'], $config['components']);
        self::assertSame('', $config['apiKey']);
        self::assertSame('code', $config['countryFormat']);
    }

    public function testSummariesShowComponentsWithoutDuplicatingSearchText(): void
    {
        $formatter = new SummaryFormatter();
        self::assertTrue($formatter::supports('location'));
        self::assertSame('123 Main, Winnipeg', $formatter->formatValue(['type' => 'location'], ['search' => 'Google result', 'line1' => '123 Main', 'city' => 'Winnipeg'], []));
    }

    public function testDisablingTheFormIntegrationOrPreviewDisablesExternalSearch(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('isPreview')->willReturnOnConsecutiveCalls(false, false, true);
        $integration = $this->createMock(GooglePlaces::class);
        $integration->method('isEnabled')->willReturn(true);
        $integration->method('getApiKey')->willReturn('test-browser-key');
        $provider = $this->createMock(FormIntegrationsProvider::class);
        $provider->expects($this->exactly(2))->method('getFirstForForm')->willReturnOnConsecutiveCalls(null, $integration);
        $container = new Container();
        $container->set(FormIntegrationsProvider::class, $provider);
        $original = \Craft::$container;
        \Craft::$container = $container;

        try {
            $field = new LocationField($form);
            (new \ReflectionProperty(LocationField::class, 'integration'))->setValue($field, $integration);
            $method = new \ReflectionMethod(LocationField::class, 'getBrowserApiKey');
            self::assertSame('', $method->invoke($field));
            self::assertSame('test-browser-key', $method->invoke($field));
            self::assertSame('', $method->invoke($field));
        } finally {
            \Craft::$container = $original;
        }
    }
}
