<?php

namespace Solspace\Freeform\Resources\Bundles;

/**
 * Compatibility styling for Freeform's legacy Twig and React CP screens.
 */
class Craft6CpBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/scripts/cp/craft6/boolean-menu.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            'css/cp/craft6.css',
        ];
    }
}
