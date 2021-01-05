<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;

class EmailTransformer extends AbstractFieldTransformer
{
    /**
     * @param Field $targetCraftField
     */
    public function transformValueFor(Field $targetCraftField = null): string
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
