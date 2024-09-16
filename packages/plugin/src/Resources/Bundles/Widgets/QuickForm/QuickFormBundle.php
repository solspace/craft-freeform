<?php

namespace Solspace\Freeform\Resources\Bundles\Widgets\QuickForm;

use Solspace\Freeform\Resources\Bundles\AbstractFreeformAssetBundle;

class QuickFormBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/widgets/quick-form.css'];
    }
}
