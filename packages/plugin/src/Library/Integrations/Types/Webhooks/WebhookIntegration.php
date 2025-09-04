<?php

namespace Solspace\Freeform\Library\Integrations\Types\Webhooks;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\Rules\RulesBasedInterface;
use Solspace\Freeform\Library\Integrations\Rules\RulesTrait;

abstract class WebhookIntegration extends BaseIntegration implements WebhookIntegrationInterface, RulesBasedInterface
{
    use RulesTrait;

    protected const LOG_CATEGORY = 'Webhooks';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Webhook URL',
        instructions: 'The URL to send the POST request to.',
        order: 0,
        placeholder: 'https://example.com/webhook',
    )]
    protected string $url = '';

    public function getUrl(): string
    {
        return $this->getProcessedValue($this->url);
    }
}
