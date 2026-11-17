<?php

namespace Solspace\Freeform\Library\Attributes;

class CardAttributesCollection extends Attributes
{
    protected Attributes $options;
    protected Attributes $card;
    protected Attributes $content;
    protected Attributes $imageWrapper;
    protected Attributes $image;
    protected Attributes $cardLabel;
    protected Attributes $cardDescription;
    protected Attributes $cardMetadata;

    public function __construct(?array $attributes = [])
    {
        $this->options = new Attributes();
        $this->card = new Attributes();
        $this->content = new Attributes();
        $this->imageWrapper = new Attributes();
        $this->image = new Attributes();
        $this->cardLabel = new Attributes();
        $this->cardDescription = new Attributes();
        $this->cardMetadata = new Attributes();

        parent::__construct($attributes ?? []);
    }

    public function getOptions(): Attributes
    {
        return $this->options;
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

    public function getCardMetadata(): Attributes
    {
        return $this->cardMetadata;
    }
}
