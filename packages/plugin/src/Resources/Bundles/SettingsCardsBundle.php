<?php

namespace Solspace\Freeform\Resources\Bundles;

/** Shared illustrated choices and contextual helpers for complex CP settings. */
class SettingsCardsBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/settings-cards/index.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/settings-cards/settings-cards.css'];
    }
}
