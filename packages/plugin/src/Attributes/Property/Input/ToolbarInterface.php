<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Implementations\Toolbar\ToolbarConfigurationInterface;

/**
 * @property array|bool|string|ToolbarConfigurationInterface $toolbar
 */
interface ToolbarInterface
{
    public function setToolbar(array|bool|string|ToolbarConfigurationInterface $toolbar): void;

    public function getToolbar(): array|bool|string|ToolbarConfigurationInterface;
}
