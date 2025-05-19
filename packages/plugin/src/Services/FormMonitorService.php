<?php

namespace Solspace\Freeform\Services;

use GuzzleHttp\Exception\ConnectException;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;

class FormMonitorService extends BaseService
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private IntegrationClientProvider $clientProvider,
    ) {}

    public function getStatus(Form $form): array
    {
        $integration = $this->integrationsProvider->getFirstForForm($form, FormMonitor::class);

        $isEnabled = $integration && $integration->isEnabled();

        if ($isEnabled) {
            try {
                $client = $this->clientProvider->getAuthorizedClient($integration);
                $stats = $integration->fetchStats($client, $form);

                return [
                    'enabled' => true,
                    'stats' => $stats,
                ];
            } catch (\Exception $e) {
                // If API call fails, return enabled but with error info
                $message = 'Something went wrong';
                if ($e instanceof ConnectException) {
                    $message = 'Cannot connect';
                }

                return [
                    'enabled' => true,
                    'error' => [
                        'message' => $message,
                        'exception' => $e::class,
                    ],
                ];
            }
        }

        return [
            'enabled' => false,
        ];
    }
}
