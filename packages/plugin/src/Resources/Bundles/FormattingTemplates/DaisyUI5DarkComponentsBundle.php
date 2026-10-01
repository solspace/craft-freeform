<?php

namespace Solspace\Freeform\Resources\Bundles\FormattingTemplates;

use craft\web\AssetBundle;

class DaisyUI5DarkComponentsBundle extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = '@Solspace/Freeform/templates/_templates/formatting/daisyui-5-dark';

        $this->css = ['_daisyui.css'];

        parent::init();
    }
}
