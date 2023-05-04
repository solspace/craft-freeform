<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use yii\base\Event;

class NotificationPersistence extends FeatureBundle
{
    public function __construct(private PropertyProvider $propertyProvider)
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

    public function handleNotificationSave(PersistFormEvent $event): void
    {
        $notifications = $event->getPayload()->notifications;

        /** @var FormNotificationRecord[] $record */
        $existingRecords = FormNotificationRecord::find()
            ->where(['formId' => $event->getFormId()])
            ->indexBy('uid')
            ->all()
        ;

        $usedUIDs = [];
        $existingUIDs = array_keys($existingRecords);

        $records = [];
        foreach ($notifications as $notification) {
            $uid = $notification->uid;
            $enabled = $notification->enabled ?? false;
            $class = $notification->class;

            $record = $existingRecords[$uid] ?? null;
            if (!$record) {
                $record = new FormNotificationRecord();
                $record->uid = $uid;
                $record->enabled = $enabled;
                $record->class = $class;
                $record->formId = $event->getFormId();
            }

            $record->metadata = $this->getValidatedMetadata($notification, $event);
            $record->save();

            $records[] = $record;
            $usedUIDs[] = $record->uid;
        }

        $deletableUIDs = array_diff($existingUIDs, $usedUIDs);
        if ($deletableUIDs) {
            \Craft::$app
                ->db
                ->createCommand()
                ->delete(FormNotificationRecord::TABLE, ['uid' => $deletableUIDs])
                ->execute();
        }

        if ($event->hasErrors()) {
            return;
        }

        foreach ($records as $record) {
            $record->save();
        }
    }

    // TODO: Move this to a separate class and combine with the one in FieldPersistence
    private function getValidatedMetadata(\stdClass $object, PersistFormEvent $event): array
    {
        $properties = $this->propertyProvider->getEditableProperties($object->class);

        $metadata = [];
        foreach ($properties as $property) {
            $handle = $property->handle;
            $value = $object->{$handle} ?? null;

            $errors = [];
            foreach ($property->validators as $validator) {
                $errors = array_merge($errors, $validator->validate($value));
            }

            if ($errors) {
                $event->addErrorsToResponse(
                    'notifications',
                    [$object->uid => [$property->handle => $errors]]
                );
            }

            $metadata[$handle] = $value;
        }

        return $metadata;
    }
}
