<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use Solspace\Commons\Helpers\StringHelper;

abstract class AbstractFormRenderObject implements FormRenderObjectInterface
{
    /** @var mixed */
    private $value;

    /** @var array */
    private $replacements;

    /**
     * AbstractFormRenderObject constructor.
     *
     * @param mixed $value
     * @param array $replacements
     */
    public function __construct($value, array $replacements = [])
    {
        $this->value        = $value;
        $this->replacements = $replacements;
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        return StringHelper::replaceValues($this->value, $this->replacements);
    }
}
