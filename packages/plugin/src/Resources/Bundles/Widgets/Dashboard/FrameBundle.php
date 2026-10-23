<?php

namespace Solspace\Freeform\Resources\Bundles\Widgets\Dashboard;

use Solspace\Freeform\Resources\Bundles\AbstractFreeformAssetBundle;

/** Embedded widgets share the host page's authentication UI. */
class FrameBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/widgets/frame.js'];
    }
}
