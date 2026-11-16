<?php

namespace Solspace\Freeform\Resources\Bundles\Widgets\QuickForm;

use Solspace\Freeform\Resources\Bundles\AbstractFreeformAssetBundle;

class QuickFormBundle extends AbstractFreeformAssetBundle
{
    public function registerAssetFiles($view): void
    {
        parent::registerAssetFiles($view);

        $view->registerTranslations('app', [
            'Add',
            'Add a row',
            'Remove row',
            'Row actions',
        ]);
    }

    public function getScripts(): array
    {
        return ['js/scripts/cp/widgets/quick-form.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/widgets/quick-form.css'];
    }
}
