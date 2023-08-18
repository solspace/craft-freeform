<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\base\ElementInterface;
use craft\elements\db\ElementQuery;

class ElementHelper
{
    public static function extractFieldValue(ElementInterface $element, string|int $field): mixed
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

        return $value;
    }
}
