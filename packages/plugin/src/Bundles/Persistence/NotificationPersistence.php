<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\controllers\api\FormsController;
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
        if ($event->hasErrors()) {
            return;
        }

        $notifications = $event->getPayload()->notifications ?? null;
        if (null === $notifications) {
            return;
        }

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
            $enabled = $notification->enabled ?? true;
            $className = $notification->className;

            $record = $existingRecords[$uid] ?? null;
            if (!$record) {
                $record = new FormNotificationRecord();
                $record->uid = $uid;
                $record->class = $className;
                $record->formId = $event->getFormId();
            }

            $record->enabled = $enabled;
            $record->metadata = $this->getValidatedMetadata($notification, $event);

            $records[] = $record;
            $usedUIDs[] = $record->uid;
        }

        $deletableUIDs = array_diff($existingUIDs, $usedUIDs);
        if ($deletableUIDs) {
            \Craft::$app
                ->db
                ->createCommand()
                ->delete(FormNotificationRecord::TABLE, ['uid' => $deletableUIDs])
                ->execute()
            ;
        }

        foreach ($records as $record) {
            $record->save();
            $event->addNotificationRecord($record);
        }
    }

    // TODO: Move this to a separate class and combine with the one in FieldPersistence
    private function getValidatedMetadata(\stdClass $object, PersistFormEvent $event): array
    {
        $properties = $this->propertyProvider->getEditableProperties($object->className);

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
