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

use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\BaseOptionsField;
use Solspace\Freeform\Fields\Interfaces\OneLineInterface;
use Solspace\Freeform\Fields\Traits\OneLineTrait;

#[Type(
    name: 'Radios',
    typeShorthand: 'radios',
    iconPath: __DIR__.'/Icons/radios.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/radios.ejs',
)]
class RadiosField extends BaseOptionsField implements OneLineInterface
{
    use OneLineTrait;

    public function getType(): string
    {
        return self::TYPE_RADIO_GROUP;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', 'radio')
            ->set($this->getRequiredAttribute())
        ;

        $output = '';
        foreach ($this->getOptions() as $index => $option) {
            $inputAttributes = $attributes
                ->clone()
                ->replace('value', $option->getValue())
                ->replace('checked', $option->isChecked())
                ->replace('id', $this->getIdAttribute()."-{$index}")
            ;

            $output .= '<label>';
            $output .= '<input'.$inputAttributes.' />';
            $output .= $this->translate($option->getLabel());
            $output .= '</label>';
        }

        return $output;
    }

    public function getValueAsString(bool $optionsAsValues = true): string
    {
        if (!$optionsAsValues) {
            return $this->getValue();
        }

        foreach ($this->getOptions() as $option) {
            if ($option->isChecked()) {
                return $option->getLabel();
            }
        }

        return '';
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
            'name' => $this->getHandle(),
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
