<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use libphonenumber\NumberParseException;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;
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
        if (null === $value || '' === $value) {
            return;
        }

        if ($field->isInternational()) {
            try {
                // Do not silently discard letters, extensions, or excessively long input.
                if (!\is_string($value) || \strlen($value) > 100 || !preg_match('/^\+?[0-9\s().\/-]+$/D', trim($value))) {
                    $field->addError(Freeform::t('Invalid phone number'));

                    return;
                }
                $phone = PhoneNumberUtil::getInstance();
                $number = $phone->parse($value, $field->getInitialCountryCode());
                $country = $phone->getRegionCodeForNumber($number);
                if (!$phone->isValidNumber($number) || !\in_array($country, $field->getAllowedCountryCodes(), true)) {
                    $field->addError(Freeform::t('Invalid phone number'));

                    return;
                }
                $field->setValue($phone->format($number, PhoneNumberFormat::E164));
            } catch (NumberParseException $exception) {
                $field->addError(Freeform::t('Invalid phone number'));
            }

            return;
        }

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
