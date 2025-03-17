<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CheckboxesLimitValidation extends FeatureBundle
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
        if (!$field instanceof CheckboxesField) {
            return;
        }

        $limit = $field->getLimit();
        if (!$limit) {
            return;
        }

        $values = \count($field->getValue());
        $options = \count($field->getOptions());

        switch ($limit) {
            case CheckboxesField::LIMIT_REQUIRE_ALL:
                if ($values < $options) {
                    $field->addError(Freeform::t('All options must be selected.'));
                }

                return;

            case CheckboxesField::LIMIT_MINIMUM:
                $min = $field->getLimitMin();
                if ($values < $min) {
                    $field->addError(Freeform::t('At least {min} options must be selected.', ['min' => $min]));
                }

                return;

            case CheckboxesField::LIMIT_MAXIMUM:
                $max = $field->getLimitMax();
                if (null === $max) {
                    return;
                }

                if ($values > $max) {
                    $field->addError(Freeform::t('No more than {max} options must be selected.', ['max' => $max]));
                }

                return;

            case CheckboxesField::LIMIT_RANGE:
                [$min, $max] = $field->getLimitRange();
                if ($values < $min || $values > $max) {
                    $field->addError(Freeform::t('Between {min} and {max} options must be selected.', ['min' => $min, 'max' => $max]));
                }

                return;
        }
    }
}
