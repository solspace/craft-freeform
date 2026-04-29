<?php

namespace Solspace\Freeform\Bundles\Notifications\Export;

use Carbon\Carbon;
use craft\helpers\StringHelper;
use craft\web\Application;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Exceptions\FreeformException;
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

    public function __construct(
        private NotificationLoggerProvider $notificationLoggerProvider,
    ) {
        Event::on(Application::class, Application::EVENT_AFTER_REQUEST, [$this, 'handleNotifications']);
    }

    /**
     * @throws InvalidConfigException
     * @throws FreeformException
     * @throws LoaderError
     * @throws SyntaxError
     * @throws Exception
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

        $freeform = Freeform::getInstance();
        $mailer = $freeform->mailer;
        $exportService = $freeform->exportProfiles;

        /** @var ExportNotificationRecord[] $notifications */
        $notifications = ExportNotificationRecord::find()
            ->where(['enabled' => true])
            ->all()
        ;

        $logger->debug('ExportNotifications handleNotifications - Found notifications', [
            'count' => \count($notifications),
        ]);

        foreach ($notifications as $notification) {
            $logger->info("ExportNotifications handleNotifications - {$notification->name} - Started processing", [
                'notification' => $notification,
            ]);

            if (!$this->checkLock($notification)) {
                $logger->info("ExportNotifications handleNotifications - {$notification->name} - Finished processing", [
                    'notification' => $notification,
                ]);

                continue;
            }

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

            $message = $mailer->renderString($notification->message, $variables);
            $record->bodyHtml = $message;
            $record->bodyText = $message;

            $template = NotificationTemplate::fromRecord($record);
            $recipients = RecipientCollection::fromArray(json_decode($notification->recipients));
            $processedRecipients = $mailer->processRecipients($recipients, $form);

            $logger->debug("ExportNotifications handleNotifications - {$notification->name} - Found recipients", [
                'notification' => $notification,
                'form' => $form,
                'profile' => $profile,
                'template' => $template,
                'recipients' => $recipients->emailsToArray(),
                'processedRecipients' => $processedRecipients,
            ]);

            $message = $mailer->compileMessage($template, $variables, $logger);
            $message->setTo($processedRecipients);

            $exporter = $exportService->createExporter(
                $notification->fileType,
                $form,
                $profile->getQuery(),
                $profile->getFieldDescriptors()
            );

            $fileName = $mailer->renderString(
                $notification->fileName ?? '',
                $variables
            );

            $exportFile = tmpfile();
            $exporter->export($exportFile);

            $message->attachContent(
                $exportFile,
                [
                    'fileName' => $fileName.'.'.$exporter->getFileExtension(),
                    'contentType' => $exporter->getMimeType(),
                ]
            );

            $logger->info("ExportNotifications handleNotifications - {$notification->name} - Sending email", [
                'recipients' => $recipients->emailsToArray(),
                'processedRecipients' => $processedRecipients,
                'message' => $message,
            ]);

            \Craft::$app->mailer->send($message);

            $logger->info("ExportNotifications handleNotifications - {$notification->name} - Email sent");
            $logger->info("ExportNotifications handleNotifications - {$notification->name} - Finished processing");
        }

        $logger->info('ExportNotifications handleNotifications - Finished processing');
    }

    private function checkLock(ExportNotificationRecord $record): bool
    {
        $logger = $this->notificationLoggerProvider->getLogger(null, null);

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

        $exists = NotificationLogRecord::find()
            ->where([
                'type' => $type,
                'identifier' => (string) $record->id,
                'digestDate' => $lookupStart->toDateString(), // e.g. '2025-11-19'
            ])
            ->exists()
        ;

        if ($exists) {
            $logger->info("ExportNotifications checkLock - {$record->name} - Skipped - Already sent for {$lookupStart->toDateString()}");
            $logger->info("ExportNotifications checkLock - {$record->name} - Finished processing");

            return false;
        }

        $db = \Craft::$app->getDb();
        $transaction = $db->beginTransaction();

        try {
            // Try to write log record to block duplicates
            $notificationLogRecord = new NotificationLogRecord();
            $notificationLogRecord->type = $type;
            $notificationLogRecord->identifier = (string) $record->id;
            $notificationLogRecord->name = $record->name;
            $notificationLogRecord->digestDate = $lookupStart->toDateString();
            $notificationLogRecord->save(false); // skip validation

            $transaction->commit();

            $logger->info("ExportNotifications checkLock - {$record->name} - Notification log record created");
            $logger->info("ExportNotifications checkLock - {$record->name} - Finished processing");

            return true;
        } catch (\Throwable $exception) {
            $transaction->rollBack();

            if (str_contains($exception->getMessage(), 'UNIQUE') || str_contains($exception->getMessage(), 'Duplicate')) {
                $logger->warning("ExportNotifications checkLock - {$record->name} - Skipped - Already sent (duplicate record)");
                $logger->info("ExportNotifications checkLock - {$record->name} - Finished processing");

                return false;
            }

            $logger->error("ExportNotifications checkLock - {$record->name} - Failed: {$exception->getMessage()}");
            $logger->info("ExportNotifications checkLock - {$record->name} - Finished processing");

            // Re-throw so the queue knows it failed
            throw $exception;
        }
    }
}
