<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories;

interface CategoryInterface
{
    public function getLabel(): string;

    public function isDelimited(): bool;

    public function isEnabled(): bool;
}
