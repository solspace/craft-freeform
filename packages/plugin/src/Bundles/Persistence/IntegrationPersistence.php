<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\IntegrationRecord;
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

    public function handleIntegrationSave(PersistFormEvent $event): void
    {
        $integrations = $event->getPayload()->integrations ?? null;
        if (!$integrations) {
            return;
        }

        $errors = [];
        foreach ($integrations as $integration) {
            $id = $integration->id;
            $enabled = $integration->enabled ?? false;
            $values = (array) $integration->values;

            if (!$id) {
                continue;
            }

            $integrationRecord = IntegrationRecord::findOne(['id' => $id]);
            if (!$integrationRecord) {
                continue;
            }

            /** @var FormIntegrationRecord $record */
            $record = FormIntegrationRecord::find()
                ->where([
                    'formId' => $event->getForm()->getId(),
                    'integrationId' => $id,
                ])
                ->one()
            ;

            $metadata = [];
            if ($record) {
                $metadata = $record->metadata;
            } else {
                $record = new FormIntegrationRecord();
                $record->enabled = false;
                $record->formId = $event->getFormId();
                $record->integrationId = $id;
            }

            $encodedMetadata = array_merge($metadata, $values);

            $matchEnabled = (bool) $record->enabled === (bool) $enabled;
            $matchMetadata = $encodedMetadata === $record->metadata;

            if ((bool) $record->id) {
                if ($matchEnabled && $matchMetadata) {
                    continue;
                }
            } else {
                $originalMetadata = $integrationRecord->metadata;
                $enabledByDefault = $originalMetadata->enabledByDefault ?? null;

                if (\is_bool($enabledByDefault)) {
                    if ($enabledByDefault === $enabled && $encodedMetadata === $originalMetadata) {
                        continue;
                    }
                } elseif (!$enabled) {
                    continue;
                }
            }

            $record->enabled = (bool) $enabled;
            $record->metadata = $encodedMetadata;

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
