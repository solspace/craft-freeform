<?php

namespace Solspace\Freeform\Bundles\Notifications\Export;

use Carbon\Carbon;
use craft\helpers\StringHelper;
use craft\web\Application;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\CronExpressionHelper;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Records\NotificationLogRecord;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;
use Twig\Error\LoaderError;
use Twig\Error\SyntaxError;
use yii\base\Event;
use yii\base\Exception;
use yii\base\InvalidConfigException;

class ExportNotifications extends FeatureBundle
{
    public const LOCK_KEY_EXPORT = 'export-notifications-lock-key';
    public const CACHE_KEY_EXPORT = 'export-notifications';
    public const CACHE_TTL_EXPORT = 60 * 60 * 3; // every 3h

    public const NOTIFICATION_TYPE = 'export-notification';
    private const CUSTOM_FREQUENCY = 'custom';
    private const STANDARD_FREQUENCIES = [-1, 0, 1, 2, 3, 4, 5, 6];

    public function __construct(
        private NotificationLoggerProvider $notificationLoggerProvider,
    ) {
        Event::on(Application::class, Application::EVENT_AFTER_REQUEST, [$this, 'handleNotifications']);
    }

    /**
     * Handles notifications with a standard frequency.
     *
     * @throws InvalidConfigException
     * @throws FreeformException
     * @throws LoaderError
     * @throws SyntaxError
     * @throws Exception|\Throwable
     */
    public function handleNotifications(): void
    {
        if (!\Craft::$app->db->tableExists(ExportNotificationRecord::TABLE)) {
            return;
        }

        if (Freeform::isLockedWithGuard(self::CACHE_KEY_EXPORT, self::LOCK_KEY_EXPORT, self::CACHE_TTL_EXPORT)) {
            return;
        }

        $logger = $this->notificationLoggerProvider->getLogger(null, null);

        $logger->info('ExportNotifications handleNotifications - Started processing');

        /** @var ExportNotificationRecord[] $notifications */
        $notifications = ExportNotificationRecord::find()
            ->where([
                'enabled' => true,
                'frequency' => self::STANDARD_FREQUENCIES,
            ])
            ->all()
        ;

        $logger->debug('ExportNotifications handleNotifications - Found notifications', [
            'count' => \count($notifications),
        ]);

        foreach ($notifications as $notification) {
            $logger->info("ExportNotifications handleNotifications - {$notification->name} - Started processing", [
                'notification' => $notification,
            ]);

            if (!$this->checkLock($notification, $logger)) {
                $logger->info("ExportNotifications handleNotifications - {$notification->name} - Finished processing", [
                    'notification' => $notification,
                ]);

                continue;
            }

            $this->sendNotification($notification, $logger, 'handleNotifications');
        }

        $logger->info('ExportNotifications handleNotifications - Finished processing');
    }

    /**
     * Handles notifications with a custom cron schedule frequency.
     *
     * @throws InvalidConfigException
     * @throws FreeformException
     * @throws LoaderError
     * @throws SyntaxError
     * @throws Exception|\Throwable
     */
    public function handleNotificationsWithCustomCronSchedule(): void
    {
        if (!\Craft::$app->db->tableExists(ExportNotificationRecord::TABLE)) {
            return;
        }

        $logger = $this->notificationLoggerProvider->getLogger(null, null);

        /** @var ExportNotificationRecord[] $notifications */
        $notifications = ExportNotificationRecord::find()
            ->where([
                'enabled' => true,
                'frequency' => self::CUSTOM_FREQUENCY,
            ])
            ->all()
        ;

        foreach ($notifications as $notification) {
            if (!$this->checkLockWithCustomCronSchedule($notification, $logger)) {
                continue;
            }

            $logger->info("ExportNotifications handleNotificationsWithCustomCronSchedule - {$notification->name} - Started processing");

            $this->sendNotification($notification, $logger, 'handleNotificationsWithCustomCronSchedule');

            $logger->info("ExportNotifications handleNotificationsWithCustomCronSchedule - {$notification->name} - Finished processing");
        }
    }

