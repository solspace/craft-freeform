<?php

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Services\NotificationsService;

class NotificationTemplateProvider
{
    public function __construct(
        private NotificationsService $service,
    ) {}

    /**
     * @return NotificationTemplate[]
     */
    public function getDatabaseTemplates(): array
    {
        $records = $this->service->getAllNotifications();

        return array_values(
            array_filter(
                array_map(fn ($record) => NotificationTemplate::fromRecord($record), $records),
                fn ($notification) => $notification->isDb(),
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
                array_map(fn ($record) => NotificationTemplate::fromRecord($record), $records),
                fn ($notification) => $notification->isFile(),
            )
        );
    }

    public function getNotificationTemplate(int|string $id): ?NotificationTemplate
    {
        if (is_numeric($id)) {
            return $this->getDatabaseNotificationTemplate((int) $id);
        }

        if (\is_string($id)) {
            return $this->getFileNotificationTemplate($id);
        }

        return null;
    }

    public function getDatabaseNotificationTemplate(int $id): ?NotificationTemplate
    {
        $record = $this->service->getTemplateRecordById($id);
        if (!$record) {
            return null;
        }

        return NotificationTemplate::fromRecord($record);
    }

    public function getFileNotificationTemplate(string $filePath): ?NotificationTemplate
    {
        $record = $this->service->getTemplateRecordByFilepath($filePath);
        if (!$record) {
            return null;
        }

        return NotificationTemplate::fromRecord($record);
    }
}
