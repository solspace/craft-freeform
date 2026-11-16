<?php

namespace Solspace\Freeform\Resources\Bundles;

class ActivityBadgeBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/activity/badge.js'];
    }
}
