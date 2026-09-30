<?php

namespace Solspace\Freeform\Resources\Bundles\FormattingTemplates;

use craft\web\AssetBundle;

class DaisyUI5Bundle extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = '@Solspace/Freeform/templates/_templates/formatting/daisyui-5-light';

        $this->css = ['_theme-light.css', '_theme-dark.css', '_daisyui.css', '_main.css'];
        $this->js = ['_main.js'];

        parent::init();
    }
}
