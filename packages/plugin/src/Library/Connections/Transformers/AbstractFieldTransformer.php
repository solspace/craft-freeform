<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;

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
        if ($field instanceof EmailField) {
            return new EmailTransformer($field, $craftFieldHandle);
        }

        if ($field instanceof MultipleValueInterface) {
            return new ArrayTransformer($field, $craftFieldHandle);
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
