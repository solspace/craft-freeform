<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Limiting\SubmissionLimit;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SubmissionLimiter extends FeatureBundle
{
    public const BAG_KEY = 'submissionLimit';

    private array $locks = [];

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_SUBMIT, [$this, 'handleLimit']);
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT_ATTEMPT, [$this, 'releaseLock']);
    }

    public static function getPriority(): int
    {
        // Resolve restored/template properties and run after spam/duplicate checks.
        return 1200;
    }

    public function handleLimit(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $config = SubmissionLimit::resolve($form);
        if (null === $config || !$event->isValid || $form->getActions() || $form->getSubmission()?->id) {
            return;
        }

        if (SubmissionLimit::isBuilderEnabled($form) && (!$form->getSettings()->getGeneral()->storeData || !$form->hasOptInPermission())) {
            $form->addError(Freeform::t('Submission limits require stored submissions.'));
            $event->isValid = false;

            return;
        }

        $key = 'freeform-submission-limit-'.$form->getId();
        if (!\Craft::$app->getMutex()->acquire($key, 10)) {
            $form->addError(Freeform::t('Another submission is being processed. Please try again.'));
            $event->isValid = false;

            return;
        }

        $this->locks[spl_object_id($form)] = $key;

        try {
            // Recheck on the primary database while holding the form lock until
            // persistence finishes, so simultaneous requests cannot take the last slot.
            $submission = $event->getSubmission();
            $submission->dateCreated ??= Carbon::now('UTC');
            $db = \Craft::$app->getDb();
            $count = $db->useMaster(static fn () => $db->noCache(static fn () => SubmissionLimit::getCount($form, $submission->dateCreated)));
            if ($count >= $config['limit']) {
                $form->addError($form->getSubmissionLimitMessage() ?: Freeform::t('Submission limit reached'));
                $event->isValid = false;
                $this->releaseLock($event);
            }
        } catch (\Throwable $exception) {
            $this->releaseLock($event);

            throw $exception;
        }
    }

    public function releaseLock(SubmitEvent $event): void
    {
        $id = spl_object_id($event->getForm());
        if (isset($this->locks[$id])) {
            \Craft::$app->getMutex()->release($this->locks[$id]);
            unset($this->locks[$id]);
        }
    }
}
