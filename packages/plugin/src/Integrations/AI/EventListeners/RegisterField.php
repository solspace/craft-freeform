<?php

namespace Solspace\Freeform\Integrations\AI\EventListeners;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\IntegrationRecord;
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
        $hasAiIntegration = IntegrationRecord::find()
            ->where(['type' => 'ai'])
            ->andWhere(['enabled' => true])
            ->count()
        ;

        if ($hasAiIntegration) {
            $event->addType(AiField::class);
        }
    }
}
