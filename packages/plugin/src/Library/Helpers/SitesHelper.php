<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Freeform;

class SitesHelper
{
    public static function getCurrentCpPageSiteHandle(): ?string
    {
        if (!self::isEnabled()) {
            return null;
        }

        $query = \Craft::$app->request->getQueryParam('site');
        $server = \Craft::$app->sites->getCurrentSite()->handle;

        return $query ?? $server;
    }

    public static function getFrontendSiteHandle(): ?string
    {
        if (!self::isEnabled()) {
            return null;
        }

        return \Craft::$app->sites->getCurrentSite()->handle;
    }

    public static function getSiteHandlesForFrontend(): ?array
    {
        if (!self::isEnabled()) {
            return null;
        }

        return [self::getFrontendSiteHandle()];
    }

    public static function getEditableSiteHandles(): ?array
    {
        if (!self::isEnabled()) {
            return null;
        }

        $sites = \Craft::$app->sites->getEditableSites();

        return array_map(
            fn ($site) => $site->handle,
            $sites
        );
    }

    public static function isEnabled(): bool
    {
        return Freeform::getInstance()->settings->getSettingsModel()->sitesEnabled;
    }
}
