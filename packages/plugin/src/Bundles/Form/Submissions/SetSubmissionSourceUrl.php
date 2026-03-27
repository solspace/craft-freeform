<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Solspace\Freeform\Events\Forms\CreateSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SetSubmissionSourceUrl extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_CREATE_SUBMISSION,
            [$this, 'setSourceUrl']
        );
    }

    public function setSourceUrl(CreateSubmissionEvent $event): void
    {
        $request = \Craft::$app->getRequest();
        if ($request->getIsConsoleRequest()) {
            return;
        }

        $submission = $event->getSubmission();
        $sourceUrl = $request->getReferrer();
        if (!$sourceUrl) {
            $sourceUrl = $request->getBodyParam(Form::SOURCE_URL_KEY);
        }

        if ($sourceUrl) {
            if (false === filter_var($sourceUrl, \FILTER_VALIDATE_URL)) {
                $sourceUrl = null;
            }
        }

        $submission->sourceUrl = $sourceUrl ?: null;
    }
}
