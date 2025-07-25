<?php

namespace Solspace\Freeform\Services\Pro;

use Carbon\Carbon;
use craft\web\View;
use Solspace\Freeform\Bundles\Digest\Providers\DigestLoggerProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Records\FeedMessageRecord;
use Solspace\Freeform\Records\FeedRecord;
use Solspace\Freeform\Records\NotificationLogRecord;
use yii\base\Component;

class DigestService extends Component
{
    public const FREQUENCY_DAILY = -1;
    public const FREQUENCY_WEEKLY_SUNDAYS = 0;
    public const FREQUENCY_WEEKLY_MONDAYS = 1;
    public const FREQUENCY_WEEKLY_TUESDAYS = 2;
    public const FREQUENCY_WEEKLY_WEDNESDAYS = 3;
    public const FREQUENCY_WEEKLY_THURSDAYS = 4;
    public const FREQUENCY_WEEKLY_FRIDAYS = 5;
    public const FREQUENCY_WEEKLY_SATURDAYS = 6;

    public const LOCK_KEY_DIGEST = 'freeform-digest-lock-key';
    public const CACHE_KEY_DIGEST = 'freeform-digest-cache-key';
    public const CACHE_TTL_DIGEST = 60 * 60 * 3; // every 3h

    public const TEMPLATE_PATH = '_templates/email/digest.twig';

    public function __construct(private DigestLoggerProvider $loggerProvider, $config = [])
    {
        parent::__construct($config);
    }

    public function triggerDigest(Carbon $refDate): void
    {
        if (!\Craft::$app->db->tableExists(FeedRecord::TABLE)) {
            return;
        }

        // Exit early if digestDate column is missing
        if (!\Craft::$app->db->getTableSchema('{{%freeform_notification_log}}')?->getColumn('digestDate')) {
            return;
        }

        if (Freeform::isLockedWithGuard(self::CACHE_KEY_DIGEST, self::LOCK_KEY_DIGEST, self::CACHE_TTL_DIGEST)) {
            return;
        }

        if (Freeform::getInstance()->edition()->isBelow(Freeform::EDITION_LITE)) {
            return;
        }

        $this->loggerProvider->getLogger()->info('DigestService triggerDigest - Started processing');

        $freeform = Freeform::getInstance();
        $settingsService = $freeform->settings;

        $isProduction = 'production' === strtolower(\Craft::$app->getConfig()->env);
        if (!$isProduction && $settingsService->isDigestOnlyOnProduction()) {
            $this->loggerProvider->getLogger()->info('DigestService triggerDigest - Skipped - Digest only allowed on Production');
            $this->loggerProvider->getLogger()->info('DigestService triggerDigest - Finished processing');

            return;
        }

        $this->loggerProvider->getLogger()->info('DigestService triggerDigest - digest - Started processing');

        $devRecipients = $settingsService->getDigestRecipients();
        $devFrequency = $settingsService->getDigestFrequency();

        if ($devRecipients->count()) {
            $this->loggerProvider->getLogger()->debug('DigestService triggerDigest - digest - Found recipients', [
                'recipients' => $devRecipients->emailsToArray(),
                'frequency' => $devFrequency,
            ]);

            $this->parseDigest(
                NotificationLogRecord::TYPE_DIGEST_DEV,
                $devRecipients,
                $devFrequency,
                $refDate
            );
        }

        $this->loggerProvider->getLogger()->info('DigestService triggerDigest - digest - Finished processing');
        $this->loggerProvider->getLogger()->info('DigestService triggerDigest - digest-client - Started processing');

        $clientRecipients = $settingsService->getClientDigestRecipients();
        $clientFrequency = $settingsService->getClientDigestFrequency();

        if ($clientRecipients->count()) {
            $this->loggerProvider->getLogger()->debug('DigestService triggerDigest - digest-client - Found recipients', [
                'recipients' => $clientRecipients->emailsToArray(),
                'frequency' => $clientFrequency,
            ]);

            $this->parseDigest(
                NotificationLogRecord::TYPE_DIGEST_CLIENT,
                $clientRecipients,
                $clientFrequency,
                $refDate
            );
        }

        $this->loggerProvider->getLogger()->info('DigestService triggerDigest - digest-client - Finished processing');
        $this->loggerProvider->getLogger()->info('DigestService triggerDigest - Finished processing');
    }

    public function sendDigest(RecipientCollection $recipients, string $type, Carbon $rangeStart, Carbon $rangeEnd): void
    {
        $this->loggerProvider->getLogger()->info("DigestService sendDigest - {$type} - Started processing");

        $isFullDigest = NotificationLogRecord::TYPE_DIGEST_DEV === $type;
        $mailer = Freeform::getInstance()->mailer;

        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);

        $templatePath = \Craft::getAlias('@freeform/templates/'.self::TEMPLATE_PATH);
        $notification = NotificationTemplate::fromFile($templatePath);

        $this->loggerProvider->getLogger()->info("DigestService sendDigest - {$type} - Sending email", [
            'recipients' => $recipients->emailsToArray(),
        ]);

