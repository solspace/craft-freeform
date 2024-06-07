<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class TableValidation extends FeatureBundle
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
        if (!$field instanceof TableField) {
            return;
        }

        $value = $field->getValue();
        if (empty($value)) {
            return;
        }

        $maxRows = $field->getMaxRows();
        if (empty($maxRows)) {
            return;
        }

        $rows = \count($value);

        if ($rows > $maxRows) {
            $message = str_replace(
                '{{maxRows}}',
                $maxRows,
                Freeform::t('The maximum number of rows is {{maxRows}}.')
            );

            $field->addError($message);
        }
    }
}
