<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Bundles\Form\SaveForm\SaveFormsHelper;
use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Events\Forms\HeadlessRequestEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class HeadlessRequestContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_HEADLESS_REQUEST, [$this, 'handleRequest']);
    }

    public function handleRequest(HeadlessRequestEvent $event): void
    {
        $form = $event->getForm();
        $values = $event->getValues();
        $draftLoaded = SaveFormsHelper::isLoaded($form);
        $transformed = [];

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof PersistentValueInterface || !$field->getHandle()) {
                continue;
            }

            $handle = $field->getHandle();
            if (!\array_key_exists($handle, $values)) {
                continue;
            }

            $posted = $values[$handle];

            // Resume hydrate often posts empty defaults — don't wipe loaded draft values.
            if ($draftLoaded && self::isEmptyPostedValue($posted) && !$this->isFieldValueEmpty($field->getValue())) {
                continue;
            }

            $transformEvent = new TransformValueEvent($field, $posted);
            Event::trigger(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, $transformEvent);

            if (!$transformEvent->isValid) {
                continue;
            }

            $transformed[$handle] = $transformEvent->getValue();
        }

        if ([] !== $transformed) {
            $form->setFieldValues($transformed);
        }
    }

    private static function isEmptyPostedValue(mixed $value): bool
    {
        if (null === $value) {
            return true;
        }

        if (\is_string($value)) {
            return '' === trim($value);
        }

        if (\is_array($value)) {
            return [] === $value;
        }

        return false;
    }

    private function isFieldValueEmpty(mixed $value): bool
    {
        return self::isEmptyPostedValue($value);
    }
}
