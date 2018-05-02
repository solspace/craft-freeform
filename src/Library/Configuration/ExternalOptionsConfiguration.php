<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Commons\Configurations\BaseConfiguration;

class ExternalOptionsConfiguration extends BaseConfiguration
{
    protected $labelField;
    protected $valueField;
    protected $start;
    protected $end;
    protected $listType;
    protected $valueType;
    protected $sort;

    /**
     * @return string|null
     */
    public function getLabelField()
    {
        return $this->castToString($this->labelField);
    }

    /**
     * @return string|null
     */
    public function getValueField()
    {
        return $this->castToString($this->valueField);
    }

    /**
     * @return int|null
     */
    public function getStart()
    {
        return $this->castToInt($this->start);
    }

    /**
     * @return int|null
     */
    public function getEnd()
    {
        return $this->castToInt($this->end);
    }

    /**
     * @return string|null
     */
    public function getListType()
    {
        return $this->castToString($this->listType);
    }

    /**
     * @return string|null
     */
    public function getValueType()
    {
        return $this->castToString($this->valueType);
    }

    /**
     * @return string|null
     */
    public function getSort()
    {
        return $this->sort;
    }
}