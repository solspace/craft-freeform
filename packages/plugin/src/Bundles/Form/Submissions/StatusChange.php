<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Solspace\Freeform\Events\Forms\CreateSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class StatusChange extends FeatureBundle
{
    public const BAG_KEY_STATUS = 'status';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_CREATE_SUBMISSION, [$this, 'modifyStatus']);
    }

    public static function getStatus(Form $form)
    {
        return $form->getProperties()->get(self::BAG_KEY_STATUS);
    }

    public function modifyStatus(CreateSubmissionEvent $event): void
    {
        $form = $event->getForm();

        $statusId = self::getStatus($form);
        if (!$statusId) {
            return;
        }

        if (!is_numeric($statusId)) {
            $status = Freeform::getInstance()->statuses->getStatusByHandle($statusId);
            if ($status) {
                $statusId = $status->id;
            }
        }

        $form->getSubmission()->statusId = $statusId;
    }
}
