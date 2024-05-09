<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\CharacterVariabilityInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CharacterVariabilityValidation extends FeatureBundle
{
    private const PATTERN = '/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{4,}$/';

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
        if (!$field instanceof CharacterVariabilityInterface) {
            return;
        }

        if (!$field->isUseCharacterVariability()) {
            return;
        }

        $value = $field->getValue();
        if (empty($value)) {
            return;
        }

        if (!preg_match(self::PATTERN, $value)) {
            $field->addError(
                Freeform::t('Value should contain at least one number, one lowercase letter, one uppercase letter, and one special character')
            );
        }
    }
}
