<?php

namespace Solspace\Freeform\Resources\Bundles\FormattingTemplates;

use craft\web\AssetBundle;

class DaisyUI5LightComponentsBundle extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = '@Solspace/Freeform/templates/_templates/formatting/daisyui-5-light';

        $this->css = ['_daisyui.css'];

        parent::init();
    }
}
