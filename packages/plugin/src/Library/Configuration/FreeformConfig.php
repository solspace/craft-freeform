<?php

namespace Solspace\Freeform\Library\Configuration;

use craft\models\Site;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Services\SettingsService;

class FreeformConfig implements \JsonSerializable
{
    private const EXPRESS_LIMIT_FORMS = 1;
    private const EXPRESS_LIMIT_FIELDS = 20;

    private array $config = [];

    public function __construct(SettingsService $settings)
    {
        $plugin = Freeform::getInstance();
        $settingsModel = $settings->getSettingsModel();
        $edition = $plugin->edition();

        $currentSiteId = SitesHelper::getCurrentCpPageSiteId();
        $sites = \Craft::$app->sites->getAllSites();

        $this->config = [
            'templates' => [
                'native' => (bool) $settingsModel->defaults->includeSampleTemplates,
            ],
            'feed' => (bool) $settingsModel->displayFeed,
            'limits' => [
                'forms' => $edition->isAtLeast(Freeform::EDITION_LITE) ? 0 : self::EXPRESS_LIMIT_FORMS,
                'fields' => $edition->isAtLeast(Freeform::EDITION_LITE) ? 0 : self::EXPRESS_LIMIT_FIELDS,
            ],
            'metadata' => [
                'craft' => [
                    'is5' => version_compare(\Craft::$app->version, '5.0.0', '>='),
                    'version' => \Craft::$app->version,
                ],
                'freeform' => [
                    'version' => $plugin->getVersion(),
                ],
            ],
            'editions' => [
                'edition' => $plugin->edition,
                'tiers' => $plugin->edition()->getEditions(),
            ],
            'sites' => [
                'enabled' => $settingsModel->sitesEnabled,
                'current' => $currentSiteId,
                'list' => array_map(
                    fn (Site $site) => [
                        'id' => $site->id,
                        'name' => $site->name,
                        'handle' => $site->handle,
                    ],
                    $sites,
                ),
            ],
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->config;
    }
}
