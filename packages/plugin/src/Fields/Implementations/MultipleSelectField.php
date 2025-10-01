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
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\BaseGeneratedOptionsField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

#[Type(
    name: 'Multi-Select',
    typeShorthand: 'multiple-select',
    iconPath: __DIR__.'/Icons/multi-select.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/multiple-select.ejs',
)]
class MultipleSelectField extends BaseGeneratedOptionsField implements MultiValueInterface, DefaultValueInterface
{
    use MultipleValueTrait;

    #[Input\Hidden]
    protected ?array $defaultValue = [];

    #[Section(
        handle: 'attributes',
        label: 'Attributes',
        icon: __DIR__.'/SectionIcons/list.svg',
        order: 999,
    )]
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
                'handle' => 'label',
                'label' => 'Label',
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
            [
                'handle' => 'option',
                'label' => 'Option',
                'previewTag' => 'option',
            ],
        ]
    )]
    protected FieldAttributesCollection $attributes;

    public function getType(): string
    {
        return self::TYPE_MULTIPLE_SELECT;
    }

    public function getDefaultValue(): array
    {
        return $this->defaultValue ?? [];
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle().'[]')
            ->setIfEmpty('id', $this->getIdAttribute())
            ->set('multiple', true)
            ->set($this->getRequiredAttribute())
        ;

        $output = '';
        foreach ($this->getOptions() as $index => $option) {
            $isSelected = \in_array($option->getValue(), $this->getValue());

            $optionAttributes = $this->getAttributes()
                ->getOption()
                ->clone()
                ->setIfEmpty('value', $option->getValue())
                ->replace('selected', $isSelected)
            ;

            $output .= Html::tag(
                $optionAttributes->getTag('option'),
                $option->getLabel(),
                $optionAttributes->toHtmlTagArray([
                    'i' => $index,
                    'index' => $index,
                    'option' => $option,
                    'field' => $this,
                ])
            );
        }

        $output .= '</select>';

        return Html::tag(
            $attributes->getTag('select'),
            $output,
            $attributes->toHtmlTagArray(['field' => $this])
        );
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
}
