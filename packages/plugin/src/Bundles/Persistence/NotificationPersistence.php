<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use yii\base\Event;

class NotificationPersistence extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'handleNotificationSave']
        );
    }

    public static function getPriority(): int
    {
        return 400;
    }

    public function handleNotificationSave(PersistFormEvent $event)
    {
        $notifications = $event->getPayload()->notifications;

        $errors = [];
        foreach ($notifications as $notification) {
            $id = $notification->id;
            $enabled = $notification->enabled ?? false;
            $values = (array) $notification->values;

            if (!$id) {
                continue;
            }

            /** @var FormNotificationRecord $record */
            $record = FormNotificationRecord::find()
                ->where(['notificationId' => $id])
                ->one()
            ;

            $metadata = [];
            if ($record) {
                $metadata = json_decode($record->metadata, true);
            } else {
                $record = new FormNotificationRecord();
                $record->enabled = false;
                $record->formId = $event->getFormId();
                $record->notificationId = $id;
            }

            // If no changes were made - we skip saving the record
            if (empty($values) && (bool) $record->enabled === $enabled) {
                continue;
            }

            $record->enabled = (bool) $enabled;
            $record->metadata = json_encode((object) array_merge($metadata, $values));

            $record->save();

            if ($record->hasErrors()) {
                $errors[$record->notificationId] = $record->getErrors();
            }
        }

        if ($errors) {
            $event->addErrorsToResponse('notifications', $errors);
        }
    }
}
