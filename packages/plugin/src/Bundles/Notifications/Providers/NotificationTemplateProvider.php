<?php

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use Solspace\Freeform\Library\Cache\Memo;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\Notifications\NotificationDatabaseService;
use Solspace\Freeform\Services\NotificationsService;

class NotificationTemplateProvider
{
    private Memo $templateCache;

    public function __construct(
        private NotificationsService $service,
        private NotificationDatabaseService $databaseService,
    ) {
        $this->templateCache = new Memo();
    }

    public function getFormTemplates(?int $formId = null): array
    {
        if (!$formId) {
            return [];
        }

        $records = NotificationTemplateRecord::find()
            ->where(['formId' => $formId])
            ->all()
        ;

        return array_filter(
            array_map(static fn ($record) => NotificationTemplate::fromRecord($record), $records),
            static fn ($notification) => $notification->isDb() && $notification->getFormId() === $formId,
        );
    }

    /**
     * @return NotificationTemplate[]
     */
    public function getDatabaseTemplates(): array
    {
        $records = $this->service->getAllNotifications();

        return array_values(
            array_filter(
                array_map(static fn ($record) => NotificationTemplate::fromRecord($record), $records),
                static fn ($notification) => $notification->isDb() && !$notification->getFormId(),
            )
        );
    }

    /**
     * @return NotificationTemplate[]
     */
    public function getFileTemplates(): array
    {
        $records = $this->service->getAllNotifications();

        return array_values(
            array_filter(
                array_map(static fn ($record) => NotificationTemplate::fromRecord($record), $records),
                static fn ($notification) => $notification->isFile(),
            )
        );
    }

    public function getNotificationTemplate(int|string $id): ?NotificationTemplate
    {
        if (is_numeric($id)) {
            return $this->templateCache->get(
                $id,
                static fn () => $this->getDatabaseNotificationTemplate((int) $id),
                'db',
            );
        }

        if (\is_string($id)) {
            return $this->getFileNotificationTemplate($id);
        }

        return null;
    }

    public function getDatabaseNotificationTemplate(int $id): ?NotificationTemplate
    {
        $service = $this->databaseService;

        return $this->templateCache->get(
            $id,
            static function () use ($id, $service) {
                if (!$id) {
                    return null;
                }

                $record = $service->getById($id);
                if (!$record) {
                    return null;
                }

                return NotificationTemplate::fromRecord($record);
            },
            'db',
        );
    }

    public function getFileNotificationTemplate(string $filePath): ?NotificationTemplate
    {
        $service = $this->service;

        return $this->templateCache->get(
            $filePath,
            static function () use ($filePath, $service) {
                if (!$filePath) {
                    return null;
                }

                $record = $service->getTemplateRecordByFilepath($filePath);
                if (!$record) {
                    return null;
                }

                return NotificationTemplate::fromRecord($record);
            },
            'files',
        );
    }
}
