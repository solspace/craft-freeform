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
    private const PATTERN = '/^((((http(s)?)|(sftp)|(ftp)|(ssh)):\/\/)|(\/\/))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,15}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)$/i';

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
        if (null === $value || '' === $value) {
            return;
        }

        $parts = \is_string($value) ? parse_url($value) : false;
        if (
            !\is_array($parts)
            || empty($parts['host'])
            || !\in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https', 'sftp', 'ftp', 'ssh'], true)
            || !preg_match(self::PATTERN, $value)
        ) {
            $field->addError(Freeform::t('Enter a website address, like example.com.'));
        }
    }
}
