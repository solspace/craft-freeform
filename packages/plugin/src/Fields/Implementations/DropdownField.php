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
use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Attributes\Property\Input\Hidden;
use Solspace\Freeform\Fields\BaseOptionsField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;

#[Type(
    name: 'Dropdown',
    typeShorthand: 'dropdown',
    iconPath: __DIR__.'/Icons/dropdown.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/dropdown.ejs',
)]
class DropdownField extends BaseOptionsField implements DefaultValueInterface
{
    #[Hidden]
    protected string $defaultValue = '';

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

        $output = '<select'.$attributes.'>';
        foreach ($this->getOptions() as $option) {
            $isChecked = $option->getValue() == $this->getDefaultValue();

            $output .= '<option value="'.$option->getValue().'"'.($isChecked ? ' selected' : '').'>';
            $output .= $this->translate($option->getLabel());
            $output .= '</option>';
        }
        $output .= '</select>';

        return $output;
    }

    public function getValueAsString(bool $optionsAsValues = true): string
    {
        if (!$optionsAsValues) {
            return $this->getValue();
        }

        foreach ($this->getOptions() as $option) {
            if ($option instanceof Option && $option->getValue() === $this->getValue()) {
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
}
