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
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your API key here.',
    )]
    protected string $apiKey = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Model',
        instructions: 'The OpenAI model to use for AI processing.',
        placeholder: 'gpt-5.6-luna',
    )]
    protected string $model = 'gpt-5.6-luna';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Select(
        label: 'Reasoning Effort',
        instructions: 'Model default leaves the reasoning level to OpenAI. Higher levels can take longer and use more tokens. Overrides require a model that supports the selected level.',
        options: ['default' => 'Model default', 'low' => 'Low', 'medium' => 'Medium', 'high' => 'High', 'xhigh' => 'Extra high', 'max' => 'Maximum'],
    )]
    protected string $reasoningEffort = 'default';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Integer(
        label: 'Max Tokens',
        instructions: 'Maximum tokens for the response, including reasoning and the generated content. Large forms and higher reasoning levels may need a larger allowance.',
        min: 1,
        max: 128000,
    )]
    protected int $maxTokens = 15000;

    public function getReasoningEffort(): ?string
    {
        return 'default' === $this->reasoningEffort ? null : $this->reasoningEffort;
    }

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey) ?? '';
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
