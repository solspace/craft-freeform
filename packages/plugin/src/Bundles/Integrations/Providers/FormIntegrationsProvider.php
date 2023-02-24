<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Services\IntegrationsService;

class FormIntegrationsProvider
{
    public function __construct(
        private IntegrationsService $integrationsService
    ) {
    }

    public function getForForm(?Form $form = null): array
    {
        $integrations = $this->integrationsService->getAllIntegrations();

        $formIntegrationRecords = FormIntegrationRecord::find()
            ->where(['formId' => $form?->getId() ?? null])
            ->indexBy('integrationId')
            ->all()
        ;

        foreach ($integrations as $integration) {
            $formIntegration = $formIntegrationRecords[$integration->id] ?? null;
            if (!$formIntegration) {
                continue;
            }

            $metadata = json_decode($formIntegration->metadata ?? '{}', true);

            $settings = $metadata['metadata'] ?? [];
            $integration->metadata = array_merge(
                $integration->metadata,
                $settings
            );
        }

        return $integrations;
    }
}
