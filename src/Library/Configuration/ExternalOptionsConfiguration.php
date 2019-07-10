<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Commons\Configurations\BaseConfiguration;

class ExternalOptionsConfiguration extends BaseConfiguration
{
    /** @var int */
    protected $siteId;

    /** @var string */
    protected $labelField;

    /** @var string */
    protected $valueField;

    /** @var int */
    protected $start;

    /** @var int */
    protected $end;

    /** @var string */
    protected $listType;

    /** @var string */
    protected $valueType;

    /** @var string */
    protected $sort;

    /** @var string */
    protected $orderBy;

    /** @var string */
    protected $emptyOption;

    /**
     * @return int|null
     */
    public function getSiteId()
    {
        return $this->castToInt($this->siteId);
    }

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

    /**
     * @return string|null
     */
    public function getOrderBy()
    {
        return $this->orderBy;
    }

    /**
     * @return string|null
     */
    public function getEmptyOption()
    {
        return $this->castToString($this->emptyOption);
    }
}
