<?php

namespace Solspace\Freeform\Tests\Services;

use Illuminate\Config\Repository;
use Illuminate\Container\Container;
use Illuminate\Foundation\Application;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Solspace\Freeform\Bundles\Attributes\Form\SettingsProvider;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\FormWizard\PresetCatalog;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\FormWizardNotificationService;
use Solspace\Freeform\Services\FormWizardService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\base\Event;

#[CoversClass(FormWizardService::class)]
#[CoversClass(PresetCatalog::class)]
class FormWizardServiceTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousApp;

    protected function setUp(): void
    {
        $application = new Application();
        $application->instance('config', new Repository(['app' => ['locale' => 'en']]));
        Container::setInstance($application);
        $this->previousApp = \Craft::$app;
        \Craft::$app = (object) ['language' => 'en', 'sites' => new class {
            public function getEditableSites(): array
            {
                return [(object) ['id' => 1], (object) ['id' => 2]];
            }
        }];
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    public function testPresetsFitExpressAndFallbackWithoutLosingTheirQuestions(): void
    {
        $catalog = new PresetCatalog();
        $pro = $catalog->getPresets(array_keys(PresetCatalog::TYPES));
        $basic = array_diff(array_keys(PresetCatalog::TYPES), ['phone', 'website', 'datetime', 'rating', 'file']);
        $lite = $catalog->getPresets($basic);
        self::assertCount(12, $pro);
        self::assertCount(12, array_unique(array_column($pro, 'id')));
        foreach ($lite as $preset) {
            self::assertLessThanOrEqual(20, \count($preset['fields']));
            self::assertGreaterThanOrEqual(4, \count($preset['fields']));
            self::assertCount(\count($preset['fields']), array_unique(array_column($preset['fields'], 'key')));
            foreach ($preset['fields'] as $field) {
                self::assertContains($field['type'], $basic);
            }
        }
        $feedback = array_column($lite, null, 'id')['feedback'];
        $rating = array_column($feedback['fields'], null, 'key')['rating'];
        self::assertSame('radios', $rating['type']);
        self::assertSame(['1', '2', '3', '4', '5'], $rating['options']);
        $quote = array_column(array_column($lite, null, 'id')['quote']['fields'], null, 'key');
        self::assertSame('text', $quote['phone']['type']);
        self::assertSame('text', $quote['startDate']['type']);
        self::assertNotEmpty($quote['startDate']['instructions']);
        self::assertArrayNotHasKey('attachment', $quote);
        self::assertSame('phone', array_column(array_column($pro, null, 'id')['quote']['fields'], null, 'key')['phone']['type']);
    }

    #[TestWith(['newsletter', 'topics', 'checkboxes'])]
    #[TestWith(['support', 'issueDetails', 'textarea'])]
    #[TestWith(['appointment', 'preferredDate', 'datetime'])]
    #[TestWith(['volunteer', 'volunteerArea', 'dropdown'])]
    #[TestWith(['product', 'productName', 'text'])]
    #[TestWith(['testimonial', 'publishPermission', 'radios'])]
    public function testAdditionalPurposesIncludeTheirOwnQuestionsAndAnEmailRecipient(string $purpose, string $key, string $type): void
    {
        $presets = array_column((new PresetCatalog())->getPresets(array_keys(PresetCatalog::TYPES)), null, 'id');
        $fields = array_column($presets[$purpose]['fields'], null, 'key');
        self::assertSame($type, $fields[$key]['type']);
        self::assertSame('email', $fields['email']['type']);
        self::assertTrue($fields['email']['required']);
    }

    public function testPayloadPreservesRowsDefaultsAndNumericRatingChoices(): void
    {
        $service = $this->service();
        $input = $this->input();
        $payload = $service->payload($input);
        self::assertSame('my-template.twig', $payload->form->settings->general->formattingTemplate);
        self::assertCount(3, $payload->layout->rows);
        self::assertSame($payload->layout->fields[0]->rowUid, $payload->layout->fields[1]->rowUid);
        $rating = array_values(array_filter($payload->layout->fields, static fn ($field) => 'rating' === $field->properties->handle))[0];
        self::assertTrue($rating->properties->oneLine);
        self::assertSame('1', $rating->properties->optionConfiguration['options'][0]['value']);
        self::assertObjectNotHasProperty('maxValue', $rating->properties);
        self::assertSame([], $payload->notifications);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testLockedTemplateCannotBeOverriddenForCreationOrPreview(bool $preview): void
    {
        $input = $this->input();
        $input['formattingTemplate'] = 'attempted-override.twig';
        $payload = $this->service()->payload($input, $preview);
        self::assertSame('my-template.twig', $payload->form->settings->general->formattingTemplate);
    }

    public function testAdvancedDetailsAreValidatedAndStoredAsGeneralSettings(): void
    {
        $input = array_replace($this->input(), ['handle' => 'projectInquiry', 'description' => 'Team notes', 'color' => '#aabbcc', 'defaultStatus' => '2']);
        $payload = $this->advancedService()->payload($input);
        self::assertSame('projectInquiry', $payload->form->settings->general->handle);
        self::assertSame('Team notes', $payload->form->settings->general->description);
        self::assertSame('#aabbcc', $payload->form->settings->general->color);
        self::assertSame(2, $payload->form->settings->general->defaultStatus);
        self::assertObjectNotHasProperty('color', $payload->form->settings->behavior);
    }

    #[TestWith(['handle', 'invalid handle!'])]
    #[TestWith(['color', 'red'])]
    #[TestWith(['defaultStatus', '999'])]
    public function testInvalidAdvancedDetailsAreRejected(string $key, string $value): void
    {
        $input = array_replace($this->input(), [$key => $value]);
        $this->expectException(\InvalidArgumentException::class);
        $this->advancedService()->payload($input);
    }

    public function testRestrictedAdvancedDetailsDoNotOverrideDefaults(): void
    {
        $input = array_replace($this->input(), ['handle' => 'custom', 'description' => 'Override', 'color' => '#ffffff', 'defaultStatus' => '2']);
        $payload = $this->advancedService(false)->payload($input);
        self::assertNotSame('custom', $payload->form->settings->general->handle);
        self::assertObjectNotHasProperty('description', $payload->form->settings->general);
        self::assertObjectNotHasProperty('color', $payload->form->settings->general);
        self::assertObjectNotHasProperty('defaultStatus', $payload->form->settings->general);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testWizardPhoneFieldsUseStandardInputForPreviewAndCreation(bool $preview): void
    {
        $input = $this->input();
        $input['fields'][] = ['key' => 'extraPhone', 'type' => 'phone', 'label' => 'Phone', 'width' => 'full'];
        $service = $this->service(availableTypes: ['text', 'email', 'textarea', 'radios', 'phone']);
        $payload = $service->payload($input, $preview);
        $phone = end($payload->layout->fields);
        self::assertFalse($phone->properties->international);
        self::assertFalse($phone->properties->useJsMask);
    }

    #[TestWith(['siteIds', [99]])]
    #[TestWith(['siteIds', [1, 99]])]
    #[TestWith(['siteIds', []])]
    #[TestWith(['siteIds', null])]
    #[TestWith(['siteIds', '1'])]
    #[TestWith(['siteIds', [true]])]
    #[TestWith(['siteIds', [1.5]])]
    #[TestWith(['name', ''])]
    #[TestWith(['purpose', 'unknown'])]
    #[TestWith(['fields', []])]
    #[TestWith(['adminEnabled', true])]
    public function testInvalidOrUnauthorizedChoicesNeverReachPersistence(string $key, mixed $value): void
    {
        $input = $this->input();
        $input[$key] = $value;
        $this->expectException(\InvalidArgumentException::class);
        $this->service()->payload($input);
    }

    public function testRejectsProFieldInjectionAndDuplicateKeys(): void
    {
        $input = $this->input();
        $input['fields'][0]['type'] = 'phone';

        try {
            $this->service()->payload($input);
            self::fail('A hidden Pro field must be rejected.');
        } catch (\InvalidArgumentException) {
            $input = $this->input();
            $input['fields'][1]['key'] = $input['fields'][0]['key'];
            $this->expectException(\InvalidArgumentException::class);
            $this->service()->payload($input);
        }
    }

    public function testNotificationsUseOnlyChosenTemplatesAndAnActualEmailField(): void
    {
        $input = $this->input();
        $input['fields'][] = ['key' => 'email', 'type' => 'email', 'label' => 'Email', 'width' => 'half'];
        $input += ['adminEnabled' => true, 'adminEmail' => 'team@example.invalid', 'adminTemplate' => 'team.twig', 'confirmationEnabled' => true, 'confirmationField' => 'email', 'confirmationTemplate' => 'team.twig'];
        $payload = $this->service(true)->payload($input);
        self::assertCount(2, $payload->notifications);
        self::assertSame('team@example.invalid', $payload->notifications[0]->recipients[0]['email']);
        self::assertSame(end($payload->layout->fields)->uid, $payload->notifications[1]->field);
        $input['confirmationField'] = 'firstName';
        $this->expectException(\InvalidArgumentException::class);
        $this->service(true)->payload($input);
    }

    public function testExpressFieldLimitIsEnforcedBeforeCreatingAnything(): void
    {
        $input = $this->input();
        $input['fields'] = array_fill(0, 21, $input['fields'][0]);
        $this->expectException(\InvalidArgumentException::class);
        $this->service()->payload($input);
    }

    #[TestWith(['javascript:alert(1)'])]
    #[TestWith(['//example.test'])]
    #[TestWith(['/\example.test'])]
    public function testRedirectRejectsUnsafeSchemesAndProtocolRelativeUrls(string $url): void
    {
        $input = $this->input() + ['successBehavior' => 'redirect-return-url', 'returnUrl' => $url];
        $this->expectException(\InvalidArgumentException::class);
        $this->service(false, ['successBehavior', 'returnUrl'])->payload($input);
    }

    public function testMultipleSitesArePreservedAndDeduplicated(): void
    {
        $input = $this->input();
        $input['siteIds'] = [2, '1', 2];
        self::assertSame([2, 1], $this->service()->payload($input)->form->settings->general->sites);
        unset($input['siteIds']);
        $input['siteId'] = 2;
        self::assertSame([2], $this->service()->payload($input)->form->settings->general->sites);
    }

    public function testMultipleSitesCannotBypassDisabledSiteSupport(): void
    {
        $input = $this->input();
        $input['siteIds'] = [1, 2];
        $this->expectException(\InvalidArgumentException::class);
        $this->service(false, [], false)->payload($input);
    }

    public function testThirdAndQuarterRowsMatchTheLayoutPreview(): void
    {
        $input = $this->input();
        $widths = ['third', 'third', 'third', 'third', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter', 'half', 'half', 'full'];
        $input['fields'] = array_map(static fn ($index, $width) => ['key' => 'extra'.$index, 'type' => 'text', 'label' => 'Field '.$index, 'width' => $width], array_keys($widths), $widths);
        $payload = $this->service()->payload($input);
        $counts = array_count_values(array_column($payload->layout->fields, 'rowUid'));
        self::assertSame([3, 1, 4, 1, 2, 1], array_values($counts));
        $input['fields'][0]['width'] = 'unknown';
        $this->expectException(\InvalidArgumentException::class);
        $this->service()->payload($input);
    }

    public function testCreatePassesTheSavedFormIdToNotificationAndAfterSaveListeners(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(42);
        $transaction = new class {
            public bool $committed = false;

            public function commit(): void
            {
                $this->committed = true;
            }

            public function rollBack(): void {}
        };
        \Craft::$app->db = new class($transaction) {
            public function __construct(private object $transaction) {}

            public function beginTransaction(): object
            {
                return $this->transaction;
            }
        };
        $create = static fn (PersistFormEvent $event) => $event->setForm($form);
        $seen = [];
        $upsert = static function (PersistFormEvent $event) use (&$seen): void { $seen[] = $event->getFormId(); };
        Event::on(FormsController::class, FormsController::EVENT_CREATE_FORM, $create);
        Event::on(FormsController::class, FormsController::EVENT_UPSERT_FORM, $upsert);
        Event::on(FormsController::class, FormsController::EVENT_AFTER_SAVE_FORM, $upsert);

        try {
            self::assertSame($form, $this->service()->create($this->input()));
            self::assertSame([42, 42], $seen);
            self::assertTrue($transaction->committed);
        } finally {
            Event::off(FormsController::class, FormsController::EVENT_CREATE_FORM, $create);
            Event::off(FormsController::class, FormsController::EVENT_UPSERT_FORM, $upsert);
            Event::off(FormsController::class, FormsController::EVENT_AFTER_SAVE_FORM, $upsert);
        }
    }

    public function testErrorMessagesUseBehaviorSettingsAndRespectPermissions(): void
    {
        $input = $this->input() + ['errorMessage' => str_repeat('a', 1500)];
        $payload = $this->service(false, ['errorMessage'])->payload($input);
        self::assertSame($input['errorMessage'], $payload->form->settings->behavior->errorMessage);
        self::assertObjectNotHasProperty('errorMessage', $payload->form->settings->general);
        self::assertObjectNotHasProperty('errorMessage', $this->service()->payload($input)->form->settings->behavior);
        $input['errorMessage'] = str_repeat('a', 2001);
        $this->expectException(\InvalidArgumentException::class);
        $this->service(false, ['errorMessage'])->payload($input);
    }

    public function testExplicitRowsPersistExactGrouping(): void
    {
        $input = $this->input();
        foreach ($input['fields'] as $i => &$field) {
            $field['rowId'] = $i < 3 ? 'first-row' : 'second-row';
        }
        unset($field);
        $payload = $this->service()->payload($input);
        self::assertSame([3, 1], array_values(array_count_values(array_column($payload->layout->fields, 'rowUid'))));
        self::assertNotSame('first-row', $payload->layout->rows[0]->uid);
        $input['fields'][2]['rowId'] = 'second-row';
        $input['fields'][3]['rowId'] = 'first-row';
        $this->expectException(\InvalidArgumentException::class);
        $this->service()->payload($input);
    }

    public function testRowsCannotContainMoreThanFourFields(): void
    {
        $input = $this->input();
        $input['fields'] = array_map(static fn ($i) => ['key' => 'extra'.$i, 'type' => 'text', 'label' => 'Field', 'rowId' => 'row'], range(0, 4));
        $this->expectException(\InvalidArgumentException::class);
        $this->service()->payload($input);
    }

    public function testNewTemplatesAreDeferredAndNeverCreatedByPreviewPayloads(): void
    {
        $input = $this->input() + ['adminEnabled' => true, 'adminEmail' => 'qa@example.invalid', 'adminNewTemplate' => true];
        $service = $this->service(true, [], true, true);
        $payload = $service->payload($input);
        self::assertTrue($payload->notifications[0]->createTemplate);
        self::assertNull($payload->notifications[0]->template);
        self::assertObjectNotHasProperty('notifications', $service->payload($input, true));
        $this->expectException(\InvalidArgumentException::class);
        $this->service(true)->payload($input);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testTemplatesAreAttachedAfterCreationAndRemovedIfSavingFails(bool $fail): void
    {
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(42);
        $record = $this->createMock(NotificationTemplateRecord::class);
        $record->method('__get')->willReturnMap([['id', 91], ['filepath', null]]);
        $templates = $this->createMock(FormWizardNotificationService::class);
        $templates->expects(self::once())->method('create')->with($form, 'admin')->willReturn($record);
        $templates->expects($fail ? self::once() : self::never())->method('remove')->with($record);
        $transaction = new class {
            public bool $committed = false;
            public bool $rolledBack = false;

            public function commit(): void
            {
                $this->committed = true;
            }

            public function rollBack(): void
            {
                $this->rolledBack = true;
            }
        };
        \Craft::$app->db = new class($transaction) {
            public function __construct(private object $transaction) {}

            public function beginTransaction(): object
            {
                return $this->transaction;
            }
        };
        $create = static fn (PersistFormEvent $event) => $event->setForm($form);
        $upsert = static function (PersistFormEvent $event) use ($fail): void {
            self::assertSame(42, $event->getFormId());
            self::assertSame(91, $event->getPayload()->notifications[0]->template);
            if ($fail) {
                throw new \RuntimeException('Persistence failed');
            }
        };
        Event::on(FormsController::class, FormsController::EVENT_CREATE_FORM, $create);
        Event::on(FormsController::class, FormsController::EVENT_UPSERT_FORM, $upsert);

        try {
            $input = $this->input() + ['adminEnabled' => true, 'adminEmail' => 'qa@example.invalid', 'adminNewTemplate' => true];

            try {
                $this->service(true, [], true, true, $templates)->create($input);
                self::assertFalse($fail);
                self::assertTrue($transaction->committed);
            } catch (\RuntimeException $exception) {
                self::assertTrue($fail);
                self::assertSame('Persistence failed', $exception->getMessage());
                self::assertTrue($transaction->rolledBack);
                self::assertFalse($transaction->committed);
            }
        } finally {
            Event::off(FormsController::class, FormsController::EVENT_CREATE_FORM, $create);
            Event::off(FormsController::class, FormsController::EVENT_UPSERT_FORM, $upsert);
        }
    }

    private function advancedService(bool $editable = true): FormWizardService
    {
        return $this->service(editable: $editable ? ['handle', 'description', 'color', 'defaultStatus'] : [], extraOptions: [
            'statuses' => [['value' => '1', 'label' => 'New'], ['value' => '2', 'label' => 'Reviewed']],
            'defaults' => ['formattingTemplate' => 'my-template.twig', 'successBehavior' => 'reload', 'returnUrl' => '', 'description' => '', 'color' => '#123456', 'defaultStatus' => '1'],
        ]);
    }

    private function input(): array
    {
        $preset = array_column((new PresetCatalog())->getPresets(['text', 'email', 'radios', 'textarea', 'dropdown', 'checkboxes']), null, 'id')['feedback'];

        return ['purpose' => 'feedback', 'name' => 'Customer feedback', 'siteIds' => [1], 'fields' => array_values(array_filter($preset['fields'], static fn ($field) => \in_array($field['key'], ['firstName', 'lastName', 'rating', 'positive'], true)))];
    }

    private function service(bool $canNotify = false, array $editable = [], bool $sitesEnabled = true, bool $canCreate = false, ?FormWizardNotificationService $templates = null, array $availableTypes = ['text', 'email', 'textarea', 'radios'], array $extraOptions = []): FormWizardService
    {
        $properties = $this->createMock(PropertyProvider::class);
        $properties->method('getEditableProperties')->willReturnCallback(function (string $class) {
            $collection = new PropertyCollection();
            $handles = ['label', 'handle', 'required', 'instructions', 'defaultValue'];
            if (PresetCatalog::TYPES['radios'] === $class) {
                $handles = array_merge($handles, ['oneLine', 'optionConfiguration']);
            }
            if (PresetCatalog::TYPES['phone'] === $class) {
                $handles = array_merge($handles, ['international', 'allowedCountries', 'pattern', 'useJsMask']);
            }
            foreach ($handles as $handle) {
                $property = $this->getMockBuilder(Text::class)->onlyMethods(['matchesEdition'])->getMock();
                $property->handle = $handle;
                $property->value = null;
                $property->method('matchesEdition')->willReturn(true);
                $collection->add($property);
            }

            return $collection;
        });
        $service = $this->getMockBuilder(FormWizardService::class)->setConstructorArgs([
            $properties, $this->createMock(SettingsProvider::class), $this->createMock(FieldTypesProvider::class),
            $this->createMock(LimitedUserChecker::class), $templates ?? $this->createMock(FormWizardNotificationService::class),
            $this->createMock(FormsService::class), $this->createMock(TranslationProvider::class), new PresetCatalog(),
        ])->onlyMethods(['options'])->getMock();
        $service->method('options')->willReturn(array_replace([
            'fieldTypes' => array_map(static fn ($type) => ['value' => $type], $availableTypes),
            'presets' => (new PresetCatalog())->getPresets($availableTypes),
            'sitesEnabled' => $sitesEnabled, 'canCreateNotificationTemplates' => $canCreate, 'fieldLimit' => 20, 'editableSettings' => $editable, 'canNotify' => $canNotify,
            'notificationTemplates' => [['value' => 'team.twig', 'label' => 'Team']],
            'defaults' => ['errorMessage' => 'Default error', 'formattingTemplate' => 'my-template.twig', 'successBehavior' => 'reload', 'returnUrl' => ''],
        ], $extraOptions));

        return $service;
    }
}
