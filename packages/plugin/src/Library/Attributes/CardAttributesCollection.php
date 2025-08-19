<?php

namespace Solspace\Freeform\Library\Attributes;

class CardAttributesCollection extends Attributes
{
    protected Attributes $fieldset;
    protected Attributes $legend;
    protected Attributes $card;
    protected Attributes $content;
    protected Attributes $imageWrapper;
    protected Attributes $image;
    protected Attributes $cardLabel;
    protected Attributes $cardDescription;

    public function __construct(?array $attributes = [])
    {
        $this->fieldset = new Attributes();
        $this->legend = new Attributes();
        $this->card = new Attributes();
        $this->content = new Attributes();
        $this->imageWrapper = new Attributes();
        $this->image = new Attributes();
        $this->cardLabel = new Attributes();
        $this->cardDescription = new Attributes();

        parent::__construct($attributes ?? []);
    }

    public function getFieldset(): Attributes
    {
        return $this->fieldset;
    }

    public function getLegend(): Attributes
    {
        return $this->legend;
    }

    public function getCard(): Attributes
    {
        return $this->card;
    }

    public function getContent(): Attributes
    {
        return $this->content;
    }

    public function getImageWrapper(): Attributes
    {
        return $this->imageWrapper;
    }

    public function getImage(): Attributes
    {
        return $this->image;
    }

    public function getCardLabel(): Attributes
    {
        return $this->cardLabel;
    }

    public function getCardDescription(): Attributes
    {
        return $this->cardDescription;
    }
}
