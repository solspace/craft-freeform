<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

use craft\db\Table;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;

class ThrottleSubmissions extends AbstractCheck
{
    public function handleCheck(ValidationEvent $event)
    {
        $throttleCount = (int) $this->getSettings()->submissionThrottlingCount;

        if (Settings::THROTTLING_TIME_FRAME_MINUTES === $this->getSettings()->submissionThrottlingTimeFrame) {
            $interval = 'minutes';
        } else {
            $interval = 'seconds';
        }

        if (!$throttleCount) {
            return;
        }

        $form = $event->getForm();

        $date = new \DateTime("-1 {$interval}", new \DateTimeZone('UTC'));
        $date = $date->format('Y-m-d H:i:s');

        $submissions = Submission::TABLE;

        $query = (new Query())
            ->select("COUNT({$submissions}.[[id]])")
            ->from($submissions)
            ->where(["{$submissions}.[[formId]]" => $form->getId()])
            ->andWhere("{$submissions}.[[dateCreated]] > :date", ['date' => $date])
        ;

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Table::ELEMENTS;
            $query->innerJoin(
                $elements,
                "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
            );
        }

        $submissionCount = (int) $query->scalar();

        if ($throttleCount <= $submissionCount) {
            $form->addError(Freeform::t('There was an error processing your submission. Please try again later.'));
        }
    }
}
