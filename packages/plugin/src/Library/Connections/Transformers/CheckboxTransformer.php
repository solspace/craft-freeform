<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;

class CheckboxTransformer extends AbstractFieldTransformer
{
    public function transformValueFor(Field $targetCraftField = null)
    {
        $hasOptions = $targetCraftField instanceof BaseOptionsField;
        $hasRelations = $targetCraftField instanceof BaseRelationField;

        $value = $this->getField()->getValue();
        if ($value && ($hasOptions || $hasRelations)) {
            $value = [$value];
            $value = array_filter($value);
        }

        return $value;
    }
}
