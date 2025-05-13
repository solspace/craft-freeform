<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\Transformers;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificationNormalizer;
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

        $layout = [];
        foreach ($form->getLayout()->getPages() as $page) {
            $pageData = [];

            foreach ($page->getRows() as $row) {
                $rowData = [];

                foreach ($row->getFields() as $field) {
                    $rowData[] = $this->fieldTransformer->transform($field);
                }

                $pageData[] = $rowData;
            }

            $layout[] = $pageData;
        }

        $manifest['layout'] = $layout;

        return (object) $manifest;
    }
}
