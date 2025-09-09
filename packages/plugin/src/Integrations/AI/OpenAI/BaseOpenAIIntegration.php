<?php

namespace Solspace\Freeform\Integrations\AI\OpenAI;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Traits\DefaultTemperatureTrait;
use Solspace\Freeform\Library\Integrations\APIIntegration;

abstract class BaseOpenAIIntegration extends APIIntegration implements AiIntegrationInterface
{
    use DefaultTemperatureTrait;

    public const LOG_CATEGORY = 'OpenAI';

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
        instructions: 'The OpenAI model to use for AI processing.',
        placeholder: 'gpt-5-nano',
    )]
    protected string $model = 'gpt-5-nano';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Integer(
        label: 'Max Tokens',
        instructions: 'Maximum number of tokens to generate.',
        min: 1,
        max: 128000,
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
        // OpenAI usage in this integration does not require temperature
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
