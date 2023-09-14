<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\SettingsService;

class FreeformConfig implements \JsonSerializable
{
    private array $config = [];

    public function __construct(SettingsService $settings)
    {
        $plugin = Freeform::getInstance();

        $this->config = [
            'templates' => [
                'native' => (bool) $settings->getSettingsModel()->defaultTemplates,
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
