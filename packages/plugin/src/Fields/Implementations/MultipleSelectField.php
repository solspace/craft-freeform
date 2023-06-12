<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractExternalOptionsField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;

#[Type(
    name: 'Multi-Select',
    typeShorthand: 'multiple-select',
    iconPath: __DIR__.'/Icons/text.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/multiple-select.ejs',
)]
class MultipleSelectField extends AbstractExternalOptionsField implements MultiValueInterface
{
    use MultipleValueTrait;

    public function getType(): string
    {
        return self::TYPE_MULTIPLE_SELECT;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle().'[]')
            ->setIfEmpty('id', $this->getIdAttribute())
            ->set('multiple', true)
            ->set($this->getRequiredAttribute())
        ;

        $output = '<select'.$attributes.'>';

        foreach ($this->getOptions() as $option) {
            $output .= '<option value="'.$option->value.'"'.($option->checked ? ' selected' : '').'>';
            $output .= $this->translate($option->label);
            $output .= '</option>';
        }

        $output .= '</select>';

        return $output;
    }

    public function getValueAsString(bool $optionsAsValues = true): string
    {
        if (!$optionsAsValues) {
            return implode(', ', $this->getValue());
        }

        $labels = [];
        foreach ($this->getOptions() as $option) {
            if ($option->isChecked()) {
                $labels[] = $option->getLabel();
            }
        }

        return implode(', ', $labels);
    }

    public function getContentGqlType(): array|\GraphQL\Type\Definition\Type
    {
        return \GraphQL\Type\Definition\Type::listOf(\GraphQL\Type\Definition\Type::string());
    }

    public function getContentGqlMutationArgumentType(): \GraphQL\Type\Definition\Type|array
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
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }
}
