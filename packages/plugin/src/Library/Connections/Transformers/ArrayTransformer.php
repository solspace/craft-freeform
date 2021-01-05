<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;

class ArrayTransformer extends AbstractFieldTransformer
{
    /**
     * @param Field $targetCraftField
     *
     * @return string
     */
    public function transformValueFor(Field $targetCraftField = null)
    {
        $value = $this->getField()->getValue();

        $hasOptions = $targetCraftField instanceof BaseOptionsField;
        $hasRelations = $targetCraftField instanceof BaseRelationField;
        if (null === $targetCraftField || (!$hasOptions && !$hasRelations)) {
            $value = reset($value);
        }

        return $value;
    }
}