    private function sendNotification(ExportNotificationRecord $notification, LoggerInterface $logger, string $logMethod): void
    {
        $freeform = Freeform::getInstance();
        $mailer = $freeform->mailer;
        $exportService = $freeform->exportProfiles;

        $profile = $notification->getProfile();
        $form = $profile->getForm();

        $variables = [
            'form' => $form,
            'profile' => $profile,
            'date' => new Carbon(),
        ];

        $record = NotificationTemplateRecord::create();
        $record->id = 0;
        $record->uid = StringHelper::UUID();
        $record->name = 'Export Notification';
        $record->handle = 'export-notification';
        $record->fromName = \Craft::$app->projectConfig->get('email.fromName');
        $record->fromEmail = \Craft::$app->projectConfig->get('email.fromEmail');
        $record->subject = $mailer->renderString($notification->subject, $variables);

        $body = $mailer->renderString($notification->message, $variables);

        $record->bodyHtml = $body;
        $record->bodyText = $body;

        $template = NotificationTemplate::fromRecord($record);
        $recipients = RecipientCollection::fromArray(json_decode($notification->recipients));
        $processedRecipients = $mailer->processRecipients($recipients, $form);

        $recipientLogContext = [
            'recipients' => $recipients->emailsToArray(),
            'processedRecipients' => $processedRecipients,
        ];

        if (!\Craft::$app->request->isConsoleRequest) {
            $recipientLogContext += [
                'notification' => $notification,
                'form' => $form,
                'profile' => $profile,
                'template' => $template,
            ];
        }

        $logger->debug("ExportNotifications {$logMethod} - {$notification->name} - Found recipients", $recipientLogContext);

        $message = $mailer->compileMessage($template, $variables, $logger);
        $message->setTo($processedRecipients);

        $exporter = $exportService->createExporter(
            $notification->fileType,
            $form,
            $profile->getQuery(),
            $profile->getFieldDescriptors()
        );

        $fileName = $mailer->renderString($notification->fileName ?? '', $variables);

        $exportFile = tmpfile();
        $exporter->export($exportFile);

        $message->attachContent(
            $exportFile,
            [
                'fileName' => $fileName.'.'.$exporter->getFileExtension(),
                'contentType' => $exporter->getMimeType(),
            ]
        );

        $emailLogContext = [
            'recipients' => $recipients->emailsToArray(),
            'processedRecipients' => $processedRecipients,
        ];

        if (!\Craft::$app->request->isConsoleRequest) {
            $emailLogContext['message'] = $message;
        }

        $logger->info("ExportNotifications {$logMethod} - {$notification->name} - Sending email", $emailLogContext);

        \Craft::$app->mailer->send($message);

        $logger->info("ExportNotifications {$logMethod} - {$notification->name} - Email sent");
        $logger->info("ExportNotifications {$logMethod} - {$notification->name} - Finished processing");
    }

    /**
     * @throws \DateInvalidTimeZoneException
     * @throws \Throwable
     */
    private function checkLock(ExportNotificationRecord $record, LoggerInterface $logger): bool
    {
        $logger->info("ExportNotifications checkLock - {$record->name} - Started processing");

        if (empty($record->getRecipientArray())) {
            $logger->info("ExportNotifications checkLock - {$record->name} - Skipped - Recipients not found");
            $logger->info("ExportNotifications checkLock - {$record->name} - Finished processing");

            return false;
        }

        $frequency = (int) $record->frequency;
        $type = self::NOTIFICATION_TYPE;

        // Use the Craft site timezone
        $siteTimezone = new \DateTimeZone(\Craft::$app->getTimeZone());

        // "Today" at start of day in site timezone
        $lookupStart = (new Carbon('now'))->setTimezone($siteTimezone)->startOfDay();

        $logger->info("ExportNotifications checkLock - {$record->name} - lookupStart (Site Timezone) - {$lookupStart}");

        // Frequency check:
        // - Daily (-1) -> always run
        // - Weekly (0–6) -> only run on that weekday in site timezone
        if (-1 !== $frequency && $lookupStart->dayOfWeek !== $frequency) {
            $logger->info("ExportNotifications checkLock - {$record->name} - Skipped - Frequency mismatch (dayOfWeek={$lookupStart->dayOfWeek}, expected={$frequency})");
            $logger->info("ExportNotifications checkLock - {$record->name} - Finished processing");

            return false;
        }

        return $this->createNotificationLog(
            $record,
            $logger,
            $type,
            (string) $record->id,
            $lookupStart->toDateString(),
            $lookupStart->toDateString(),
            'checkLock'
        );
    }

