<?php

namespace Solspace\Freeform\Library\Integrations\Editors;

use craft\web\AssetBundle;
use verbb\vizy\web\assets\field\VizyAsset as VizyFieldAsset;

class VizyAsset extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = __DIR__.'/assets';
        $this->publishOptions['forceCopy'] = \Craft::$app->getConfig()->getGeneral()->devMode;
        $this->depends = [PickerAsset::class, VizyFieldAsset::class];
        $this->js = ['vizy.js'];
        parent::init();
    }
}
