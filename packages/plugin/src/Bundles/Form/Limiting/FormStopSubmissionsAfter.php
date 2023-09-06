<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use Carbon\Carbon;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormStopSubmissionsAfter extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'handler']
        );
    }

    public function handler(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $stopDate = $form->getSettings()->getBehavior()->stopSubmissionsAfter;
        if (!$stopDate) {
            return;
        }

        $today = new Carbon('now');
        $stopDate = clone $stopDate;
        $stopDate = $stopDate->setTime(23, 59, 59);

        if ($today->greaterThan($stopDate)) {
            $form->addError(Freeform::t('This form can no longer be submitted.'));
        }
    }
}
