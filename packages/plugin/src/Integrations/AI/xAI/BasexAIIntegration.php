<?php

namespace Solspace\Freeform\Integrations\AI\xAI;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Traits\DefaultTemperatureTrait;
use Solspace\Freeform\Library\Integrations\APIIntegration;

abstract class BasexAIIntegration extends APIIntegration implements AiIntegrationInterface
{
    use DefaultTemperatureTrait;

    public const LOG_CATEGORY = 'xAI';

    public const CATEGORY_AI = 'ai';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your API key here.',
    )]
    protected string $apiKey = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Model',
        instructions: 'The xAI model to use for AI processing.',
        placeholder: 'grok-3-mini',
    )]
    protected string $model = 'grok-3-mini';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Integer(
        label: 'Max Tokens',
        instructions: 'Maximum number of tokens to generate.',
        min: 1,
        max: 256000,
    )]
    protected int $maxTokens = 15000;

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function getModel(): string
    {
        return $this->model;
    }

    public function getMaxTokens(): int
    {
        return $this->maxTokens;
    }

    public function getTemperature(): ?float
    {
        // xAI integration does not use temperature by default
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
