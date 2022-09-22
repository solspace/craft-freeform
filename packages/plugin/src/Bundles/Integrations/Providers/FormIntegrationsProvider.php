<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Records\FormIntegrationRecord;
use Solspace\Freeform\Services\IntegrationsService;

class FormIntegrationsProvider
{
    public function __construct(private IntegrationsService $integrationsService, private IntegrationDTOProvider $DTOProvider)
    {
    }

    public function getForForm(Form $form)
    {
        $integrations = $this->integrationsService->getAllIntegrations();

        $formIntegrationRecords = FormIntegrationRecord::find()
            ->where(['formId' => $form->getId()])
            ->indexBy('integrationId')
            ->all()
        ;

        foreach ($integrations as $integration) {
            $formIntegration = $formIntegrationRecords[$integration->id] ?? null;
            if (!$formIntegration) {
                continue;
            }

            $metadata = json_decode($formIntegration->metadata ?? '{}', true);

            $settings = $metadata['settings'] ?? [];
            $integration->settings = array_merge(
                $integration->settings,
                $settings
            );
        }

        return $integrations;
    }
}
