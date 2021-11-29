<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use craft\fields\BaseOptionsField;
use craft\fields\BaseRelationField;

class DirectValueTransformer implements TransformerInterface
{
    private $value;

    /** @var string */
    private $craftFieldHandle;

    public function __construct($value, string $craftFieldHandle)
    {
        $this->value = $value;
        $this->craftFieldHandle = $craftFieldHandle;
    }

    public function getCraftFieldHandle(): string
    {
        return $this->craftFieldHandle;
    }

    public function transformValueFor(Field $targetCraftField = null)
    {
        $hasOptions = $targetCraftField instanceof BaseOptionsField;
        $hasRelations = $targetCraftField instanceof BaseRelationField;

        $value = $this->value;
        if ($hasOptions || $hasRelations) {
            $value = [$value];
            $value = array_filter($value);
        }

        return $value;
    }
}
