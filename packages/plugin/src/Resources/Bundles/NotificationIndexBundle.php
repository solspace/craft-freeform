<?php

namespace Solspace\Freeform\Resources\Bundles;

class NotificationIndexBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/scripts/cp/notifications/index.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            'css/shared/fonts.css',
            'css/cp/notifications/index.css',
        ];
    }
}
