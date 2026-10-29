<?php

namespace Solspace\Freeform\Bundles\Activity;

use craft\services\Gc;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Integrations\FailedRequestEvent;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\PurgeActivityJob;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Activity\FormChangeSummary;
use Solspace\Freeform\Library\Activity\SpamChecks;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Application;
use yii\base\Event;
use yii\queue\Queue;

class ActivityBundle extends FeatureBundle
{
    private \WeakMap $spamRecorded;
    private \WeakMap $formSnapshots;

    public function __construct()
    {
        $this->spamRecorded = new \WeakMap();
        $this->formSnapshots = new \WeakMap();
        Event::on(FormsController::class, FormsController::EVENT_UPDATE_FORM, [$this, 'beforeFormSaved']);
        Event::on(FormsController::class, FormsController::EVENT_CREATE_FORM, [$this, 'beforeFormSaved']);
        Event::on(SubmissionsService::class, SubmissionsService::EVENT_AFTER_SUBMIT, [$this, 'submissionSaved']);
        Event::on(Form::class, Form::EVENT_AFTER_VALIDATE, [$this, 'validated']);
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT_ATTEMPT, [$this, 'spamChecked']);
        Event::on(Form::class, Form::EVENT_AFTER_ASYNC_SPAM_VALIDATION, [$this, 'spamChecked']);
        Event::on(FormsController::class, FormsController::EVENT_AFTER_SAVE_FORM, [$this, 'formSaved']);
        Event::on(IntegrationInterface::class, IntegrationInterface::EVENT_AFTER_RESPONSE, [$this, 'integrationResponse']);
        Event::on(IntegrationInterface::class, IntegrationInterface::EVENT_ON_FAILED_REQUEST, [$this, 'integrationFailed']);
        Event::on(Queue::class, Queue::EVENT_BEFORE_EXEC, function () { $this->service()->reset(); });
        Event::on(Queue::class, Queue::EVENT_AFTER_EXEC, [$this, 'flush']);
        Event::on(Queue::class, Queue::EVENT_AFTER_ERROR, [$this, 'flush']);
        Event::on(Application::class, Application::EVENT_AFTER_REQUEST, [$this, 'flush']);
        // Other bundles can log during their own after-request callbacks. Drain any remainder
        // without repeating a successful batch, including normal framework error exits.
        register_shutdown_function([$this, 'flush']);
        Event::on(Gc::class, Gc::EVENT_RUN, function () { $this->scheduleCleanup(); });
        if (!\Craft::$app->getRequest()->getIsConsoleRequest()) {
            Event::on(Application::class, Application::EVENT_AFTER_REQUEST, [$this, 'scheduleCleanup']);
        }
    }

    // Register the before-save observer ahead of persistence (priority 200+).
    public static function getPriority(): int
    {
        return 100;
    }

    public function beforeFormSaved(PersistFormEvent $event): void
    {
        try {
            if ($this->service()->isEnabled('form-change')) {
                $this->formSnapshots[$event] = FormChangeSummary::capture($event->getFormId());
            }
        } catch (\Throwable) {
            // Comparing a configuration must never affect its save.
        }
    }

    public function flush(): void
    {
        try {
            $this->service()->flush();
        } catch (\Throwable) {
            // Includes component/connection initialization failures at request teardown.
        }
    }

    public function submissionSaved(SubmitEvent $event): void
    {
        if ($event->getSubmission()->isSpam) {
            $this->spamChecked($event);
        } else {
            $this->service()->record('submission', $event->getForm()->getId(), $event->getSubmission()->id);
        }
    }

    public function validated(ValidationEvent $event): void
    {
        $form = $event->getForm();
        if (!$form->isValid() && !$form->isMarkedAsSpam()) {
            $this->service()->recordForForm('validation', $form, ['errorCount' => \count($form->getErrors())]);
        }
    }

    public function spamChecked($event): void
    {
        $form = $event->getForm();
        if (($form->isMarkedAsSpam() || $form->getSubmission()?->isSpam) && !isset($this->spamRecorded[$form])) {
            $this->spamRecorded[$form] = true;
            $this->service()->recordForForm('spam', $form, SpamChecks::metadata($form->getSpamReasons()));
        }
    }

    public function formSaved(PersistFormEvent $event): void
    {
        try {
            if (!$event->hasErrors() && $this->service()->isEnabled('form-change')) {
                $formId = $event->getForm()?->getId() ?? $event->getFormId();
                $metadata = ['summaryIncomplete' => 1];
                if (isset($this->formSnapshots[$event])) {
                    $metadata = FormChangeSummary::compare($this->formSnapshots[$event], FormChangeSummary::capture($formId));
                }
                $this->service()->record('form-change', $formId, null, $metadata);
            }
        } catch (\Throwable) {
            // Activity and its summary are both optional observers of a successful save.
        } finally {
            unset($this->formSnapshots[$event]);
        }
    }

    public function integrationResponse(IntegrationResponseEvent $event): void
    {
        $this->service()->recordIntegrationResponse($event->getResponse()->getStatusCode(), $event->getIntegration()->getId());
    }

    public function integrationFailed(FailedRequestEvent $event): void
    {
        if ($this->service()->hasRecordedIntegrationFailure($event->getException())) {
            return;
        }
        $metadata = ActivityContext::integrationFailure($event->getException()) + ['integrationId' => $event->getIntegration()->getId(), 'attempt' => 1];
        $form = $event->getForm();
        $this->service()->record('integration-error', $form?->getId(), $form?->getSubmission()?->id, $metadata);
    }

    public function scheduleCleanup(): void
    {
        try {
            $cache = \Craft::$app->getCache();
            if ($cache->get('freeform-activity-cleanup')) {
                return;
            }
            if ($cache->add('freeform-activity-cleanup', true, 3600)) {
                try {
                    \Craft::$app->getQueue()->push(new PurgeActivityJob());
                } catch (\Throwable) {
                    $cache->delete('freeform-activity-cleanup');
                }
            }
        } catch (\Throwable) {
            // Queue/cache availability must not affect submission requests.
        }
    }

    private function service(): ActivityService
    {
        return Freeform::getInstance()->get('activity');
    }
}
