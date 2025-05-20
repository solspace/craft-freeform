<?php

namespace Solspace\Freeform\Services;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\ServerException;
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
                $message = 'Error';
                if ($e instanceof ConnectException || $e instanceof ServerException) {
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
