<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;

class FormMonitorService extends BaseService
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {}

    public function getStatus(Form $form): array
    {
        $integration = $this->integrationsProvider->getFirstForForm($form, FormMonitor::class);

        $isEnabled = $integration && $integration->isEnabled();

        if ($isEnabled) {
            return [
                'enabled' => true,
            ];
        }

        return [
            'enabled' => false,
        ];
    }
}
