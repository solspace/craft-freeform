<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\models\Site;
use Solspace\Freeform\Freeform;

class SitesHelper
{
    public static function getCurrentCpSite(): ?Site
    {
        if (!self::isEnabled()) {
            return null;
        }

        $site = null;

        $query = \Craft::$app->request->getQueryParam('site');
        if ($query) {
            $site = \Craft::$app->sites->getSiteByHandle($query);
        }

        if (!$site) {
            $site = \Craft::$app->sites->getCurrentSite();
        }

        return $site;
    }

    public static function getCurrentCpPageSiteId(): ?int
    {
        return self::getCurrentCpSite()?->id;
    }

    public static function getCurrentCpPageSiteHandle(): ?string
    {
        return self::getCurrentCpSite()?->handle;
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
        $sites = \Craft::$app->sites->getEditableSites();

        return array_map(
            fn ($site) => $site->handle,
            $sites
        );
    }

    public static function getEditableSiteIds(): ?array
    {
        $sites = \Craft::$app->sites->getEditableSites();

        return array_map(
            fn ($site) => $site->id,
            $sites
        );
    }

    public static function isEnabled(): bool
    {
        return Freeform::getInstance()->settings->getSettingsModel()->sitesEnabled;
    }
}
