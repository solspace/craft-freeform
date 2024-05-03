<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Freeform;

class SitesHelper
{
    public static function getCurrentCpPageSiteHandle(): ?string
    {
        $isEnabled = Freeform::getInstance()->settings->getSettingsModel()->sitesEnabled;
        if (!$isEnabled) {
            return null;
        }

        $query = \Craft::$app->request->getQueryParam('site');
        $server = \Craft::$app->sites->getCurrentSite()->handle;

        return $query ?? $server;
    }
}
