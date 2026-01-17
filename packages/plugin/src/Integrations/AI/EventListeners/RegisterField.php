<?php

namespace Solspace\Freeform\Integrations\AI\EventListeners;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RegisterField extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldTypesProvider::class,
            FieldTypesProvider::EVENT_REGISTER_FIELD_TYPES,
            [$this, 'registerFieldTypes']
        );
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event): void
    {
        $hasAiIntegration = Freeform::getInstance()
            ->integrations
            ->isIntegrationTypeEnabled('ai')
        ;

        if ($hasAiIntegration) {
            $event->addType(AiField::class);
        }
    }
}
