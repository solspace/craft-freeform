<?php

namespace Solspace\Freeform\Bundles\Backup\Import;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Backup\DTO\Form as FormDTO;
use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Bundles\Backup\DTO\ImportStrategy;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
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
    private const BATCH_SIZE = 100;

    private array $formsByUid = [];
    private array $notificationIdMap = [];
    private FreeformDataset $dataset;
    private SSE $sse;

    public function __construct(
        private NotificationsService $notificationsService,
        private FreeformSerializer $serializer,
    ) {}

    public function import(FreeformDataset $dataset, SSE $sse): void
    {
        $this->sse = $sse;
        $this->notificationIdMap = [];
        $this->dataset = $dataset;

        $this->announceTotals();

        $this->importNotifications();
        $this->importForms();
        $this->importSubmissions();
    }

    private function announceTotals(): void
    {
        $dataset = $this->dataset;

        $notificationTemplates = $dataset->getNotificationTemplates();
        $forms = $dataset->getForms();
        $submissions = $dataset->getFormSubmissions();

        $this->sse->message(
            'total',
            array_sum([
                $notificationTemplates->count(),
                $forms->count(),
                $submissions->getTotals(),
            ])
        );
    }

    private function importForms(): void
    {
        $forms = $this->dataset->getForms();
        $isStrategySkip = ImportStrategy::TYPE_SKIP === $this->dataset->getStrategy()->forms;

        $this->sse->message('reset', $forms->count());

        foreach ($forms as $form) {
            $this->sse->message('info', 'Importing form: '.$form->name);

            $formRecord = FormRecord::findOne(['uid' => $form->uid]);
            if ($formRecord) {
                if ($isStrategySkip) {
                    $this->sse->message('progress', 1);

                    continue;
                }
            } else {
                $formRecord = FormRecord::create();
                $formRecord->uid = $form->uid;
            }

            $formRecord->name = $form->name;
            $formRecord->handle = $form->handle;
            $formRecord->type = Regular::class;

            $formRecord->createdByUserId = \Craft::$app->getUser()->getIdentity()->id;
            $formRecord->updatedByUserId = $formRecord->createdByUserId;

            $serialized = $this->serializer->serialize($form->settings, 'json');
            $formRecord->metadata = $serialized;

            $formRecord->save();

            if ($formRecord->hasErrors()) {
                $errors = $formRecord->getErrorSummary(false);
                $this->sse->message('err', json_encode($errors));
                $this->sse->message('progress', 1);

                continue;
            }

            $this->formsByUid[$form->uid] = $form;

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
                [$layoutRecord, $fieldRecordList] = $this->importLayout($page->layout, $formRecord);
                $fieldRecords = array_merge($fieldRecords, $fieldRecordList);

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
            }

            $manager = new ContentManager($formInstance, $fieldRecords);
            $manager->performDatabaseColumnAlterations();

            $this->sse->message('progress', 1);
        }
    }

    private function importLayout(Layout $layout, FormRecord $formRecord): array
    {
        $fieldRecords = [];

        $layoutRecord = FormLayoutRecord::findOne(['uid' => $layout->uid]) ?? new FormLayoutRecord();
        $layoutRecord->formId = $formRecord->id;
        $layoutRecord->uid = $layout->uid;
        $layoutRecord->save();

        foreach ($layout->rows as $rowIndex => $row) {
            $rowRecord = FormRowRecord::findOne(['uid' => $row->uid]) ?? new FormRowRecord();
            $rowRecord->uid = $row->uid;
            $rowRecord->formId = $formRecord->id;
            $rowRecord->layoutId = $layoutRecord->id;
            $rowRecord->order = $rowIndex;
            $rowRecord->save();

            foreach ($row->fields as $fieldIndex => $field) {
                $fieldRecord = FormFieldRecord::findOne(['uid' => $field->uid]) ?? new FormFieldRecord();
                $fieldRecord->uid = $field->uid;
                $fieldRecord->formId = $formRecord->id;
                $fieldRecord->rowId = $rowRecord->id;
                $fieldRecord->type = $field->type;
                $fieldRecord->order = $fieldIndex;
                $metadata = array_merge(
                    [
                        'label' => $field->name,
                        'handle' => $field->handle,
                        'required' => $field->required,
                    ],
                    $field->metadata,
                );

                if (GroupField::class === $field->type) {
                    [$subLayout, $fieldRecordList] = $this->importLayout($field->layout, $formRecord);
                    $metadata['layout'] = $subLayout->uid;
                    $fieldRecords = array_merge($fieldRecords, $fieldRecordList);
                }

                $fieldRecord->metadata = json_encode($metadata);

                $fieldRecord->save();

                $fieldRecords[] = $fieldRecord;
            }
        }

        return [$layoutRecord, $fieldRecords];
    }

    private function importNotifications(): void
    {
        $this->notificationIdMap = [];

        $collection = $this->dataset->getNotificationTemplates();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->notifications;

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

                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->sse->message('progress', 1);

                    continue;
                }
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

    private function getFormByUid(string $uid): null|FormDTO|FormRecord
    {
        static $formsByUid;

        if (null === $formsByUid) {
            $formsByUid = true;
            foreach (FormRecord::find()->all() as $form) {
                if (isset($this->formsByUid[$form->uid])) {
                    continue;
                }

                $this->formsByUid[$form->uid] = $form;
            }
        }

        return $this->formsByUid[$uid] ?? null;
    }

    private function importSubmissions(): void
    {
        $collection = $this->dataset->getFormSubmissions();
        $defaultStatus = Freeform::getInstance()->statuses->getDefaultStatusId();

        /** @var FormSubmissions $formSubmissions */
        foreach ($collection as $formSubmissions) {
            $batchProcessor = $formSubmissions->submissionBatchProcessor;

            $form = $this->getFormByUid($formSubmissions->formUid);
            if (!$form) {
                continue;
            }

            $name = $form->name;
            $total = $batchProcessor->total();

            $this->sse->message('reset', $total);
            $this->sse->message(
                'info',
                "Importing submissions for '{$name}' (0/{$total})"
            );

            $current = 0;
            foreach ($batchProcessor->batch(self::BATCH_SIZE) as $rows) {
                $current += \count($rows);
                $this->sse->message(
                    'info',
                    "Importing submissions for '{$name}' ({$current}/{$total})"
                );

                foreach ($rows as $row) {
                    $submissionDTO = $formSubmissions->getProcessor()($row);

                    $imported = Submission::create($form->id);
                    $imported->title = $submissionDTO->title;
                    $imported->statusId = $defaultStatus;
                    $imported->setFormFieldValues($submissionDTO->getValues());

                    \Craft::$app->getElements()->saveElement($imported, false);

                    $this->sse->message('progress', 1);
                }
            }
        }
    }
}
