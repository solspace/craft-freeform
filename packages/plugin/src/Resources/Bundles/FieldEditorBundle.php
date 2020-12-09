<?php

namespace Solspace\Freeform\Resources\Bundles;

class FieldEditorBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/fields/field-editor.js'];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return ['css/cp/fields/edit.css'];
    }
}
