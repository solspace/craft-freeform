<?php

namespace Solspace\Freeform\Resources\Bundles\FormattingTemplates;

use craft\web\AssetBundle;

class DaisyUI5DarkBundle extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = '@Solspace/Freeform/templates/_templates/formatting/daisyui-5-dark';

        $this->css = ['_theme-dark.css', '_daisyui.css', '_steps.css', '_card.css', '_main.css'];
        $this->js = ['_main.js'];

        parent::init();
    }
}
