<?php

namespace Solspace\Freeform\Resources\Bundles;

class BetaBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/beta-feedback/feedback-widget.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/beta/feedback-widget.css'];
    }
}
