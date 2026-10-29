<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class NumericFieldValidation extends FeatureBundle
{
    private const PATTERN = '/^([+-]?)(\d*)(?:[.,](\d*))?(?:[eE]([+-]?\d+))?$/';

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
        if (!$field instanceof NumberField) {
            return;
        }

        $raw = $field->getRawValue();
        // RequiredFieldValidation handles genuinely empty values, including zero correctly.
        if (null === $raw || '' === $raw) {
            return;
        }
        $value = \is_string($raw) ? trim($raw) : $raw;
        if ('' === $value) {
            return;
        }
        $config = $field->getNumberConfig();
        $messages = $config['messages'];
        if ((!\is_string($raw) && !\is_int($raw) && !\is_float($raw))
            || !preg_match(self::PATTERN, (string) $value, $matches)
            || '' === ($matches[2].($matches[3] ?? ''))
            || !is_finite((float) str_replace(',', '.', (string) $raw))
        ) {
            $field->addError($messages['numeric']);

            return;
        }

        // Inspect the submitted digits before getValue() converts them to a PHP number.
        $places = max(0, \strlen($matches[3] ?? '') - (int) ($matches[4] ?? 0));
        if ($places > $config['decimalCount']) {
            $field->addError(0 === $config['decimalCount'] ? $messages['whole'] : str_replace('{limit}', $config['decimalCount'], $messages['decimals']));

            return;
        }

        $number = (float) str_replace(',', '.', (string) $raw);
        $min = $config['min'];
        $max = $config['max'];
        if (!$config['allowNegative'] && $number < 0) {
            $field->addError($messages['negative']);
        } elseif ((null !== $min && $number < $min) || (null !== $max && $number > $max)) {
            $message = $messages[null !== $min && null !== $max ? 'range' : (null !== $min ? 'min' : 'max')];
            $field->addError(str_replace(['{min}', '{max}'], [(string) $min, (string) $max], $message));
        }
    }
}
