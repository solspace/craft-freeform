<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;

abstract class AbstractFieldTransformer implements TransformerInterface
{
    /**
     * @param AbstractField $field
     * @param string        $craftFieldHandle
     *
     * @return AbstractFieldTransformer
     */
    public static function create(AbstractField $field, string $craftFieldHandle): AbstractFieldTransformer
    {
        if ($field instanceof EmailField) {
            return new EmailTransformer($field, $craftFieldHandle);
        }

        if ($field instanceof MultipleValueInterface) {
            return new ArrayTransformer($field, $craftFieldHandle);
        }

        return new StringTransformer($field, $craftFieldHandle);
    }

    /** @var AbstractField */
    private $field;

    /** @var string */
    private $craftFieldHandle;

    /**
     * AbstractFieldTransformer constructor.
     *
     * @param AbstractField $field
     * @param string        $craftFieldHandle
     */
    public function __construct(AbstractField $field, string $craftFieldHandle)
    {
        $this->field            = $field;
        $this->craftFieldHandle = $craftFieldHandle;
    }

    /**
     * @return AbstractField
     */
    public function getField(): AbstractField
    {
        return $this->field;
    }

    /**
     * @return string
     */
    public function getCraftFieldHandle(): string
    {
        return $this->craftFieldHandle;
    }
}
