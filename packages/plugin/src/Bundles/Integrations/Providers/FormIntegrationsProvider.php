<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
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
        $integrations = $this->integrationsService->getAllIntegrations($type);
        $integrationIds = array_map(
            fn (IntegrationModel $record) => $record->id,
            $integrations
        );

        $query = FormIntegrationRecord::find()
            ->where(['formId' => $form?->getId() ?? null])
            ->andWhere(['IN', 'integrationId', $integrationIds])
            ->indexBy('integrationId')
        ;

        /** @var FormIntegrationRecord[] $formIntegrationRecords */
        $formIntegrationRecords = $query->all();

        foreach ($integrations as $integration) {
            $metadata = [];
            $formIntegration = $formIntegrationRecords[$integration->id] ?? null;
            if ($formIntegration) {
                $metadata = json_decode($formIntegration->metadata ?? '{}', true);
                $enabled = $formIntegration->enabled;
            }

            if (!$formIntegration) {
                $enabledByDefault = $integration->metadata['enabledByDefault'] ?? null;
                if (!\is_bool($enabledByDefault) || !$enabledByDefault) {
                    continue;
                }

                $enabled = true;
            }

            $integration->enabled = $enabled;
            $integration->metadata = array_merge(
                $integration->metadata,
                $metadata
            );
        }

        return array_map(
            fn (IntegrationModel $record) => $record->getIntegrationObject(),
            $integrations
        );
    }
}
