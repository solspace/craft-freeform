<?php

namespace Solspace\Freeform\Library\Resources;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

abstract class CpAssetBundle extends AssetBundle
{
    final public function init(): void
    {
        $this->sourcePath = $this->getSourcePath();
        $this->depends = [CpAsset::class];

        $this->js = $this->getScripts();
        $this->css = $this->getStylesheets();

        parent::init();
    }

    public function getScripts(): array
    {
        return [];
    }

    public function getStylesheets(): array
    {
        return [];
    }

    abstract protected function getSourcePath(): string;
}
