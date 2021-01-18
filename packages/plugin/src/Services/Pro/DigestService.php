<?php

namespace Solspace\Freeform\Services\Pro;

use Carbon\Carbon;
use craft\helpers\Db;
use craft\web\View;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Records\FeedMessageRecord;
use Solspace\Freeform\Records\NotificationLogRecord;
use Solspace\Freeform\Records\NotificationRecord;
use yii\base\Component;

class DigestService extends Component
{
    const FREQUENCY_DAILY = -1;
    const FREQUENCY_WEEKLY_SUNDAYS = 0;
    const FREQUENCY_WEEKLY_MONDAYS = 1;
    const FREQUENCY_WEEKLY_TUESDAYS = 2;
    const FREQUENCY_WEEKLY_WEDNESDAYS = 3;
    const FREQUENCY_WEEKLY_THURSDAYS = 4;
    const FREQUENCY_WEEKLY_FRIDAYS = 5;
    const FREQUENCY_WEEKLY_SATURDAYS = 6;

    const CACHE_KEY_DIGEST = 'freeform-digest-cache-key';
    const CACHE_TTL_DIGEST = 60 * 60 * 3; // every 3h

    const TEMPLATE_PATH = __DIR__.'/../../templates/_emailTemplates/digest.twig';

    public function triggerDigest()
    {
        if (Freeform::isLocked(self::CACHE_KEY_DIGEST, self::CACHE_TTL_DIGEST)) {
            return;
        }

        $freeform = Freeform::getInstance();
        $settingsService = $freeform->settings;

        $isProduction = 'production' === strtolower(\Craft::$app->getConfig()->env);
        if (!$isProduction && $settingsService->isDigestOnlyOnProduction()) {
            return;
        }

        $devRecipients = $settingsService->getDigestRecipients();
        $devFrequency = $settingsService->getDigestFrequency();
        $this->parseDigest(NotificationLogRecord::TYPE_DIGEST_DEV, $devRecipients, $devFrequency);

        $clientRecipients = $settingsService->getClientDigestRecipients();
        $clientFrequency = $settingsService->getClientDigestFrequency();
        $this->parseDigest(NotificationLogRecord::TYPE_DIGEST_CLIENT, $clientRecipients, $clientFrequency);
    }

    public function sendDigest(array $recipients, string $type, Carbon $rangeStart, Carbon $rangeEnd)
    {
        $isFullDigest = NotificationLogRecord::TYPE_DIGEST_DEV === $type;
        $mailer = Freeform::getInstance()->mailer;

        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);

        $notification = NotificationRecord::createFromTemplate(self::TEMPLATE_PATH);

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
    }

    private function parseDigest(string $type, array $recipients, int $frequency)
    {
        if (empty($recipients)) {
            return;
        }

        $lookupStart = new Carbon('now');
        $lookupStart->setTime(0, 0, 0);

        $lookupEnd = $lookupStart->copy()->setTime(23, 59, 59);

        if (-1 !== $frequency && $lookupStart->dayOfWeek !== $frequency) {
            return;
        }

        $record = NotificationLogRecord::find()
            ->where(Db::parseDateParam('dateCreated', $lookupStart, '>='))
            ->andWhere(Db::parseDateParam('dateCreated', $lookupEnd, '<='))
            ->andWhere(['type' => $type])
            ->one()
        ;

        if ($record) {
            return;
        }

        if (-1 === $frequency) {
            $rangeStart = $lookupStart->copy()->subDay();
        } else {
            $rangeStart = $lookupStart->copy()->subWeek();
        }

        $rangeEnd = $lookupStart->copy()->subDay()->setTime(23, 59, 59);

        $this->sendDigest($recipients, $type, $rangeStart, $rangeEnd);

        $record = new NotificationLogRecord();
        $record->type = $type;
        $record->save();
    }

    private function getFormData(Carbon $rangeStart, Carbon $rangeEnd)
    {
        $freeform = Freeform::getInstance();

        $formService = $freeform->forms;
        $forms = $formService->getAllForms();

        $submissions = $freeform->submissions->getSubmissionCountByForm(false, $rangeStart, $rangeEnd);
        $spam = $freeform->submissions->getSubmissionCountByForm(true, $rangeStart, $rangeEnd);

        $data = [];
        foreach ($forms as $form) {
            $data[] = ['form' => $form, 'submissions' => $submissions[$form->id] ?? 0, 'spam' => $spam[$form->id] ?? 0];
        }

        return $data;
    }

    private function getErrorData(Carbon $rangeStart, Carbon $rangeEnd)
    {
        $logReader = Freeform::getInstance()->logger->getLogReader();

        $data = [];
        foreach ($logReader->getLastLines(5) as $line) {
            $date = $line->getDate();
            if ($date && $rangeStart->lte($date) && $rangeEnd->gte($date)) {
                $data[] = $line;
            }
        }

        return $data;
    }

    private function getUpdateData()
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
