<?php

namespace Solspace\Freeform\Library\Integrations;

use craft\web\AssetBundle;

class IntegrationIconsAsset extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = __DIR__.'/assets';
        $this->publishOptions = ['forceCopy' => \Craft::$app->getConfig()->getGeneral()->devMode];
        parent::init();
    }
}
