<?php

namespace Solspace\Freeform\Resources\Bundles\Pro;

use Solspace\Freeform\Resources\Bundles\AbstractFreeformAssetBundle;

class WebhooksBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/webhooks/edit.js'];
    }
}
