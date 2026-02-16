<?php

namespace Solspace\Freeform\Integrations\AI\SolspaceAI;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Traits\DefaultTemperatureTrait;
use Solspace\Freeform\Library\Integrations\APIIntegration;

abstract class BaseSolspaceAIIntegration extends APIIntegration implements AiIntegrationInterface
{
    use DefaultTemperatureTrait;

    public const LOG_CATEGORY = 'SolspaceAI';

    public const CATEGORY_AI = 'ai';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Your SolspaceAI (LiteLLM proxy) master key or virtual key.',
    )]
    protected string $apiKey = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'API Base URL',
        instructions: 'Base URL of your LiteLLM proxy (e.g. http://localhost:4000 or https://your-proxy.example.com). Do not include /v1.',
        placeholder: 'http://localhost:4000',
    )]
    protected string $apiBaseUrl = 'http://localhost:4000';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Model',
        instructions: 'The model name configured in your proxy (e.g. smollm2).',
        placeholder: 'smollm2',
    )]
    protected string $model = 'smollm2';

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

    public function getApiBaseUrl(): string
    {
        return rtrim($this->getProcessedValue($this->apiBaseUrl) ?: 'http://localhost:4000', '/');
    }

    public function getModel(): string
    {
        return $this->getProcessedValue($this->model) ?: 'smollm2';
    }

    public function getMaxTokens(): int
    {
        return $this->maxTokens;
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
