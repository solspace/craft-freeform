<?php

namespace Solspace\Freeform\Integrations\AI;

use Solspace\Freeform\Library\Integrations\IntegrationInterface;

interface AiIntegrationInterface extends IntegrationInterface
{
    public function getApiKey(): string;

    public function getModel(): string;

    public function getMaxTokens(): int;

    public function getTemperature(): float;

    public function processAiRequest(string $systemPrompt, string $userContent, array $options = []): string;
}
