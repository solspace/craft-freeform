<?php

namespace Solspace\Freeform\Integrations\AI\SolspaceAI;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Traits\DefaultTemperatureTrait;
use Solspace\Freeform\Library\Integrations\APIIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;

abstract class BaseSolspaceAIIntegration extends APIIntegration implements AiIntegrationInterface
{
    use DefaultTemperatureTrait;
    use EnabledByDefaultTrait;

    public const LOG_CATEGORY = 'SolspaceAI';

    public const CATEGORY_AI = 'ai';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $apiKey = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $apiBaseUrl = 'https://ai.solspace.net/v1';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $model = 'smollm2';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Contact Email',
        instructions: 'Email address for your Solspace AI account. Used when enabling AI. Can be set via environment variable.',
        placeholder: 'you@example.com',
    )]
    protected string $contactEmail = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Site URL',
        instructions: 'The public URL of your site (e.g. https://yoursite.com). Used when enabling AI. Can be set via environment variable.',
        placeholder: 'https://yoursite.com',
    )]
    protected string $siteUrl = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Integer(
        label: 'Max Tokens',
        instructions: 'Maximum number of tokens to generate.',
        min: 1,
        max: 128000,
    )]
    protected int $maxTokens = 4096;

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function setApiKey(string $apiKey): self
    {
        $this->apiKey = $apiKey;

        return $this;
    }

    public function getApiBaseUrl(): string
    {
        return $this->getProcessedValue($this->apiBaseUrl);
    }

    public function getModel(): string
    {
        return $this->getProcessedValue($this->model) ?: 'smollm2';
    }

    public function getMaxTokens(): int
    {
        return $this->maxTokens;
    }

    public function getContactEmail(): string
    {
        return trim($this->getProcessedValue($this->contactEmail) ?? '');
    }

    public function getSiteUrl(): string
    {
        return trim($this->getProcessedValue($this->siteUrl) ?? '');
    }

    public function getTemperature(): ?float
    {
        return null;
    }

    protected function getProcessableFields(string $category): array
    {
        $indexed = [];
        foreach ($this->fetchFields($category) as $field) {
            $indexed[$field->getHandle()] = $field;
        }

        return $indexed;
    }
}
