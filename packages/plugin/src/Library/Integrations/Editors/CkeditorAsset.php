<?php

namespace Solspace\Freeform\Library\Integrations\Editors;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class CkeditorAsset extends BaseCkeditorPackageAsset
{
    public array $pluginNames = ['FreeformForm'];
    public array $toolbarItems = ['freeformForm'];
    public string $namespace = '@solspace/ckeditor5-freeform';

    public function init(): void
    {
        $this->sourcePath = __DIR__.'/assets';
        $this->publishOptions['forceCopy'] = \Craft::$app->getConfig()->getGeneral()->devMode;
        $this->depends = [PickerAsset::class];
        parent::init();
    }
}
