<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;

class FormIntegrationsProvider
{
    public function __construct(
        private IntegrationsService $integrationsService
    ) {
    }

    /**
     * @return IntegrationInterface[]
     */
    public function getForForm(?Form $form = null, ?string $type = null): array
    {
        return $this->integrationsService->getForForm($form, $type);
    }
}
