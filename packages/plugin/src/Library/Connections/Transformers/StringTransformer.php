<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\OptionsInterface;

class StringTransformer extends AbstractFieldTransformer
{
    /**
     * @param Field $targetCraftField
     *
     * @return array|string
     */
    public function transformValueFor(Field $targetCraftField = null)
    {
        $hasOptions = $targetCraftField instanceof BaseOptionsField;
        $hasRelations = $targetCraftField instanceof BaseRelationField;

        $field = $this->getField();
        $value = $field->getValueAsString(!$field instanceof OptionsInterface);
        if ($hasOptions || $hasRelations) {
            $value = [$value];
            $value = array_filter($value);
        }

        return $value;
    }
}
