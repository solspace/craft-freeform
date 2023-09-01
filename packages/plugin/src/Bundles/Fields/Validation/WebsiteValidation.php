<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class WebsiteValidation extends FeatureBundle
{
    private const PATTERN = '/^((((http(s)?)|(sftp)|(ftp)|(ssh)):\/\/)|(\/\/))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)$/i';

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
        if (!$field instanceof WebsiteField) {
            return;
        }

        $value = $field->getValue();
        if (empty($value)) {
            return;
        }

        if (!preg_match(self::PATTERN, $value)) {
            $field->addError(Freeform::t('Website not valid'));
        }
    }
}
