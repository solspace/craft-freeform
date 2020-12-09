<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields\Interfaces;

interface PhoneMaskInterface
{
    public function isUseJsMask(): bool;

    /**
     * @return null|string
     */
    public function getPattern();
}
