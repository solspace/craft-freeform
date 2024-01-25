<?php

namespace Solspace\Freeform\Bundles\Backup\Import;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationException;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\NotificationsService;

class FreeformImporter
{
    private array $notificationIdMap = [];

    public function __construct(
        private NotificationsService $notificationsService,
        private FreeformSerializer $serializer,
    ) {}

    public function import(FreeformDataset $dataset): void
    {
        $this->importNotifications($dataset->getNotificationTemplates());
        $this->importForms($dataset->getForms());
    }

    private function importForms(FormCollection $forms): void
    {
        foreach ($forms as $form) {
            if (FormRecord::findOne(['uid' => $form->uid])) {
                continue;
            }

            $formRecord = FormRecord::create();
            $formRecord->uid = $form->uid;
            $formRecord->name = $form->name;
            $formRecord->handle = $form->handle;
            $formRecord->type = Regular::class;

            $formRecord->createdByUserId = \Craft::$app->getUser()->getIdentity()->id;
            $formRecord->updatedByUserId = $formRecord->createdByUserId;

            $serialized = $this->serializer->serialize($form->settings, 'json');
            $formRecord->metadata = $serialized;

            $formRecord->save();

            foreach ($form->notifications as $notification) {
                $notificationRecord = new FormNotificationRecord();
                $notificationRecord->uid = StringHelper::UUID();
                $notificationRecord->formId = $formRecord->id;
                $notificationRecord->class = $notification->type;
                $notificationRecord->enabled = true;

                $metadata = $notification->metadata;
                $metadata['name'] = $notification->name;
                $metadata['enabled'] = true;
                $metadata[$notification->idAttribute] = $this->notificationIdMap[$notification->id] ?? null;

                $notificationRecord->metadata = json_encode($metadata);
                $notificationRecord->save();
            }

            foreach ($form->pages as $pageIndex => $page) {
                $layoutRecord = FormLayoutRecord::findOne(['uid' => $page->layout->uid]) ?? new FormLayoutRecord();
                $layoutRecord->formId = $formRecord->id;
                $layoutRecord->uid = $page->layout->uid;
                $layoutRecord->save();

                $pageRecord = FormPageRecord::findOne(['uid' => $page->uid]) ?? new FormPageRecord();
                $pageRecord->formId = $formRecord->id;
                $pageRecord->uid = $page->uid;
                $pageRecord->label = $page->label;
                $pageRecord->layoutId = $layoutRecord->id;
                $pageRecord->order = $pageIndex;
                $pageRecord->metadata = json_encode([
                    'buttons' => [
                        'layout' => 'save back|submit',
                        'attributes' => [
                            'container' => [],
                            'column' => [],
                            'submit' => [],
                            'back' => [],
                            'save' => [],
                        ],
                        'submitLabel' => 'Submit',
                        'back' => true,
                        'backLabel' => 'Back',
                        'save' => false,
                        'saveLabel' => 'Save',
                    ],
                ]);

                $pageRecord->save();

                foreach ($page->layout->rows as $rowIndex => $row) {
                    $rowRecord = new FormRowRecord();
                    $rowRecord->uid = $row->uid;
                    $rowRecord->formId = $formRecord->id;
                    $rowRecord->layoutId = $layoutRecord->id;
                    $rowRecord->order = $rowIndex;
                    $rowRecord->save();

                    foreach ($row->fields as $fieldIndex => $field) {
                        $fieldRecord = new FormFieldRecord();
                        $fieldRecord->uid = $field->uid;
                        $fieldRecord->formId = $formRecord->id;
                        $fieldRecord->rowId = $rowRecord->id;
                        $fieldRecord->type = $field->type;
                        $fieldRecord->order = $fieldIndex;
                        $fieldRecord->metadata = json_encode(
                            array_merge(
                                [
                                    'label' => $field->name,
                                    'handle' => $field->handle,
                                    'required' => $field->required,
                                ],
                                $field->metadata,
                            )
                        );

                        $fieldRecord->save();
                    }
                }
            }
        }
    }

    private function importNotifications(?NotificationTemplateCollection $collection): void
    {
        $this->notificationIdMap = [];

        if (!$collection) {
            return;
        }

        foreach ($collection as $notification) {
            try {
                $record = $this->notificationsService->create($notification->name);
            } catch (NotificationException) {
                $record = $this->notificationsService->getNotificationById($notification->originalId);
                if ($record) {
                    $this->notificationIdMap[$notification->originalId] = $record->id;
                }

                continue;
            }

            $record->name = $notification->name;
            $record->handle = $notification->handle;
            $record->description = $notification->description;

            $record->fromEmail = $notification->fromEmail;
            $record->fromName = $notification->fromName;
            $record->replyToName = $notification->replyToName;
            $record->replyToEmail = $notification->replyToEmail;
            $record->cc = implode(', ', $notification->cc ?? []);
            $record->bcc = implode(', ', $notification->bcc ?? []);

            $record->subject = $notification->subject;
            $record->bodyHtml = $notification->body;
            $record->bodyText = $notification->textBody;
            $record->autoText = $notification->autoText;

            $record->includeAttachments = $notification->includeAttachments;
            $record->presetAssets = implode(', ', $notification->presetAssets ?? []);

            $this->notificationsService->save($record);
            $this->notificationIdMap[$notification->originalId] = $record->id;
        }
    }
}
