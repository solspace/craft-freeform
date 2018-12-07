<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields\Interfaces;

interface PhoneMaskInterface
{
    /**
     * @return bool
     */
    public function isUseJsMask(): bool;

    /**
     * @return string|null
     */
    public function getPattern();
}