        $recipients = $mailer->processRecipients($recipients);
        $message = $mailer->compileMessage(
            $notification,
            [
                'daily' => $rangeStart->isSameDay($rangeEnd),
                'fullDigest' => $isFullDigest,
                'rangeStart' => $rangeStart,
                'rangeEnd' => $rangeEnd,
                'forms' => $this->getFormData($rangeStart, $rangeEnd),
                'errors' => $this->getErrorData($rangeStart, $rangeEnd),
                'updates' => $this->getUpdateData(),
            ]
        );

        $message->setTo($recipients);

        \Craft::$app->mailer->send($message);
        \Craft::$app->view->setTemplateMode($templateMode);

        $this->loggerProvider->getLogger()->info("DigestService sendDigest - {$type} - Email sent");
        $this->loggerProvider->getLogger()->info("DigestService sendDigest - {$type} - Finished processing");
    }

    public function purgeNotificationLogs(): void
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        $column = 'digestDate';

        // Only run if the column exists
        if (!\Craft::$app->db->getTableSchema('{{%freeform_notification_log}}')?->getColumn($column)) {
            return;
        }

        $cutoff = (new \DateTime())->modify('-8 days')->format('Y-m-d');

        NotificationLogRecord::deleteAll(['<', $column, $cutoff]);
    }

    private function parseDigest(string $type, RecipientCollection $recipients, int $frequency, Carbon $refDate): void
    {
        $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Started processing");

        if (empty($recipients->emailsToArray())) {
            $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Skipped - Recipients not found");
            $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Finished processing");

            return;
        }

        $lookupStart = $refDate->clone()->startOfDay();

        if (-1 !== $frequency && $lookupStart->dayOfWeek !== $frequency) {
            $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Skipped - Frequency mismatch");
            $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Finished processing");

            return;
        }

        $exists = NotificationLogRecord::find()
            ->where([
                'type' => $type,
                'digestDate' => $lookupStart->toDateString(),
            ])
            ->exists()
        ;

        if ($exists) {
            $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Skipped - Already sent for {$lookupStart->toDateString()}");
            $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Finished processing");

            return;
        }

        // Time range for actual digest data
        $rangeStart = (-1 === $frequency)
            ? $lookupStart->copy()->subDay()
            : $lookupStart->copy()->subWeek();

        $rangeEnd = $lookupStart->copy()->subDay()->endOfDay();

        $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type}", [
            'rangeStart' => $rangeStart,
            'rangeEnd' => $rangeEnd,
        ]);

        $db = \Craft::$app->getDb();
        $transaction = $db->beginTransaction();

        try {
            // Try to write log record to block duplicates
            $record = new NotificationLogRecord();
            $record->type = $type;
            $record->digestDate = $lookupStart->toDateString(); // e.g. '2025-07-24'
            $record->save(false); // skip validation

            $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Notification log record created");

            $this->sendDigest($recipients, $type, $rangeStart, $rangeEnd);

            $transaction->commit();
        } catch (\Throwable $exception) {
            $transaction->rollBack();

            if (str_contains($exception->getMessage(), 'UNIQUE') || str_contains($exception->getMessage(), 'duplicate')) {
                // Someone else already sent it
                $this->loggerProvider->getLogger()->warning("DigestService parseDigest - {$type} - Skipped - Already sent (duplicate record)");
                $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Finished processing");

                return;
            }

            $this->loggerProvider->getLogger()->error("DigestService parseDigest - {$type} - Failed: {$exception->getMessage()}");

            // Re-throw so the queue knows it failed
            throw $exception;
        }

        $this->loggerProvider->getLogger()->info("DigestService parseDigest - {$type} - Finished processing");
    }

    private function getFormData(Carbon $rangeStart, Carbon $rangeEnd): array
    {
        $freeform = Freeform::getInstance();

        $formService = $freeform->forms;
        $forms = $formService->getAllForms();

        $submissions = $freeform->submissions->getSubmissionCountByForm(false, $rangeStart, $rangeEnd);
        $spam = $freeform->submissions->getSubmissionCountByForm(true, $rangeStart, $rangeEnd);

        $data = [];
        foreach ($forms as $form) {
            $data[] = [
                'form' => $form,
                'submissions' => $submissions[$form->getId()] ?? 0,
                'spam' => $spam[$form->getId()] ?? 0,
            ];
        }

        return $data;
    }

    private function getErrorData(Carbon $rangeStart, Carbon $rangeEnd): array
    {
        $logReader = Freeform::getInstance()->logger->getLogReader();

        $data = [];
        foreach ($logReader->getLines(5) as $line) {
            $date = $line->getDate();
            if ($date && $rangeStart->lte($date) && $rangeEnd->gte($date)) {
                $data[] = $line;
            }
        }

        return $data;
    }

    private function getUpdateData(): array
    {
        $messages = FeedMessageRecord::find()
            ->where(['seen' => false])
            ->andWhere(['!=', 'type', 'new'])
            ->orderBy(['issueDate' => \SORT_DESC])
            ->all()
        ;

        $data = [];
        foreach ($messages as $message) {
            $data[] = $message->toArray();
        }

        return $data;
    }
}
