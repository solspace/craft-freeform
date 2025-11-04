<?php

namespace Solspace\Freeform\Bundles\Form\Security;

use craft\helpers\Db;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\db\Query;

class IdempotencyKeyBundle extends FeatureBundle
{
    private const KEY = 'idempotencyKey';
    private const TTL_MINUTES = 1;

    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'attachIdempotencyKeyAttribute'],
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'validateIdempotency'],
        );

        Event::on(
            Form::class,
            Form::EVENT_SUBMIT,
            [$this, 'storeIdempotencyKey'],
        );
    }

    public function attachIdempotencyKeyAttribute(AttachFormAttributesEvent $event): void
    {
        if ($this->isIdempotencyDisabled()) {
            return;
        }

        $form = $event->getForm();
        $attributes = $form->getAttributes();

        $attributes->replace('data-idempotency', true);
    }

    public function validateIdempotency(ValidationEvent $event): void
    {
        if ($this->isIdempotencyDisabled()) {
            return;
        }

        $idempotencyKey = $this->getPostedKey();
        // Do nothing if no idempotency key exists
        if (null === $idempotencyKey) {
            return;
        }

        try {
            $ttl = self::TTL_MINUTES;
            $exists = (new Query())
                ->select(self::KEY)
                ->from(Submission::TABLE)
                ->where([self::KEY => $idempotencyKey])
                ->andWhere(['formId' => $event->getForm()->getId()])
                ->andWhere(
                    Db::parseDateParam(
                        'dateCreated',
                        new \DateTime("-{$ttl} minute"),
                        '>='
                    )
                )
                ->limit(1)
                ->exists()
            ;
        } catch (\Throwable $e) {
            return;
        }

        if (!$exists) {
            return;
        }

        $event->getForm()->addError('This form has already been submitted.');
    }

    public function storeIdempotencyKey(SubmitEvent $event): void
    {
        if ($this->isIdempotencyDisabled()) {
            return;
        }

        $submission = $event->getSubmission();
        // Do nothing if an idempotency key is already set
        if ($submission->idempotencyKey) {
            return;
        }

        $idempotencyKey = $this->getPostedKey();
        if (null === $idempotencyKey) {
            return;
        }

        $submission->idempotencyKey = $idempotencyKey;
    }

    public function getPostedKey(): ?string
    {
        return \Craft::$app->request->getBodyParam(self::KEY);
    }

    public function isIdempotencyDisabled(): bool
    {
        return !$this->plugin()->settings->isUseIdempotencyKey();
    }
}
