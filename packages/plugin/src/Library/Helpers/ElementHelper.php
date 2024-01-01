<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\base\ElementInterface;
use craft\elements\db\ElementQuery;
use craft\fields\data\MultiOptionsFieldData;

class ElementHelper
{
    public static function extractFieldValue(ElementInterface $element, int|string $field): mixed
    {
        $value = null;
        if (!is_numeric($field)) {
            $value = $element->{$field};
        } else {
            $field = (int) $field;
            $customFields = $element->getFieldLayout()->getCustomFields();
            foreach ($customFields as $customField) {
                if ($customField->id === $field) {
                    $value = $element->getFieldValue($customField->handle);
                }
            }
        }

        if ($value instanceof ElementInterface) {
            return $value->title;
        }

        if ($value instanceof ElementQuery) {
            return $value->one()?->title;
        }

        if ($value instanceof MultiOptionsFieldData) {
            $options = $value->getOptions();

            $values = [];
            foreach ($options as $option) {
                if ($option->selected) {
                    $values[] = $option->label ?: $option->value;
                }
            }

            return implode(', ', $values);
        }

        if (\is_object($value)) {
            return (string) $value;
        }

        return $value;
    }
}
