<?php

namespace Solspace\Freeform\Resources\Bundles;

class NotificationIndexBundle extends AbstractFreeformAssetBundle
{
    public function registerAssetFiles($view): void
    {
        parent::registerAssetFiles($view);

        $view->registerTranslations('freeform', [
            'Are you sure you want to delete "{name}"?',
            'Could not duplicate this template.',
            'Could not delete this template.',
        ]);
    }

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
