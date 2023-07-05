<?php

namespace Solspace\Freeform\Library\Database;

use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Library\Integrations\BaseIntegration;

interface IntegrationHandlerInterface
{
    public function onAfterResponse(BaseIntegration $integration, ResponseInterface $response);
}
