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
     * @return null|int
     */
    public function getSiteId()
    {
        return $this->castToInt($this->siteId);
    }

    /**
     * @return null|string
     */
    public function getLabelField()
    {
        return $this->castToString($this->labelField);
    }

    /**
     * @return null|string
     */
    public function getValueField()
    {
        return $this->castToString($this->valueField);
    }

    /**
     * @return null|int
     */
    public function getStart()
    {
        return $this->castToInt($this->start);
    }

    /**
     * @return null|int
     */
    public function getEnd()
    {
        return $this->castToInt($this->end);
    }

    /**
     * @return null|string
     */
    public function getListType()
    {
        return $this->castToString($this->listType);
    }

    /**
     * @return null|string
     */
    public function getValueType()
    {
        return $this->castToString($this->valueType);
    }

    /**
     * @return null|string
     */
    public function getSort()
    {
        return $this->sort;
    }

    /**
     * @return null|string
     */
    public function getOrderBy()
    {
        return $this->orderBy;
    }

    /**
     * @return null|string
     */
    public function getEmptyOption()
    {
        return $this->castToString($this->emptyOption);
    }
}
