<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RegexValidation extends FeatureBundle
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
        if (!$field instanceof RegexField) {
            return;
        }

        $value = $field->getValue();
        $pattern = $field->getPattern();
        if (empty($pattern) || empty($value)) {
            return;
        }

        if ('/' !== $pattern[0]) {
            $pattern = '/'.$pattern;
        }

        if ('/' !== $pattern[max(0, \strlen($pattern) - 1)]) {
            $pattern .= '/';
        }

        if (!preg_match($pattern, $value)) {
            $message = str_replace(
                '{{pattern}}',
                $pattern,
                Freeform::t($field->getMessage())
            );

            $field->addError($message);
        }
    }
}
