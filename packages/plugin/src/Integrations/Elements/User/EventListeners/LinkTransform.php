<?php

namespace Solspace\Freeform\Integrations\Elements\User\EventListeners;

use craft\fields\Link;
use craft\fields\Url;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

class LinkTransform extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            ElementIntegrationInterface::class,
            ElementIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'processLink']
        );
    }

    public function processLink(ProcessValueEvent $event): void
    {
        $craftField = $event->getCraftField();

        $isLinkField = class_exists(Link::class) && $craftField instanceof Link;
        $isUrlField = class_exists(Url::class) && $craftField instanceof Url;

        if (!$isLinkField && !$isUrlField) {
            return;
        }

        $value = $event->getValue();

        if (($value === null || $value === '') && !$craftField->required) {
            $event->isValid = false;

            return;
        }

        if (!\is_array($value)) {
            $value = [$value];
        }

        // Link fields expose which types are allowed; the legacy Url field is URL-only.
        $allowedTypes = $isLinkField ? $craftField->types : ['url'];

        $value = array_map(
            static function ($val) use ($allowedTypes) {
                if (\in_array('email', $allowedTypes, true)) {
                    if (filter_var($val, \FILTER_VALIDATE_EMAIL)) {
                        return 'mailto:'.$val;
                    }
                }

                if (
                    \in_array('tel', $allowedTypes, true)
                    || \in_array('phone', $allowedTypes, true)
                ) {
                    $val = preg_replace('/[^0-9]/', '', $val);

                    return 'tel:'.$val;
                }

                if (\in_array('url', $allowedTypes, true)) {
                    if (!preg_match('/^https?:\/\//', $val)) {
                        return 'http://'.$val;
                    }
                }

                return $val;
            },
            $value
        );

        $value = reset($value);

        $event->setValue($value);
    }
}
