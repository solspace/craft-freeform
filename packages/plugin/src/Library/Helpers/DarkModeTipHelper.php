<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\helpers\UrlHelper;

class DarkModeTipHelper
{
    public const DISMISSED_PREFERENCE = 'freeform:darkModeTipDismissed';

    public static function getConfig(): array
    {
        $user = \Craft::$app->getUser()->getIdentity();

        return [
            'visible' => self::isVisible(
                \Craft::$app->getVersion(),
                (bool) $user?->admin,
                \Craft::$app->getPlugins()->isPluginInstalled('darkmode'),
                (bool) $user?->getPreference(self::DISMISSED_PREFERENCE),
            ),
            'userKey' => (string) ($user?->id ?? ''),
            'dismissUrl' => UrlHelper::actionUrl('freeform/settings/dismiss-dark-mode-tip'),
        ];
    }

    public static function isVisible(string $craftVersion, bool $admin, bool $installed, bool $dismissed): bool
    {
        return version_compare($craftVersion, '5.9', '>=')
            && version_compare($craftVersion, '6.0', '<')
            && $admin && !$installed && !$dismissed;
    }
}
