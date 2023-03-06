<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use yii\base\Event;

class IntegrationPersistence extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'handleIntegrationSave']
        );
    }

    public static function getPriority(): int
    {
        return 400;
    }

    public function handleIntegrationSave(PersistFormEvent $event)
    {
        $integrations = $event->getPayload()->integrations;

        $errors = [];
        foreach ($integrations as $integration) {
            $id = $integration->id;
            $enabled = $integration->enabled ?? false;
            $values = (array) $integration->values;

            if (!$id) {
                continue;
            }

            /** @var FormIntegrationRecord $record */
            $record = FormIntegrationRecord::find()
                ->where(['integrationId' => $id])
                ->one()
            ;

            $metadata = [];
            if ($record) {
                $metadata = json_decode($record->metadata, true);
            } else {
                $record = new FormIntegrationRecord();
                $record->enabled = false;
                $record->formId = $event->getFormId();
                $record->integrationId = $id;
            }

            // If no changes were made - we skip saving the record
            if (empty($values) && (bool) $record->enabled === $enabled) {
                continue;
            }

            $record->enabled = (bool) $enabled;
            $record->metadata = json_encode((object) array_merge($metadata, $values));

            $record->save();

            if ($record->hasErrors()) {
                $errors[$record->integrationId] = $record->getErrors();
            }
        }

        if ($errors) {
            $event->addErrorsToResponse('integrations', $errors);
        }
    }
}
