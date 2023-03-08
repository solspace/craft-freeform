<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Interfaces\MultipleValueInterface;

abstract class AbstractFieldTransformer implements TransformerInterface
{
    /** @var AbstractField */
    private $field;

    /** @var string */
    private $craftFieldHandle;

    /**
     * AbstractFieldTransformer constructor.
     */
    public function __construct(AbstractField $field, string $craftFieldHandle)
    {
        $this->field = $field;
        $this->craftFieldHandle = $craftFieldHandle;
    }

    public static function create(AbstractField $field, string $craftFieldHandle): self
    {
        if ($field instanceof MultipleValueInterface) {
            return new ArrayTransformer($field, $craftFieldHandle);
        }

        if ($field instanceof DatetimeField) {
            return new DateTransformer($field, $craftFieldHandle);
        }

        return new StringTransformer($field, $craftFieldHandle);
    }

    public function getField(): AbstractField
    {
        return $this->field;
    }

    public function getCraftFieldHandle(): string
    {
        return $this->craftFieldHandle;
    }
}