    /**
     * @throws \DateInvalidTimeZoneException
     * @throws \Throwable
     */
    private function checkLockWithCustomCronSchedule(ExportNotificationRecord $record, LoggerInterface $logger): bool
    {
        if (empty($record->getRecipientArray())) {
            return false;
        }

        $type = self::NOTIFICATION_TYPE;

        // Use the Craft site timezone
        $siteTimezone = new \DateTimeZone(\Craft::$app->getTimeZone());

        $now = (new Carbon('now'))->setTimezone($siteTimezone);
        $digestDate = $now->copy()->startOfDay()->toDateString();
        $identifier = $record->id.':'.$now->format('YmdHi');

        if (!CronExpressionHelper::isDue($record->cronExpression, $now)) {
            return false;
        }

        $logger->info("ExportNotifications checkLockWithCustomCronSchedule - {$record->name} - Started processing");
        $logger->info("ExportNotifications checkLockWithCustomCronSchedule - {$record->name} - now (Site Timezone) - {$now}");

        return $this->createNotificationLog(
            $record,
            $logger,
            $type,
            $identifier,
            $digestDate,
            $now->format('Y-m-d H:i'),
            'checkLockWithCustomCronSchedule'
        );
    }

    private function createNotificationLog(
        ExportNotificationRecord $record,
        LoggerInterface $logger,
        string $type,
        string $identifier,
        string $digestDate,
        string $sentFor,
        string $logMethod,
    ): bool {
        $exists = NotificationLogRecord::find()
            ->where([
                'type' => $type,
                'identifier' => $identifier,
                'digestDate' => $digestDate,
            ])
            ->exists()
        ;

        if ($exists) {
            $logger->info("ExportNotifications {$logMethod} - {$record->name} - Skipped - Already sent for {$sentFor}");
            $logger->info("ExportNotifications {$logMethod} - {$record->name} - Finished processing");

            return false;
        }

        $transaction = \Craft::$app->db->beginTransaction();

        try {
            // Try to write log record to block duplicates
            $notificationLogRecord = new NotificationLogRecord();
            $notificationLogRecord->type = $type;
            $notificationLogRecord->identifier = $identifier;
            $notificationLogRecord->name = $record->name;
            $notificationLogRecord->digestDate = $digestDate;
            $notificationLogRecord->save(false); // skip validation

            $transaction->commit();

            $logger->info("ExportNotifications {$logMethod} - {$record->name} - Notification log record created");
            $logger->info("ExportNotifications {$logMethod} - {$record->name} - Finished processing");

            return true;
        } catch (\Throwable $exception) {
            $transaction->rollBack();

            if (str_contains($exception->getMessage(), 'UNIQUE') || str_contains($exception->getMessage(), 'Duplicate')) {
                $logger->warning("ExportNotifications {$logMethod} - {$record->name} - Skipped - Already sent (duplicate record)");
                $logger->info("ExportNotifications {$logMethod} - {$record->name} - Finished processing");

                return false;
            }

            $logger->error("ExportNotifications {$logMethod} - {$record->name} - Failed: {$exception->getMessage()}");
            $logger->info("ExportNotifications {$logMethod} - {$record->name} - Finished processing");

            // Re-throw so the queue knows it failed
            throw $exception;
        }
    }
}
