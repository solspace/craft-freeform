<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class PhoneValidation extends FeatureBundle
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
        if (!$field instanceof PhoneField) {
            return;
        }

        $value = $field->getValue();
        if (!$value) {
            return;
        }

        $pattern = $field->getPattern();
        $message = 'Invalid phone number';

        if (empty($pattern)) {
            if (!preg_match('/^\+?[0-9\- ,.\(\)]+$/', $value)) {
                $field->addError(Freeform::t($message));
            }

            return;
        }

        $compiledPattern = preg_replace('/([\[\](){}$+_\-+])/', '\\\$1', $pattern);
        preg_match_all('/(0+)/', $compiledPattern, $matches);

        if (isset($matches[1])) {
            foreach ($matches[1] as $match) {
                $compiledPattern = preg_replace(
                    '/'.$match.'/',
                    '[0-9]{'.\strlen($match).'}',
                    $compiledPattern,
                    1
                );
            }
        }

        $compiledPattern = '/^'.$compiledPattern.'$/';

        try {
            $valid = preg_match($compiledPattern, $value);
        } catch (\Exception $e) {
            $valid = false;
        }

        if (!$valid) {
            $field->addError(Freeform::t($message));
        }
    }
}
