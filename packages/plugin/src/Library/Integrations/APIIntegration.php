<?php

namespace Solspace\Freeform\Library\Integrations;

abstract class APIIntegration extends BaseIntegration implements APIIntegrationInterface
{
    /**
     * Returns a combined URL of api root + endpoint.
     */
    protected function getEndpoint(string $endpoint): string
    {
        $root = rtrim($this->getApiRootUrl(), '/');
        $endpoint = ltrim($endpoint, '/');

        return "{$root}/{$endpoint}";
    }
}
