<?php

namespace Solspace\Freeform\Resources\Bundles\Widgets\Dashboard;

use Solspace\Freeform\Resources\Bundles\AbstractFreeformAssetBundle;

/** Embedded widgets share the host page's authentication UI. */
class FrameBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return ['css/cp/widgets/disclosure-select.css'];
    }

    public function getScripts(): array
    {
        return ['js/scripts/cp/widgets/frame.js'];
    }
}
