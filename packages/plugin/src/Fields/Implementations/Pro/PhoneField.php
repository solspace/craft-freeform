<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Implementations\Phone\PhoneCountriesOptionsGenerator;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\PhoneMaskInterface;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'Phone',
    typeShorthand: 'phone',
    iconPath: __DIR__.'/../Icons/phone.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/phone.ejs',
)]
class PhoneField extends TextField implements PhoneMaskInterface, ExtraFieldInterface
{
    // Character counts are only configurable on Text and Textarea fields.
    protected bool $showCharacterCount = false;

    protected string $customInputType = 'tel';

    #[Input\Boolean(
        label: 'Use international phone input',
        instructions: 'Add a searchable country selector and validate international numbers. Replaces pattern validation when enabled.',
    )]
    protected bool $international = false;

    #[VisibilityFilter('properties.international === true')]
    #[Input\Select(label: 'Default country', options: PhoneCountriesOptionsGenerator::class)]
    protected string $defaultCountry = 'US';

    #[VisibilityFilter('properties.international === true')]
    #[Input\Text(
        label: 'Allowed countries',
        instructions: 'Comma-separated two-letter country codes, e.g. US, CA, GB. Leave empty to allow all countries.',
    )]
    protected string $allowedCountries = '';

    #[VisibilityFilter('properties.international === false')]
    #[Limitation('props.phone', 'pattern')]
    #[DefaultValue('props.phone.pattern')]
    #[Translatable]
    #[Input\Text(
        label: 'Pattern validation',
        instructions: "Use '0' (a digit between 0-9) and other characters, e.g. '(000) 000-0000' or '+0 0000 000000'.",
    )]
    protected ?string $pattern = null;

    #[VisibilityFilter('properties.international === false')]
    #[Limitation('props.phone', 'javascript')]
    #[DefaultValue('props.phone.javascript')]
    #[Input\Boolean(
        label: 'Use built-in javascript validation on pattern',
    )]
    protected bool $useJsMask = false;

    public function isInternational(): bool
    {
        return $this->international;
    }

    public function getAllowedCountries(): string
    {
        return $this->allowedCountries;
    }

    public function getDefaultCountry(): string
    {
        return $this->defaultCountry;
    }

    public function getAllowedCountryCodes(): array
    {
        if ('' === trim($this->allowedCountries)) {
            return PhoneNumberUtil::getInstance()->getSupportedRegions();
        }
        $codes = array_map('trim', explode(',', strtoupper($this->allowedCountries)));

        return array_values(array_intersect(array_unique($codes), PhoneNumberUtil::getInstance()->getSupportedRegions()));
    }

    public function getInitialCountryCode(): ?string
    {
        $allowed = $this->getAllowedCountryCodes();
        $default = strtoupper($this->defaultCountry);

        return \in_array($default, $allowed, true) ? $default : ($allowed[0] ?? null);
    }

    public function getInternationalConfig(): array
    {
        $phone = PhoneNumberUtil::getInstance();
        $examples = [];
        foreach ($this->getAllowedCountryCodes() as $country) {
            $example = $phone->getExampleNumber($country);
            if ($example) {
                $examples[$country] = $phone->format($example, PhoneNumberFormat::NATIONAL);
            }
        }

        return [
            'international' => true,
            'defaultCountry' => $this->getInitialCountryCode(),
            'allowedCountries' => $this->getAllowedCountryCodes(),
            'examples' => $examples,
            'labels' => [
                'country' => Freeform::t('Country'),
                'search' => Freeform::t('Search countries'),
                'empty' => Freeform::t('No countries found'),
            ],
        ];
    }

    public function getType(): string
    {
        return self::TYPE_PHONE;
    }

    public function isUseJsMask(): bool
    {
        return !$this->international && $this->useJsMask;
    }

    public function getPattern(): ?string
    {
        if ($this->international) {
            return null;
        }
        $pattern = $this->getTranslationTable()->get('pattern', $this->pattern);

        return !empty($pattern) ? $pattern : null;
    }

    public function getInputHtml(): string
    {
        if ($this->international) {
            $attributes = $this->getAttributes()->getInput()->clone()
                ->replace('type', 'tel')
                ->replace('data-freeform-phone', json_encode($this->getInternationalConfig(), \JSON_THROW_ON_ERROR))
                ->setIfEmpty('name', $this->getHandle())
                ->setIfEmpty('id', $this->getIdAttribute())
                ->setIfEmpty('autocomplete', 'tel')
                ->setIfEmpty('placeholder', $this->translate('placeholder', $this->getPlaceholder()))
                ->setIfEmpty('value', $this->getValue())
            ;

            return Html::tag('input', '', $attributes->toHtmlTagArray(['field' => $this]));
        }
        if (!$this->isUseJsMask()) {
            return parent::getInputHtml();
        }

        $pattern = $this->getPattern();
        $pattern = str_replace('x', '0', $pattern);

        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->append('class', 'form-phone-pattern-field')
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->customInputType ?? 'text')
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', $this->translate('placeholder', $this->getPlaceholder()))
            ->setIfEmpty('value', $this->getValue())
            ->setIfEmpty('data-masked-input', $pattern)
            ->setIfEmpty('data-pattern', $pattern)
        ;

        return Html::tag(
            $attributes->getTag('input'),
            '',
            $attributes->toHtmlTagArray(['field' => $this])
        );
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();

        if (!empty($this->getPattern())) {
            $description[] = 'Pattern: "'.$this->getPattern().'".';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }
}
