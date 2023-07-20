<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class InputLengthValidation extends FeatureBundle
{
    private const MAX_LENGTH = 65535;

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
        if (!$field instanceof TextareaField) {
            return;
        }

        $value = $field->getValue();

        $length = \strlen($value);
        if ($length <= self::MAX_LENGTH) {
            return;
        }

        $message = str_replace(
            ['{{max}}', '{{length}}', '{{difference}}'],
            [self::MAX_LENGTH, $length, $length - self::MAX_LENGTH],
            Freeform::t('The allowed maximum length is {{max}} characters. Current size is {{difference}} characters too long.')
        );

        $field->addError($message);
    }
}
