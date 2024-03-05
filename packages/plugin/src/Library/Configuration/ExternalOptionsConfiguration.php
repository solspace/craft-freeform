<?php

namespace Solspace\Freeform\Library\Configuration;

class ExternalOptionsConfiguration extends BaseConfiguration
{
    protected int $siteId;

    protected string $labelField;

    protected string $valueField;

    protected int $start;

    protected int $end;

    protected string $listType;

    protected string $valueType;

    protected string $sort;

    protected string $orderBy;

    protected string $emptyOption;

    public function getSiteId(): ?int
    {
        return $this->castToInt($this->siteId);
    }

    public function getLabelField(): ?string
    {
        return $this->castToString($this->labelField);
    }

    public function getValueField(): ?string
    {
        return $this->castToString($this->valueField);
    }

    public function getStart(): ?int
    {
        return $this->castToInt($this->start);
    }

    public function getEnd(): ?int
    {
        return $this->castToInt($this->end);
    }

    public function getListType(): ?string
    {
        return $this->castToString($this->listType);
    }

    public function getValueType(): ?string
    {
        return $this->castToString($this->valueType);
    }

    public function getSort(): ?string
    {
        return $this->sort;
    }

    public function getOrderBy(): ?string
    {
        return $this->orderBy;
    }

    public function getEmptyOption(): ?string
    {
        return $this->castToString($this->emptyOption);
    }
}
