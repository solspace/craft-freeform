<?php

namespace Solspace\Freeform\Services\Pro;

use Carbon\Carbon;
use craft\web\View;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Records\FeedMessageRecord;
use Solspace\Freeform\Records\NotificationLogRecord;
use Solspace\Freeform\Records\NotificationRecord;
use yii\base\Component;

class DigestService extends Component
{
    const CACHE_KEY_DIGEST = 'freeform-digest-cache-key';
    const CACHE_TTL_DIGEST = 60 * 60 * 3; // every 3h

    const TEMPLATE_PATH = __DIR__.'/../../templates/_emailTemplates/digest.twig';

    public function triggerDigest()
    {
        if (Freeform::isLocked(self::CACHE_KEY_DIGEST, self::CACHE_TTL_DIGEST)) {
            return;
        }

        $rangeStart = new Carbon('now');
        $rangeStart->setTime(0, 0, 0);

        $dayOfWeek = $rangeStart->dayOfWeek;
        $rangeStart->subDay($dayOfWeek === 0 ? 6 : $dayOfWeek - 1);

        $rangeEnd = $rangeStart
            ->copy()
            ->setTime(23, 59, 59)
            ->addDays(6)
        ;

        $record = NotificationLogRecord::find()
            ->where(['between', 'dateCreated', $rangeStart->toDateTimeString(), $rangeEnd->toDateTimeString()])
            ->andWhere(['type' => NotificationLogRecord::TYPE_DIGEST])
            ->one()
        ;

        if ($record) {
            return;
        }

        $this->sendDigest($rangeStart->subdays(7), $rangeEnd->subDays(7));

        $record = new NotificationLogRecord();
        $record->type = NotificationLogRecord::TYPE_DIGEST;
        $record->save();
    }

    public function sendDigest(Carbon $rangeStart, Carbon $rangeEnd)
    {
        $freeform = Freeform::getInstance();

        $mailer = $freeform->mailer;
        $settingsService = $freeform->settings;

        $recipients = $settingsService->getDigestRecipients();
        if (!count($recipients)) {
            return;
        }

        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);

        $notification = NotificationRecord::createFromTemplate(self::TEMPLATE_PATH);

        $message = $mailer->compileMessage(
            $notification,
            [
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
            ->orderBy(['issueDate' => SORT_DESC])
            ->all()
        ;

        $data = [];
        foreach ($messages as $message) {
            $data[] = $message->toArray();
        }

        return $data;
    }
}
