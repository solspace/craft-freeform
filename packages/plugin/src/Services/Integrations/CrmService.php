<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services\Integrations;

use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Records\CrmFieldRecord;

class CrmService extends AbstractIntegrationService
{
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

            $usedHandles = [];
            $newFields = [];
            foreach ($fields as $field) {
                if (!\array_key_exists($field->getHandle(), $existingRecords)) {
                    $newFields[] = $field;
                }

                $usedHandles[] = $field->getHandle();
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
                if (!\in_array($handle, $usedHandles)) {
                    $record->delete();
                    unset($existingRecords[$handle]);
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

    protected function getIntegrationType(): string
    {
        return IntegrationInterface::TYPE_CRM;
    }

    protected function getIntegrationInterface(): string
    {
        return CRMIntegrationInterface::class;
    }
}
