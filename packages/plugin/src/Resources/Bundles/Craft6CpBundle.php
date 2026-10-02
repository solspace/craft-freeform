<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\events\TemplateEvent;
use craft\web\View;
use CraftCms\Cms\Twig\Extensions\CpExtension;
use Solspace\Freeform\Library\Resources\Craft6CpAssets;

use function CraftCms\Cms\craftAsset;

/**
 * Compatibility styling for Freeform's legacy Twig and React CP screens.
 */
class Craft6CpBundle extends AbstractFreeformAssetBundle
{
    public function registerAssetFiles($view): void
    {
        parent::registerAssetFiles($view);

        $view->on(View::EVENT_AFTER_RENDER_PAGE_TEMPLATE, static function (TemplateEvent $event): void {
            if (View::TEMPLATE_MODE_CP !== $event->templateMode) {
                return;
            }

            $assets = (new CpExtension())->vite(['resources/css/cp.css', 'resources/js/legacy.ts']);
            $event->output = Craft6CpAssets::moveToHead($event->output, $assets);
        });
    }

    public function getScripts(): array
    {
        return [
            'js/scripts/cp/craft6/shell.js',
            'js/scripts/cp/craft6/navigation.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            craftAsset('legacy/tailwindreset/dist/css/tailwind_reset.css'),
            'css/cp/craft6.css',
        ];
    }
}
