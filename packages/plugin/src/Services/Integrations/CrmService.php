<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services\Integrations;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Records\CrmFieldRecord;
use Solspace\Freeform\Services\BaseService;

class CrmService extends BaseService
{
    public function __construct(
        protected FormIntegrationsProvider $integrationsProvider,
        protected IntegrationClientProvider $clientProvider,
    ) {
        parent::__construct();
    }

    /**
     * @return FieldObject[]
     */
    public function getFields(
        CRMIntegrationInterface $integration,
        string $category,
        bool $refresh = false
    ): array {
        $existingRecords = CrmFieldRecord::find()
            ->where([
                'integrationId' => $integration->getId(),
                'category' => $category,
            ])
            ->indexBy('handle')
            ->all()
        ;

        if ($refresh || empty($existingRecords)) {
            $client = $this->clientProvider->getAuthorizedClient($integration);
            $fields = $integration->fetchFields($category, $client);

            $usedFields = [];
            $newFields = [];
            foreach ($fields as $field) {
                if (!\array_key_exists($field->getHandle(), $existingRecords)) {
                    $newFields[] = $field;
                }

                $usedFields[$field->getHandle()] = $field;
            }

            foreach ($newFields as $field) {
                $record = new CrmFieldRecord();
                $record->integrationId = $integration->getId();
                $record->handle = $field->getHandle();
                $record->label = $field->getLabel();
                $record->type = $field->getType();
                $record->required = $field->isRequired();
                $record->category = $category;
                $record->save();

                $existingRecords[$field->getHandle()] = $record;
            }

            foreach ($existingRecords as $handle => $record) {
                if (!\array_key_exists($handle, $usedFields)) {
                    $record->delete();
                    unset($existingRecords[$handle]);
                } else {
                    $field = $usedFields[$handle];
                    $record->label = $field->getLabel();
                    $record->type = $field->getType();
                    $record->required = $field->isRequired();
                    $record->category = $category;
                    $record->save();
                }
            }
        }

        return array_map(
            fn (CrmFieldRecord $record) => new FieldObject(
                $record->handle,
                $record->label,
                $record->type,
                $record->category,
                $record->required,
            ),
            $existingRecords
        );
    }

    public function processIntegrations(Form $form): void
    {
        /** @var CRMIntegrationInterface[] $integrations */
        $integrations = $this->integrationsProvider->getForForm($form, Type::TYPE_CRM);
        foreach ($integrations as $integration) {
            $client = $this->clientProvider->getAuthorizedClient($integration);
            $integration->push($form, $client);
        }
    }

    public function hasIntegrations(Form $form): bool
    {
        return \count($this->integrationsProvider->getForForm($form, Type::TYPE_CRM)) > 0;
    }
}
