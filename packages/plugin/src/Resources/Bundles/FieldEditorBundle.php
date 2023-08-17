<?php

namespace Solspace\Freeform\Resources\Bundles;

class FieldEditorBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/fields/field-editor.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/fields/edit.css'];
    }
}
