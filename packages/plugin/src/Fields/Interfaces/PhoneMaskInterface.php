<?php

namespace Solspace\Freeform\Fields\Interfaces;

interface PhoneMaskInterface
{
    public function isUseJsMask(): bool;

    /**
     * @return null|string
     */
    public function getPattern();
}
