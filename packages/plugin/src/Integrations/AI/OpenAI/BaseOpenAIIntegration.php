<?php

namespace Solspace\Freeform\Integrations\AI\OpenAI;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Library\Integrations\APIIntegration;

abstract class BaseOpenAIIntegration extends APIIntegration implements AiIntegrationInterface
{
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
        placeholder: 'gpt-5-mini',
    )]
    protected string $model = 'gpt-5-mini';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Integer(
        label: 'Max Tokens',
        instructions: 'Maximum number of tokens to generate.',
        min: 1,
        max: 4000,
    )]
    protected int $maxTokens = 150;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Temperature',
        instructions: 'Controls randomness in the response (0.0 = deterministic, 1.0 = very random). Enter a value between 0.0 and 1.0.',
        placeholder: '0.7',
    )]
    protected string $temperature = '0.7';

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

    public function getTemperature(): float
    {
        $temp = (float) $this->temperature;

        // Validate and clamp to valid range
        if ($temp < 0.0) {
            return 0.0;
        }
        if ($temp > 2.0) {
            return 2.0;
        }

        return $temp;
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
