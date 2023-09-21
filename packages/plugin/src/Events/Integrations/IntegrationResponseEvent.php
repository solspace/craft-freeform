<?php

namespace Solspace\Freeform\Events\Integrations;

use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class IntegrationResponseEvent extends CancelableArrayableEvent
{
    public function __construct(
        private IntegrationInterface $integration,
        private string $category,
        private ResponseInterface $response
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return array_merge(
            parent::fields(),
            [
                'integration',
                'category',
                'response',
            ],
        );
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function getResponse(): ResponseInterface
    {
        return $this->response;
    }

    public function getResponseBodyAsString(): string
    {
        return (string) $this->getResponse()->getBody();
    }
}
