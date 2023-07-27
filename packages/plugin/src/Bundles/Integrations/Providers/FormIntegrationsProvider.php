<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\IntegrationRecord;
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
        $integrations = $this->integrationsService->getAllIntegrations();

        $query = FormIntegrationRecord::find()
            ->where(['formId' => $form?->getId() ?? null])
            ->indexBy('integrationId')
        ;

        if ($type) {
            $query
                ->innerJoin(IntegrationRecord::TABLE.' i', '[[i.id]] = [[integrationId]]')
                ->andWhere(['[[i.type]]' => $type])
            ;
        }

        /** @var FormIntegrationRecord[] $formIntegrationRecords */
        $formIntegrationRecords = $query->all();

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

        return array_map(
            fn (IntegrationModel $record) => $record->getIntegrationObject(),
            $integrations
        );
    }
}
