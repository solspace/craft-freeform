<?php

namespace Solspace\Freeform\Fields\Properties\Cards;

class Card
{
    public string $label;
    public string $value;
    public string $description;
    public ?int $assetId;
    public array $metadata = [];
}
