<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;

class StringTransformer extends AbstractFieldTransformer
{
    /**
     * @param Field $targetCraftField
     *
     * @return string|array
     */
    public function transformValueFor(Field $targetCraftField = null)
    {
        $hasOptions = $targetCraftField instanceof BaseOptionsField;
        $hasRelations = $targetCraftField instanceof BaseRelationField;

        $value = $this->getField()->getValueAsString();
        if ($hasOptions || $hasRelations) {
            $value = [$value];
        }

        return $value;
    }
}
