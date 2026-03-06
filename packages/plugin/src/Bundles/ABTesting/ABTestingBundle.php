<?php

namespace Solspace\Freeform\Bundles\ABTesting;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Bundles\ABTesting\Endpoints\StatisticsTracker;
use Solspace\Freeform\Events\Event;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\AbTests\AbTestStatisticsRecord;
use Solspace\Freeform\Records\AbTests\AbTestVariantRecord;
use yii\web\UrlRule;

class ABTestingBundle extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('ab-test-statistics', StatisticsTracker::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            static function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/ab-test/tracker',
                    'route' => 'freeform/ab-test-statistics/track',
                    'verb' => ['POST'],
                ]);
            }
        );

        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'attachAttribute'],
        );

        Event::once(
            Form::class,
            Form::EVENT_AFTER_SUBMIT,
            [$this, 'registerSubmit'],
        );

        Event::on(
            Form::class,
            Form::EVENT_AFTER_VALIDATE,
            [$this, 'registerFailedSubmit'],
        );
    }

    public function attachAttribute(AttachFormAttributesEvent $event): void
    {
        [, $variant, $sessionId] = $this->getFormAndVariant($event);
        if (!$variant || !$sessionId) {
            return;
        }

        $form = $event->getForm();
        $attributes = $form->getAttributes();

        $attributes->replace('data-ab-test', $sessionId);
    }

    public function registerTest(FormEventInterface $event): void
    {
        [$form, $variant, $sessionId] = $this->getFormAndVariant($event);
        if (!$form || !$variant || !$sessionId) {
            return;
        }

        $exists = AbTestStatisticsRecord::find()
            ->where([
                'formId' => $form->getId(),
                'abTestId' => $variant->abTestId,
                'abVariantId' => $variant->id,
                'sessionId' => $sessionId,
            ])
            ->count()
        ;

        if ($exists) {
            return;
        }

        $record = new AbTestStatisticsRecord();
        $record->formId = $form->getId();
        $record->abTestId = $variant->abTestId;
        $record->abVariantId = $variant->id;
        $record->status = AbTestStatisticsRecord::STATUS_SERVED;
        $record->sessionId = $sessionId;
        $record->save();
    }

    public function registerSubmit(SubmitEvent $event): void
    {
        [$form, $variant, $sessionId] = $this->getFormAndVariant($event);
        if (!$form || !$variant || !$sessionId) {
            return;
        }

        $record = AbTestStatisticsRecord::findOne([
            'abTestId' => $variant->abTestId,
            'abVariantId' => $variant->id,
            'formId' => $form->getId(),
            'sessionId' => $sessionId,
        ]);

        if (!$record) {
            return;
        }

        $record->status = AbTestStatisticsRecord::STATUS_COMPLETED;
        $record->lastError = null;
        $record->save();
    }

    public function registerFailedSubmit(ValidationEvent $event): void
    {
        [$form, $variant, $sessionId] = $this->getFormAndVariant($event);
        if (!$form || !$variant || !$sessionId) {
            return;
        }

        if (!$form->hasErrors()) {
            return;
        }

        $record = AbTestStatisticsRecord::findOne([
            'abTestId' => $variant->abTestId,
            'abVariantId' => $variant->id,
            'formId' => $form->getId(),
            'sessionId' => $sessionId,
        ]);

        if (!$record) {
            return;
        }

        $error = [
            'errors' => $form->getFieldErrors(),
            'formErrors' => $form->getErrors(),
        ];

        $record->status = AbTestStatisticsRecord::STATUS_FAILED;
        $record->lastError = json_encode($error);
        $record->save();
    }

    /**
     * @return array{0: null|Form, 1: null|AbTestVariantRecord, 2: null|string}
     */
    private function getFormAndVariant(FormEventInterface $event): array
    {
        $form = $event->getForm();
        $abTest = $form->getProperties()->get('abTest');
        if (!$abTest) {
            return [null, null, null];
        }

        $variantUid = $abTest['variant'] ?? null;
        $sessionId = $abTest['sessionId'] ?? null;

        if (!$variantUid || !$sessionId) {
            return [null, null, null];
        }

        $variant = AbTestVariantRecord::findOne(['uid' => $variantUid]);
        if (!$variant) {
            return [null, null, null];
        }

        return [$form, $variant, $sessionId];
    }
}
