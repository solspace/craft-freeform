<?php

namespace Solspace\Freeform\Resources\Bundles;

use function CraftCms\Cms\craftAsset;

/**
 * Compatibility styling for Freeform's legacy Twig and React CP screens.
 */
class Craft6CpBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/scripts/cp/craft6/shell.js',
            'js/scripts/cp/craft6/navigation.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            craftAsset('legacy/tailwindreset/dist/css/tailwind_reset.css'),
            'css/cp/craft6.css',
        ];
    }
}
