<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\SettingsService;

class FreeformConfig implements \JsonSerializable
{
    private const EXPRESS_LIMIT_FORMS = 1;
    private const EXPRESS_LIMIT_FIELDS = 20;

    private array $config = [];

    public function __construct(SettingsService $settings)
    {
        $plugin = Freeform::getInstance();
        $edition = $plugin->edition();

        $this->config = [
            'templates' => [
                'native' => $settings->getSettingsModel()->defaults->includeSampleTemplates,
            ],
            'limits' => [
                'forms' => $edition->isAtLeast(Freeform::EDITION_LITE) ? 0 : self::EXPRESS_LIMIT_FORMS,
                'fields' => $edition->isAtLeast(Freeform::EDITION_LITE) ? 0 : self::EXPRESS_LIMIT_FIELDS,
            ],
            'editions' => [
                'edition' => $plugin->edition,
                'tiers' => $plugin->edition()->getEditions(),
            ],
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->config;
    }
}
