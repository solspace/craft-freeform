<?php

namespace Solspace\Freeform\Resources\Bundles;

use Solspace\Freeform\Freeform;

class FreeformClientBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [];
    }

    public function getStylesheets(): array
    {
        return [
            'css/shared/fonts.css',
            'https://kit.fontawesome.com/0e31cd79e9.css',
        ];
    }

    public function registerAssetFiles($view): void
    {
        $this->publish($view->getAssetManager());

        parent::registerAssetFiles($view);

        Freeform::getInstance()->clientAssets->registerAssets(
            $view,
            $this->baseUrl,
            $this->sourcePath
        );
    }
}
