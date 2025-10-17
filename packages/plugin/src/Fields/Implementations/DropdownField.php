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
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\BaseGeneratedOptionsField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

#[Type(
    name: 'Dropdown',
    typeShorthand: 'dropdown',
    iconPath: __DIR__.'/Icons/dropdown.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/dropdown.ejs',
)]
class DropdownField extends BaseGeneratedOptionsField implements DefaultValueInterface
{
    #[Input\Hidden]
    protected string $defaultValue = '';

    #[Translatable]
    #[ValueTransformer(OptionsTransformer::class)]
    #[Input\Options(
        label: 'Options Editor',
        instructions: 'Define your options',
        showEmptyOption: true,
        allowOptgroup: true,
    )]
    protected ?OptionsConfigurationInterface $optionConfiguration = null;

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
        return self::TYPE_SELECT;
    }

    public function getDefaultValue(): string
    {
        return $this->defaultValue;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->set($this->getRequiredAttribute())
        ;

        $optionAttributes = $this->getAttributes()->getOption();

        return Html::tag(
            $attributes->getTag('select'),
            $this->renderCollection($this->getOptions(), $optionAttributes),
            $attributes->toHtmlTagArray(['field' => $this])
        );
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Single option value allowed.';

        $values = [];

        foreach ($this->getOptions() as $option) {
            $values[] = '"'.$option->getValue().'"';
        }

        if (!empty($values)) {
            $description[] = 'Options include '.implode(', ', $values).'.';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    private function renderCollection(OptionCollection $collection, Attributes $attributes): string
    {
        $output = '';
        foreach ($collection as $index => $option) {
            if ($option instanceof OptionCollection) {
                $output .= Html::tag(
                    'optgroup',
                    $this->renderCollection($option, $attributes),
                    ['label' => $option->getLabel()]
                );

                continue;
            }

            $isChecked = $option->getValue() == $this->getValue();

            $optionAttributes = $attributes
                ->clone()
                ->replace('value', $option->getValue())
                ->replace('selected', $isChecked)
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

        return $output;
    }
}
