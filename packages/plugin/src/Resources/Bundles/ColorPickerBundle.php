<?php

namespace Solspace\Freeform\Resources\Bundles;

class ColorPickerBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return ['css/cp/color-picker/color-picker.css'];
    }
}
