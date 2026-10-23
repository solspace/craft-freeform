<?php

namespace Solspace\Freeform\Library\Attributes;

class LocationAttributesCollection extends Attributes
{
    protected Attributes $wrapper;
    protected Attributes $searchContainer;
    protected Attributes $searchInput;
    protected Attributes $searchLabel;
    protected Attributes $searchIcon;
    protected Attributes $components;
    protected Attributes $componentContainer;
    protected Attributes $componentInput;
    protected Attributes $componentLabel;

    public function __construct(array $attributes = [])
    {
        $this->wrapper = new Attributes(['class' => 'freeform-location']);
        $this->searchContainer = new Attributes(['class' => 'freeform-location-search']);
        $this->searchInput = new Attributes();
        $this->searchLabel = new Attributes();
        $this->searchIcon = new Attributes(['class' => 'freeform-location-search-icon']);
        $this->components = new Attributes(['class' => 'freeform-location-components']);
        $this->componentContainer = new Attributes(['class' => 'freeform-location-component']);
        $this->componentInput = new Attributes();
        $this->componentLabel = new Attributes();
        parent::__construct($attributes);
    }

    public function getWrapper(): Attributes
    {
        return $this->wrapper;
    }

    public function getSearchContainer(): Attributes
    {
        return $this->searchContainer;
    }

    public function getSearchInput(): Attributes
    {
        return $this->searchInput;
    }

    public function getSearchLabel(): Attributes
    {
        return $this->searchLabel;
    }

    public function getSearchIcon(): Attributes
    {
        return $this->searchIcon;
    }

    public function getComponents(): Attributes
    {
        return $this->components;
    }

    public function getComponentContainer(): Attributes
    {
        return $this->componentContainer;
    }

    public function getComponentInput(): Attributes
    {
        return $this->componentInput;
    }

    public function getComponentLabel(): Attributes
    {
        return $this->componentLabel;
    }
}
