<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class FieldEditorBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/field-editor.js'];
    }

    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/field-editor.css'];
    }
}
