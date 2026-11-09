<?php

namespace Solspace\Freeform\Integrations\Other\Google\GooglePlaces;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Library\Integrations\BaseIntegration;

#[Type(
    name: 'Google Places',
    type: Type::TYPE_OTHER,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class GooglePlaces extends BaseIntegration
{
    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Browser API Key',
        instructions: 'Enable Maps JavaScript API and Places API (New) with billing in Google Cloud. Restrict this public browser key to your website domains and these APIs. Environment variables are supported.',
    )]
    protected string $apiKey = '';

    public function getApiKey(): string
    {
        return trim((string) $this->getProcessedValue($this->apiKey));
    }
}
