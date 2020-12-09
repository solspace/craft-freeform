<?php

namespace Solspace\Freeform\Library\Database;

use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;

interface IntegrationHandlerInterface
{
    public function onAfterResponse(AbstractIntegration $integration, ResponseInterface $response);
}
