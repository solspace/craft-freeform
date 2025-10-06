<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\FieldAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\BaseGeneratedOptionsField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\OneLineInterface;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Fields\Traits\OneLineTrait;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

#[Type(
    name: 'Checkboxes',
    typeShorthand: 'checkboxes',
    iconPath: __DIR__.'/Icons/checkboxes.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/checkboxes.ejs',
)]
class CheckboxesField extends BaseGeneratedOptionsField implements MultiValueInterface, OneLineInterface, DefaultValueInterface
{
    use MultipleValueTrait;
    use OneLineTrait;

    public const LIMIT_NO_LIMIT = '';
    public const LIMIT_REQUIRE_ALL = 'all';
    public const LIMIT_MINIMUM = 'min';
    public const LIMIT_MAXIMUM = 'max';
    public const LIMIT_RANGE = 'range';

    #[Section('limits', 'Limits', icon: __DIR__.'/Icons/section-limit.svg')]
    #[Input\Select(
        label: 'Limit Options',
        instructions: 'Set limits on the number of options a user must select, including a minimum, maximum, exact number, or range.',
        options: [
            self::LIMIT_NO_LIMIT => 'Do not limit',
            self::LIMIT_REQUIRE_ALL => 'Require all options',
            self::LIMIT_MINIMUM => 'A minimum of...',
            self::LIMIT_MAXIMUM => 'A maximum of...',
            self::LIMIT_RANGE => 'A range of...',
        ]
    )]
    protected string $limit = '';

    #[Section('limits')]
    #[VisibilityFilter('properties.limit === "'.self::LIMIT_MINIMUM.'"')]
    #[Input\Integer(
        label: 'Minimum',
        instructions: 'Defines the minimum number of selectable options.',
    )]
    protected ?int $limitMin = null;

    #[Section('limits')]
    #[VisibilityFilter('properties.limit === "'.self::LIMIT_MAXIMUM.'"')]
    #[Input\Integer(
        label: 'Maximum',
        instructions: 'Defines the maximum number of selectable options.',
    )]
    protected ?int $limitMax = null;

    #[Section('limits')]
    #[VisibilityFilter('properties.limit === "'.self::LIMIT_RANGE.'"')]
    #[Input\MinMax(
        label: 'Minimum & Maximum',
        instructions: 'Defines the minimum and maximum number of selectable options.',
    )]
    protected ?array $limitRange = [null, null];

    #[Input\Hidden]
    protected ?array $defaultValue = [];

    #[Section('attributes')]
    #[Limitation('layout.fields.attributes')]
    #[ValueTransformer(FieldAttributesTransformer::class)]
    #[Input\Attributes(
        instructions: 'Add attributes to your field elements.',
        tabs: [
            [
                'handle' => 'container',
                'label' => 'Container',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'input',
                'label' => 'Input',
                'previewTag' => 'input',
            ],
            [
                'handle' => 'optionLabel',
                'label' => 'Input Label',
                'previewTag' => 'label',
            ],
            [
                'handle' => 'label',
                'label' => 'Container Label',
                'previewTag' => 'label',
            ],
            [
                'handle' => 'instructions',
                'label' => 'Instructions',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'error',
                'label' => 'Error',
                'previewTag' => 'ul',
            ],
        ]
    )]
    protected FieldAttributesCollection $attributes;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_CHECKBOX_GROUP;
    }

    public function getLimit(): string
    {
        return $this->limit;
    }

    public function getLimitMin(): ?int
    {
        return $this->limitMin;
    }

    public function getLimitMax(): ?int
    {
        return $this->limitMax;
    }

    public function getLimitRange(): ?array
    {
        return $this->limitRange;
    }

    public function getDefaultValue(): array
    {
        return $this->defaultValue ?? [];
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getAttributes();

        $output = '';
        foreach ($this->getOptions() as $index => $option) {
            if ($option instanceof OptionCollection) {
                continue;
            }

            $isChecked = \in_array($option->getValue(), $this->getValue());

            $inputAttributes = $attributes
                ->getInput()
                ->clone()
                ->setIfEmpty('name', $this->getHandle().'[]')
                ->setIfEmpty('type', 'checkbox')
                ->set($this->getRequiredAttribute())
                ->replace('id', $this->getIdAttribute().'-'.$index)
                ->replace('value', $option->getValue())
                ->replace('checked', $isChecked)
            ;

            $labelAttributes = $attributes
                ->getOptionLabel()
                ->clone()
                ->setIfEmpty('for', $this->getIdAttribute().'-'.$index)
            ;

            $twigVariables = [
                'i' => $index,
                'index' => $index,
                'option' => $option,
                'field' => $this,
            ];

            $inputTag = Html::tag(
                $inputAttributes->getTag('input'),
                $option->getValue(),
                $inputAttributes->toHtmlTagArray($twigVariables)
            );

            $output .= Html::tag(
                $labelAttributes->getTag('label'),
                $inputTag.$option->getLabel(),
                $labelAttributes->toHtmlTagArray($twigVariables),
            );
        }

        return $output;
    }

    public function getContentGqlType(): array|GQLType
    {
        return GQLType::listOf(GQLType::string());
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Multiple option values allowed.';

        $values = [];

        foreach ($this->getOptions() as $option) {
            $values[] = '"'.$option->getValue().'"';
        }

        if (!empty($values)) {
            $description[] = 'Options include ['.implode(', ', $values).'].';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    protected function onBeforeInputHtml(): string
    {
        return $this->isOneLine() ? '<div class="input-group-one-line">' : '';
    }

    protected function onAfterInputHtml(): string
    {
        return $this->isOneLine() ? '</div>' : '';
    }
}
