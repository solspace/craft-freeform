<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Delimiter;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\LocationAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Integrations\IntegrationTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\GraphQL\Types\FreeformJsonType;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Interfaces\SkipGibberishCheckInterface;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Fields\Traits\PlaceholderTrait;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Other\Google\GooglePlaces\GooglePlaces;
use Solspace\Freeform\Library\Attributes\LocationAttributesCollection;
use Symfony\Component\Serializer\Annotation\Ignore;
use yii\base\Event;

#[Type(
    name: 'Location',
    typeShorthand: 'location',
    iconPath: __DIR__.'/../Icons/location.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/location.ejs',
)]
class LocationField extends AbstractField implements MultiValueInterface, PlaceholderInterface, EncryptionInterface, ExtraFieldInterface, SkipGibberishCheckInterface
{
    use EncryptionTrait;
    use PlaceholderTrait;

    public const COMPONENTS = [
        'line1' => 'Address Line 1',
        'line2' => 'Address Line 2 / Apartment',
        'city' => 'City',
        'state' => 'State / Province',
        'postalCode' => 'Postal Code',
        'country' => 'Country',
    ];

    #[ValueTransformer(IntegrationTransformer::class)]
    #[Input\ApplicationStateSelect(
        label: 'Google Places Integration',
        instructions: 'Configure Google Places under Integrations → Other, enable it for this form, then select it here. Without an integration, visitors can enter an address manually.',
        emptyOption: 'Manual entry only',
        source: 'integrations',
        optionValue: 'uid',
        optionLabel: 'name',
        filters: ['Boolean(enabled)', 'shortName === "GooglePlaces"'],
    )]
    protected ?GooglePlaces $integration = null;

    #[Input\ButtonGroup(
        label: 'Address Fields',
        instructions: 'Include simple address inputs, or map address components to your own fields for more control over labels, placeholders, validation, and layout.',
        options: ['included' => 'Include fields', 'mapped' => 'Map fields'],
    )]
    protected string $addressFields = 'included';

    #[VisibilityFilter('properties.addressFields === "included" && Boolean(properties.integration)')]
    #[Input\Select(
        label: 'Address Field Display',
        instructions: 'Choose when included address inputs appear. Search only keeps them hidden after validation errors. If address search fails, they appear for manual entry.',
        options: ['always' => 'Always show', 'search' => 'Search only', 'selected' => 'Show after selection'],
    )]
    protected string $addressDisplay = 'always';

    #[VisibilityFilter('properties.addressFields !== "mapped"')]
    #[Input\Checkboxes(
        label: 'Included Components',
        instructions: 'Choose the address inputs to include. Each component is stored separately in the Location value.',
        options: self::COMPONENTS,
    )]
    protected array $includedComponents = ['line1', 'line2', 'city', 'state', 'postalCode', 'country'];

    #[VisibilityFilter('properties.required && properties.addressFields === "included"')]
    #[Input\Checkboxes(
        label: 'Required Components',
        instructions: 'Choose which included address components must be filled. Leave all unchecked to require any address value.',
        options: self::COMPONENTS,
    )]
    protected array $requiredComponents = [];

    #[Delimiter('Address Mapping')]
    #[VisibilityFilter('properties.addressFields === "mapped"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Address Line 1',
        emptyOption: 'Do not fill a field',
        implements: null,
        availableFieldTypes: ['text', 'hidden', 'dropdown'],
    )]
    protected ?FieldInterface $line1Field = null;

    #[VisibilityFilter('properties.addressFields === "mapped"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Address Line 2 / Apartment',
        emptyOption: 'Do not fill a field',
        implements: null,
        availableFieldTypes: ['text', 'hidden', 'dropdown'],
    )]
    protected ?FieldInterface $line2Field = null;

    #[VisibilityFilter('properties.addressFields === "mapped"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'City',
        emptyOption: 'Do not fill a field',
        implements: null,
        availableFieldTypes: ['text', 'hidden', 'dropdown'],
    )]
    protected ?FieldInterface $cityField = null;

    #[VisibilityFilter('properties.addressFields === "mapped"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'State / Province',
        emptyOption: 'Do not fill a field',
        implements: null,
        availableFieldTypes: ['text', 'hidden', 'dropdown'],
    )]
    protected ?FieldInterface $stateField = null;

    #[VisibilityFilter('properties.addressFields === "mapped"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Postal Code',
        emptyOption: 'Do not fill a field',
        implements: null,
        availableFieldTypes: ['text', 'hidden', 'dropdown'],
    )]
    protected ?FieldInterface $postalCodeField = null;

    #[VisibilityFilter('properties.addressFields === "mapped"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Country',
        emptyOption: 'Do not fill a field',
        implements: null,
        availableFieldTypes: ['text', 'hidden', 'dropdown'],
    )]
    protected ?FieldInterface $countryField = null;

    #[Input\Text(
        label: 'Restrict Countries',
        instructions: 'Optional comma-separated two-letter country codes, such as CA,US. Leave blank to search worldwide.',
        placeholder: 'CA,US',
    )]
    protected string $countries = '';

    #[Input\Select(label: 'State / Province Format', options: ['name' => 'Full name', 'code' => 'Code'])]
    protected string $stateFormat = 'name';

    #[Input\Select(label: 'Country Format', options: ['name' => 'Full name', 'code' => 'Two-letter code'])]
    protected string $countryFormat = 'name';

    #[ValueTransformer(LocationAttributesTransformer::class)]
    protected LocationAttributesCollection $locationAttributes;
    protected string $locationLabelPosition = 'before';
    protected bool $locationSearchLabel = false;

    public function __construct(#[Ignore] Form $form)
    {
        $this->locationAttributes = new LocationAttributesCollection();
        parent::__construct($form);
    }

    public function getLocationAttributes(): LocationAttributesCollection
    {
        $fieldAttributes = $this->getAttributes();
        $attributes = new LocationAttributesCollection([
            'searchInput' => $fieldAttributes->getInput()->toArray(),
            'componentInput' => $fieldAttributes->getInput()->toArray(),
            'searchLabel' => $fieldAttributes->getLabel()->toArray(),
            'componentLabel' => $fieldAttributes->getLabel()->toArray(),
        ]);
        $attributes->merge($this->locationAttributes);
        $event = new CompileFieldAttributesEvent($this, $attributes, LocationAttributesCollection::class);
        Event::trigger($this, self::EVENT_COMPILE_ATTRIBUTES, $event);

        return $event->getAttributes();
    }

    public function getType(): string
    {
        return 'location';
    }

    public function getAddressFields(): string
    {
        return 'mapped' === $this->addressFields ? 'mapped' : 'included';
    }

    public function getIncludedComponents(): array
    {
        return array_values(array_intersect(array_keys(self::COMPONENTS), $this->includedComponents));
    }

    public function getAddressDisplay(): string
    {
        return 'included' === $this->getAddressFields() && null !== $this->integration && \in_array($this->addressDisplay, ['search', 'selected'], true)
            ? $this->addressDisplay
            : 'always';
    }

    public function getComponentLabels(): array
    {
        $labels = self::COMPONENTS;
        $included = $this->getIncludedComponents();
        if ('included' === $this->getAddressFields() && \in_array('line1', $included, true) && !\in_array('line2', $included, true)) {
            $labels['line1'] = 'Address';
        }

        return array_map(fn ($label) => $this->translate('componentLabel', $label), $labels);
    }

    public function getRequiredComponents(): array
    {
        if (!$this->isRequired() || 'included' !== $this->getAddressFields()) {
            return [];
        }

        return array_values(array_intersect($this->getIncludedComponents(), $this->requiredComponents));
    }

    public function getMissingRequiredComponents(): array
    {
        $value = $this->getValue();

        return array_values(array_filter($this->getRequiredComponents(), static fn ($key) => '' === trim($value[$key] ?? '')));
    }

    public function getLocationConfig(): array
    {
        $mappings = [];
        if ('mapped' === $this->getAddressFields()) {
            foreach (self::COMPONENTS as $key => $label) {
                $target = $this->{$key.'Field'};
                // Ignore removed fields, invalid types and targets outside this form.
                if ($target && $target !== $this
                    && \in_array($target->getType(), ['text', 'hidden', 'dropdown'], true)
                    && $this->getForm()->getLayout()->getFields()->get($target->getUid())
                ) {
                    $mappings[$key] = $target->getHandle();
                }
            }
        }

        $countries = preg_split('/[\s,;]+/', strtoupper(trim($this->countries)), -1, \PREG_SPLIT_NO_EMPTY);
        $countries = array_values(array_unique(array_filter($countries, static fn ($code) => 1 === preg_match('/^[A-Z]{2}$/D', $code))));

        return [
            'apiKey' => $this->getBrowserApiKey(),
            'showSearch' => 'mapped' === $this->getAddressFields() || null !== $this->integration,
            'mode' => $this->getAddressFields(),
            'addressDisplay' => $this->getAddressDisplay(),
            'components' => $this->getIncludedComponents(),
            'requiredComponents' => $this->getRequiredComponents(),
            'labels' => $this->getComponentLabels(),
            'countries' => \array_slice($countries, 0, 15),
            'stateFormat' => $this->stateFormat,
            'countryFormat' => $this->countryFormat,
            'mappings' => (object) $mappings,
            'messages' => [
                'placeholder' => $this->translate('searchPlaceholder', 'Start typing your address...'),
                'suggestions' => $this->translate('suggestionsLabel', 'Address suggestions'),
                'unavailable' => $this->translate('unavailable', 'Address search is unavailable. Please enter your address manually.'),
                'noResults' => $this->translate('noResults', 'No matching addresses. You can enter your address manually.'),
                'results' => $this->translate('results', 'Address suggestions available. Use the arrow keys to choose an address.'),
            ],
        ];
    }

    public function setValue(mixed $value): FieldInterface
    {
        if (\is_string($value)) {
            $decoded = json_decode($value, true);
            $value = \is_array($decoded) ? $decoded : ['search' => $value];
        }
        $clean = [];
        foreach (['search', ...array_keys(self::COMPONENTS)] as $key) {
            if (\is_array($value) && \is_scalar($value[$key] ?? null)) {
                $clean[$key] = mb_substr(trim((string) $value[$key]), 0, 1000);
            }
        }
        $this->value = $clean;

        return $this;
    }

    public function getValue(): array
    {
        return \is_array($this->value) ? $this->value : [];
    }

    public function getValueAsString(): string
    {
        $value = $this->getValue();
        $parts = array_filter(array_intersect_key($value, self::COMPONENTS), static fn ($part) => '' !== $part);

        return $parts ? implode(', ', $parts) : ($value['search'] ?? '');
    }

    public function getContentGqlType(): array|GQLType
    {
        return FreeformJsonType::getType();
    }

    protected function getBrowserApiKey(): string
    {
        if ($this->getForm()->isPreview() || !$this->integration?->isEnabled()) {
            return '';
        }

        $integration = \Craft::$container->get(FormIntegrationsProvider::class)->getFirstForForm(
            $this->getForm(),
            GooglePlaces::class,
            filter: fn (GooglePlaces $candidate) => $candidate->getUid() === $this->integration->getUid(),
        );

        return $integration?->getApiKey() ?? '';
    }

    protected function getInputHtml(): string
    {
        $value = $this->getValue();
        $locationAttributes = $this->getLocationAttributes();
        $normalAttributes = $locationAttributes;
        if ($this->hasErrors()) {
            $validField = clone $this;
            $validField->errors = [];
            $normalAttributes = $validField->getLocationAttributes();
        }
        $labelField = clone $this;
        $labelField->errors = [];
        $requiredLabel = $labelField->getLocationAttributes()->getComponentLabel();
        $labelField->required = false;
        $optionalLabel = $labelField->getLocationAttributes()->getComponentLabel();
        $config = $this->getLocationConfig();
        $labelsAfter = 'after' === ($this->getParameters()->locationLabelPosition ?? $this->locationLabelPosition);
        $searchLabelInside = true === ($this->getParameters()->locationSearchLabel ?? $this->locationSearchLabel);
        $requiredComponents = $this->getRequiredComponents();
        $missingComponents = $this->getMissingRequiredComponents();
        $showSearch = $config['showSearch'] ?? ('mapped' === $this->getAddressFields() || !empty($config['apiKey']));
        $display = !empty($config['apiKey']) ? $this->getAddressDisplay() : 'always';
        $hasComponents = (bool) array_filter(array_intersect_key($value, self::COMPONENTS));
        $showComponents = 'always' === $display || ('selected' === $display && ($hasComponents || $this->hasErrors()));
        $searchInvalid = $this->hasErrors() && $showSearch && (!$requiredComponents || !$showComponents);
        $search = ($searchInvalid ? $locationAttributes : $normalAttributes)->getSearchInput()->clone()
            ->replace('name', $this->getHandle().'[search]')
            ->replace('type', $showSearch ? 'text' : 'hidden')
            ->replace('id', $this->getIdAttribute())
            ->replace('value', $showSearch ? ($value['search'] ?? $this->getValueAsString()) : '')
            ->set('required', $showSearch && !$requiredComponents && $locationAttributes->getSearchInput()->get('required'))
            ->set('aria-invalid', $searchInvalid ? 'true' : false)
            ->setIfEmpty('placeholder', $this->getPlaceholder())
            ->replace('autocomplete', 'off')
            ->set('data-freeform-location-search', true)
        ;
        if ($showSearch && '' === trim((string) $search->get('placeholder'))) {
            $search->replace('placeholder', $this->getPlaceholder() ?: ($config['messages']['placeholder'] ?? 'Start typing your address...'));
        }
        $output = Html::tag('input', '', $search->toHtmlTagArray(['field' => $this]));
        if ($showSearch) {
            $iconAttributes = $locationAttributes->getSearchIcon()->clone()->replace('data-freeform-location-icon', true)->replace('aria-hidden', 'true');
            $icon = Html::tag($iconAttributes->getTag('span'), '', $iconAttributes->toHtmlTagArray(['field' => $this]));
            $label = $searchLabelInside
                ? Html::tag('label', Html::encode($this->getLabel()), $locationAttributes->getSearchLabel()->clone()->replace('for', $this->getIdAttribute())->toHtmlTagArray(['field' => $this]))
                : '';
            $output = Html::tag($locationAttributes->getSearchContainer()->getTag(), $labelsAfter ? $output.$icon.$label : $label.$output.$icon, $locationAttributes->getSearchContainer()->toHtmlTagArray(['field' => $this]));
        } elseif ($searchLabelInside) {
            $output = $this->renderLabel().$output;
        }

        $components = '';
        $autofill = ['line1' => 'address-line1', 'line2' => 'address-line2', 'city' => 'address-level2', 'state' => 'address-level1', 'postalCode' => 'postal-code', 'country' => 'country-name'];
        foreach (array_keys(self::COMPONENTS) as $key) {
            $visible = 'included' === $this->getAddressFields() && \in_array($key, $this->getIncludedComponents(), true);
            $required = $visible && \in_array($key, $requiredComponents, true);
            $invalid = $this->hasErrors() && $showComponents && $visible && (!$requiredComponents || \in_array($key, $missingComponents, true));
            $id = $this->getIdAttribute().'-'.$key;
            $attributes = ($invalid ? $locationAttributes : $normalAttributes)->getComponentInput()->clone()
                ->replace('name', $this->getHandle().'['.$key.']')
                ->replace('id', $id)
                ->replace('type', $visible ? 'text' : 'hidden')
                ->replace('value', $value[$key] ?? '')
                ->set('required', $required && $showComponents && $locationAttributes->getComponentInput()->get('required'))
                ->set('aria-invalid', $invalid ? 'true' : false)
                ->set('data-location-required', $required)
                ->setIfEmpty('placeholder', $labelsAfter ? $config['labels'][$key] : '')
                ->replace('autocomplete', $autofill[$key])
                ->replace('data-location-component', $key)
            ;
            if (!$visible) {
                $output .= Html::tag('input', '', $attributes->toHtmlTagArray(['field' => $this, 'component' => $key]));

                continue;
            }
            if ($labelsAfter && '' === trim((string) $attributes->get('placeholder'))) {
                $attributes->replace('placeholder', $config['labels'][$key]);
            }
            $label = Html::tag('label', Html::encode($config['labels'][$key]), ($required ? $requiredLabel : $optionalLabel)->clone()->replace('for', $id)->remove('id')->toHtmlTagArray(['field' => $this, 'component' => $key]));
            $input = Html::tag('input', '', $attributes->toHtmlTagArray(['field' => $this, 'component' => $key]));
            $components .= Html::tag($locationAttributes->getComponentContainer()->getTag(), $labelsAfter ? $input.$label : $label.$input, $locationAttributes->getComponentContainer()->toHtmlTagArray(['field' => $this, 'component' => $key]));
        }
        if ('' !== $components) {
            $componentAttributes = $locationAttributes->getComponents()->clone()
                ->replace('data-freeform-location-components', true)
                ->replace('hidden', !$showComponents)
            ;
            $output .= Html::tag($componentAttributes->getTag(), $components, $componentAttributes->toHtmlTagArray(['field' => $this]));
        }

        $container = $locationAttributes->getWrapper()->clone()->replace('data-freeform-location', json_encode($config));

        return Html::tag($container->getTag(), $output, $container->toHtmlTagArray(['field' => $this]));
    }
}
