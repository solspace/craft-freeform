<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use Carbon\Carbon;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormEndDate extends FeatureBundle
{
    public const FORM_CLOSE_DATE_KEY = 'formCloseDate';

    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'handler']
        );
    }

    public function handler(FormEventInterface $event)
    {
        $form = $event->getForm();

        $closeDate = $form->getMetadata(self::FORM_CLOSE_DATE_KEY);
        if (!$closeDate) {
            return;
        }

        try {
            $today = new Carbon('now');

            $closeDate = new Carbon($closeDate);
            $closeDate->setTime(23, 59, 59);
        } catch (\Exception $exception) {
            return;
        }

        if ($today->greaterThan($closeDate)) {
            $form->addError(Freeform::t('This form can no longer be submitted.'));
        }
    }
}
