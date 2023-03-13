<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Form\Form;
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

        /** @var FormIntegrationRecord[] $formIntegrationRecords */
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

            $integration->enabled = $formIntegration->enabled;
            $integration->metadata = array_merge(
                $integration->metadata,
                $metadata
            );
        }

        return $integrations;
    }
}
