<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\NoRFCWarningsValidation;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class EmailValidation extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validate']
        );
    }

    public function validate(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof EmailField) {
            return;
        }

        $value = trim($field->getValue());
        if (empty($value)) {
            return;
        }

        $validator = new EmailValidator();
        $hasDot = preg_match('/@.+\..+$/', $email);

        if (!$hasDot || !$validator->isValid($email, new NoRFCWarningsValidation())) {
            $field->addError(
                Freeform::t(
                    '{email} is not a valid email address',
                    ['email' => $email],
                )
            );
        }
    }
}
