<?php

namespace Solspace\Freeform\Bundles\Backup\Import;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Managers\ContentManager;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationException;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Library\ServerSentEvents\SSE;
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
    private array $formIdMap = [];
    private SSE $sse;

    public function __construct(
        private NotificationsService $notificationsService,
        private FreeformSerializer $serializer,
    ) {}

    public function import(FreeformDataset $dataset, array $options, SSE $sse): void
    {
        $this->sse = $sse;
        $this->notificationIdMap = [];
        $this->formIdMap = [];

        $notificationTemplates = $dataset->getNotificationTemplates($options['notificationTemplates'] ?? []);
        $forms = $dataset->getForms($options['forms'] ?? []);
        $submissions = $dataset->getFormSubmissions($options['submissions'] ?? []);

        $this->sse->message(
            'total',
            $notificationTemplates->count() + $forms->count() + $submissions->count()
        );

        $this->importNotifications($notificationTemplates);
        $this->importForms($forms);
        $this->importSubmissions($submissions);
    }

    private function importForms(FormCollection $forms): void
    {
        $this->sse->message('reset', $forms->count());

        foreach ($forms as $form) {
            $this->sse->message('info', 'Importing form: '.$form->name);

            if (FormRecord::findOne(['uid' => $form->uid])) {
                $this->sse->message('progress', 1);

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
            $this->formIdMap[$form->uid] = $formRecord->id;

            $formInstance = Freeform::getInstance()->forms->getFormById($formRecord->id);

            $fieldRecords = [];

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

                        $fieldRecords[] = $fieldRecord;
                    }
                }
            }

            $manager = new ContentManager($formInstance, $fieldRecords);
            $manager->performDatabaseColumnAlterations();

            $this->sse->message('progress', 1);
        }
    }

    private function importNotifications(?NotificationTemplateCollection $collection): void
    {
        $this->notificationIdMap = [];

        if (!$collection) {
            return;
        }

        $this->sse->message('reset', $collection->count());

        foreach ($collection as $notification) {
            $this->sse->message('info', 'Importing notification: '.$notification->name);

            try {
                $record = $this->notificationsService->create($notification->name);
            } catch (NotificationException) {
                $record = $this->notificationsService->getNotificationById($notification->originalId);
                if ($record) {
                    $this->notificationIdMap[$notification->originalId] = $record->id;
                }

                $this->sse->message('progress', 1);

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

            $this->sse->message('progress', 1);
        }
    }

    private function importSubmissions(FormSubmissionCollection $collection): void
    {
        /** @var FormSubmissions $formSubmissions */
        foreach ($collection as $formSubmissions) {
            $this->sse->message('reset', $formSubmissions->submissions->count());

            $formId = $this->formIdMap[$formSubmissions->formUid];
            if (!$formId) {
                continue;
            }

            foreach ($formSubmissions->submissions as $submission) {
                $submission = new Submission();
                $submission->formId = $formId;

                $this->sse->message('progress', 1);
            }
        }
    }
}
