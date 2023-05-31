<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Solspace\Freeform\Events\Submissions\CreateSubmissionFromFormEvent;
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

    public function modifyStatus(CreateSubmissionFromFormEvent $event)
    {
        $bag = $event->getForm()->getProperties();
        $statusId = $bag->get(self::BAG_KEY_STATUS);
        if (!$statusId) {
            return;
        }

        if (!is_numeric($statusId)) {
            $status = Freeform::getInstance()->statuses->getStatusByHandle($statusId);
            if ($status) {
                $statusId = $status->id;
            }
        }

        $event->getSubmission()->statusId = $statusId;
    }
}
