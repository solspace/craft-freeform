<?php

namespace Solspace\Freeform\Library\Database;

use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;

interface IntegrationHandlerInterface
{
    /**
     * @param AbstractIntegration $integration
     * @param ResponseInterface   $response
     */
    public function onAfterResponse(AbstractIntegration $integration, ResponseInterface $response);
}
