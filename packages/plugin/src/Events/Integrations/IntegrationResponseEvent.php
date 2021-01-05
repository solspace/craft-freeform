<?php

namespace Solspace\Freeform\Events\Integrations;

use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;

class IntegrationResponseEvent extends CancelableArrayableEvent
{
    /** @var AbstractIntegration */
    private $integration;

    /** @var ResponseInterface */
    private $response;

    /**
     * IntegrationResponseEvent constructor.
     */
    public function __construct(AbstractIntegration $integration, ResponseInterface $response)
    {
        $this->integration = $integration;
        $this->response = $response;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['integration', 'response']);
    }

    public function getIntegration(): AbstractIntegration
    {
        return $this->integration;
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
