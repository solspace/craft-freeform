<?php

namespace Solspace\Freeform\Library\Integrations;

use GuzzleHttp\Client;

interface APIIntegrationInterface extends IntegrationInterface
{
    public const EVENT_PROCESS_VALUE = 'process-value';

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(Client $client): bool;

    public function getApiRootUrl(): string;
}
