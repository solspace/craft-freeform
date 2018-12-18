<?php

namespace Solspace\Freeform\Events\Integrations;

use craft\events\CancelableEvent;
use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;

class IntegrationResponseEvent extends CancelableEvent
{
    /** @var AbstractIntegration */
    private $integration;

    /** @var ResponseInterface */
    private $response;

    /**
     * IntegrationResponseEvent constructor.
     *
     * @param AbstractIntegration $integration
     * @param ResponseInterface   $response
     */
    public function __construct(AbstractIntegration $integration, ResponseInterface $response)
    {
        $this->integration = $integration;
        $this->response    = $response;

        parent::__construct();
    }

    /**
     * @return AbstractIntegration
     */
    public function getIntegration(): AbstractIntegration
    {
        return $this->integration;
    }

    /**
     * @return ResponseInterface
     */
    public function getResponse(): ResponseInterface
    {
        return $this->response;
    }

    /**
     * @return string
     */
    public function getResponseBodyAsString(): string
    {
        return (string) $this->getResponse()->getBody();
    }
}
