<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
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
use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\BaseGeneratedOptionsField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Fields\Traits\OptionCollectionTrait;
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
    use OptionCollectionTrait;

    #[Input\Hidden]
    protected ?array $defaultValue = [];

    #[Translatable]
    #[ValueTransformer(OptionsTransformer::class)]
    #[Input\Options(
        label: 'Options Editor',
        instructions: 'Define your options',
        showEmptyOption: true,
        allowOptgroup: true,
    )]
    protected ?OptionsConfigurationInterface $optionConfiguration = null;

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

        $optionAttributes = $this->getAttributes()->getOption();

        return Html::tag(
            $attributes->getTag('select'),
            $this->renderCollection($this->getOptions(), $optionAttributes),
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

        $flatOptions = [];

        foreach ($this->getOptions() as $option) {
            if ($option instanceof OptionCollection) {
                foreach ($option->getOptions() as $child) {
                    if ($child instanceof Option) {
                        $flatOptions[] = $child;
                    }
                }

                continue;
            }

            if ($option instanceof Option) {
                $flatOptions[] = $option;
            }
        }

        $values = [];

        foreach ($flatOptions as $option) {
            $values[] = '"'.$option->getValue().'"';
        }

        if (!empty($values)) {
            $description[] = 'Options include ['.implode(', ', $values).'].';
        }

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => implode("\n", $description),
        ];
    }
}
