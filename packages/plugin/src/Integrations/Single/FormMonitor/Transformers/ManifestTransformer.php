<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\Transformers;

use craft\db\Query;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificationNormalizer;
use Solspace\Freeform\Records\FormGroupsEntriesRecord;
use Solspace\Freeform\Records\FormGroupsRecord;
use Symfony\Component\Serializer\Serializer;

class ManifestTransformer
{
    public function __construct(
        private FormMonitorFieldTransformer $fieldTransformer,
        private NotificationsProvider $notificationsProvider,
        private Serializer $serializer,
    ) {}

    public function transform(Form $form): object
    {
        $notifications = $this->notificationsProvider->getByForm($form);
        $serialized = $this->serializer->serialize($notifications, 'json', [
            IdentificationNormalizer::NORMALIZE_TO_IDENTIFICATORS => true,
        ]);

        $manifest = [
            'form' => [
                'id' => $form->getId(),
                'uid' => $form->getUid(),
                'name' => $form->getName(),
                'handle' => $form->getHandle(),
                'settings' => $form->getSettings()->toArray(),
            ],
            'notifications' => JsonHelper::decode($serialized, true),
        ];

        $layout = $this->transformLayout($form->getLayout());

        $manifest['layout'] = $layout;

        // Add group information
        $manifest['groups'] = $this->getFormGroups($form);

        return (object) $manifest;
    }

    private function transformLayout($layout): array
    {
        $result = [];

        foreach ($layout->getPages() as $page) {
            $pageData = [];

            foreach ($page->getRows() as $row) {
                $rowData = [];

                foreach ($row->getFields() as $field) {
                    $transformedField = $this->transformField($field);
                    $rowData[] = $transformedField;
                }

                $pageData[] = $rowData;
            }

            $result[] = $pageData;
        }

        return $result;
    }

    private function transformField($field): object
    {
        $transformed = $this->fieldTransformer->transform($field);

        // If it's a GroupField, recursively transform its nested layout
        if ($field instanceof GroupField) {
            $nestedLayout = $field->getLayout();
            if ($nestedLayout) {
                // Transform the nested layout to array format
                // GroupField Layout has getRows() directly (no pages)
                $nestedData = [];
                foreach ($nestedLayout->getRows() as $row) {
                    $rowData = [];
                    foreach ($row->getFields() as $nestedField) {
                        $rowData[] = $this->transformField($nestedField);
                    }
                    $nestedData[] = $rowData;
                }

                // Convert to array and add the nested layout
                $transformedArray = (array) $transformed;
                $transformedArray['layout'] = $nestedData;
                $transformed = (object) $transformedArray;
            }
        }

        return $transformed;
    }

    private function getFormGroups(Form $form): array
    {
        $formId = $form->getId();
        if (!$formId) {
            return [];
        }

        // Get the site ID from the form, fallback to current site
        $siteId = $form->siteId ?? \Craft::$app->sites->currentSite->id;

        // Query to find all groups that contain this form
        $groups = (new Query())
            ->select([
                'groups.id',
                'groups.uid',
                'groups.label',
                'groups.siteId',
                'groups.order',
            ])
            ->from(['entries' => FormGroupsEntriesRecord::TABLE])
            ->innerJoin(['groups' => FormGroupsRecord::TABLE], 'groups.id = entries.groupId')
            ->where([
                'entries.formId' => $formId,
                'groups.siteId' => $siteId,
            ])
            ->orderBy(['groups.order' => \SORT_ASC])
            ->all()
        ;

        return array_map(function ($group) {
            return [
                'id' => (int) $group['id'],
                'uid' => $group['uid'],
                'label' => $group['label'],
                'siteId' => (int) $group['siteId'],
            ];
        }, $groups);
    }
}
