<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;

class DateTransformer extends AbstractFieldTransformer
{
    public function transformValueFor(Field $targetCraftField = null)
    {
        $hasOptions = $targetCraftField instanceof BaseOptionsField;
        $hasRelations = $targetCraftField instanceof BaseRelationField;

        $value = $this->getField()->getCarbon();
        if ($hasOptions || $hasRelations) {
            $value = [$value];
            $value = array_filter($value);
        }

        return $value;
    }
}
