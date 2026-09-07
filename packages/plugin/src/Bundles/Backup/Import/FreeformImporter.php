<?php

namespace Solspace\Freeform\Bundles\Backup\Import;

use craft\helpers\FileHelper;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Backup\Collections\Templates\FileTemplateCollection;
use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Bundles\Backup\DTO\ImportStrategy;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\Templates\NotificationTemplate;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Form\Managers\ContentManager;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Rules\Types\ButtonRule;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use Solspace\Freeform\Library\Rules\Types\IntegrationRule;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;
use Solspace\Freeform\Library\Rules\Types\PageRule;
use Solspace\Freeform\Library\Rules\Types\SubmitFormRule;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Library\ServerSentEvents\SSE;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use Solspace\Freeform\Records\FavoriteFieldRecord;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use Solspace\Freeform\Records\FormGroupsEntriesRecord;
use Solspace\Freeform\Records\FormGroupsRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\FormTranslationRecord;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Records\LimitedUsersRecord;
use Solspace\Freeform\Records\Notifications\NotificationWrapperRecord;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Records\PdfTemplateRecord;
use Solspace\Freeform\Records\Rules\ButtonRuleRecord;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\IntegrationRuleRecord;
use Solspace\Freeform\Records\Rules\NotificationRuleRecord;
use Solspace\Freeform\Records\Rules\PageRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;
use Solspace\Freeform\Records\Rules\SubmitFormRuleRecord;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use Solspace\Freeform\Services\NotificationsService;

class FreeformImporter
{
    private const BATCH_SIZE = 100;

    /** @var FormRecord[] */
    private array $formsByUid = [];
    private array $notificationTransferIdMap = [];
    private array $pdfTemplateTransferIdMap = [];
    private array $wrapperTemplateTransferIdMap = [];
    private array $integrationRecords = [];
    private array $formIntegrationRecords = [];

    private FreeformDataset $dataset;
    private SSE $sse;

    public function __construct(
        private NotificationsService $notificationsService,
        private PropertyProvider $propertyProvider,
        private IntegrationsService $integrationsService,
        private FreeformSerializer $serializer,
    ) {}

    public function import(FreeformDataset $dataset, SSE $sse): void
    {
        $this->sse = $sse;
        $this->notificationTransferIdMap = [];
        $this->pdfTemplateTransferIdMap = [];
        $this->wrapperTemplateTransferIdMap = [];
        $this->dataset = $dataset;

        $this->announceTotals();

        $this->importSettings();
        $this->importFormBase();

        $this->importPdfTemplates();
        $this->importWrapperTemplates();
        $this->importNotifications();
        $this->importFormattingTemplates();
        $this->importSuccessTemplates();
        $this->importIntegrations();
        $this->importForms();
        $this->importFavorites();
        $this->importFormGroups();
        $this->importLimitedUsers();
        $this->importSubmissions();
    }

    private function announceTotals(): void
    {
        $dataset = $this->dataset;

        $templates = $dataset->getTemplates();
        $forms = $dataset->getForms();
        $submissions = $dataset->getFormSubmissions();

        $this->sse->message(
            'total',
            array_sum([
                $templates->count(),
                $forms->count(),
                $submissions->getTotals(),
            ])
        );
    }

    private function importFormBase(): void
    {
        $forms = $this->dataset->getForms();
        $isStrategySkip = ImportStrategy::TYPE_SKIP === $this->dataset->getStrategy()->forms;

        $this->sse->message('reset', $forms->count());

        foreach ($forms as $form) {
            $this->sse->message('info', 'Importing form: '.$form->name);

            $formRecord = FormRecord::findOne(['uid' => $form->uid]);
            if ($formRecord) {
                if ($isStrategySkip) {
                    $this->formsByUid[$form->uid] = $formRecord;
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

            $this->formsByUid[$form->uid] = $formRecord;
            $this->sse->message('progress', 1);
        }
    }

    private function importForms(): void
    {
        $forms = $this->dataset->getForms();
        $isStrategySkip = ImportStrategy::TYPE_SKIP === $this->dataset->getStrategy()->forms;

        $this->sse->message('reset', $forms->count());

        foreach ($forms as $form) {
            $this->sse->message('info', 'Importing form details: '.$form->name);

            $formRecord = $this->formsByUid[$form->uid] ?? null;
            if (!$formRecord) {
                $this->sse->message('err', 'Form record not found for UID: '.$form->uid);
                $this->sse->message('progress', 1);

                continue;
            }

            $formInstance = Freeform::getInstance()->forms->getFormById($formRecord->id);

            $fieldRecords = [];
            $pageRecords = [];
            $notificationRecords = [];

            $sites = \Craft::$app->getSites()->getAllSites();
            $formSites = $form->sites;
            if (!$formSites) {
                foreach ($sites as $site) {
                    $formSiteRecord = FormSiteRecord::findOne(['formId' => $formRecord->id, 'siteId' => $site->id]);
                    if (!$formSiteRecord) {
                        $formSiteRecord = new FormSiteRecord();
                    }

                    $formSiteRecord->formId = $formRecord->id;
                    $formSiteRecord->siteId = $site->id;
                    $formSiteRecord->save();
                }
            } else {
                // Convert form site IDs to new IDs
                $formSiteIds = $form->settings->getGeneral()->sites;
                $updatedSiteIds = array_map(
                    static function (int $oldSiteId) use ($formSites) {
                        $oldSite = $formSites->get($oldSiteId);
                        if (!$oldSite) {
                            return null;
                        }

                        $newSite = \Craft::$app->getSites()->getSiteByHandle($oldSite->handle);

                        return (string) $newSite?->id;
                    },
                    $formSiteIds
                );

                $form->settings->getGeneral()->sites = array_filter($updatedSiteIds);
                $formRecord->metadata = $this->serializer->serialize($form->settings, 'json');
                $formRecord->save();

                foreach ($formSites as $formSite) {
                    $site = \Craft::$app->sites->getSiteByHandle($formSite->handle);
                    if (!$site) {
                        continue;
                    }

                    $formSiteRecord = FormSiteRecord::findOne(['formId' => $formRecord->id, 'siteId' => $site->id]);
                    if (!$formSiteRecord) {
                        $formSiteRecord = new FormSiteRecord();
                        $formSiteRecord->formId = $formRecord->id;
                        $formSiteRecord->siteId = $site->id;
                        $formSiteRecord->save();
                    }
                }
            }

            foreach ($form->translations as $translation) {
                $site = \Craft::$app->sites->getSiteByHandle($translation->site);
                if (!$site) {
                    continue;
                }

                $translationRecord = FormTranslationRecord::findOne(['uid' => $translation->uid]);
                if (!$translationRecord) {
                    $translationRecord = new FormTranslationRecord();
                    $translationRecord->uid = $translation->uid;
                }

                $translationRecord->formId = $formRecord->id;
                $translationRecord->siteId = $site->id;
                $translationRecord->translations = json_encode($translation->metadata);
                $translationRecord->save();
            }

            // ===========================
            // Form Notification Templates
            // ===========================
            $existingTemplates = $this->notificationsService->getQuery()
                ->where(['formId' => $formRecord->id])
                ->indexBy('uid')
                ->all()
            ;

            foreach ($form->notificationTemplates as $template) {
                $record = $existingTemplates[$template->uid] ?? null;
                if ($record) {
                    if ($isStrategySkip) {
                        $this->notificationTransferIdMap[$template->id] = $record->id;

                        continue;
                    }
                } else {
                    $record = new NotificationTemplateRecord();
                }

                $record->formId = $formRecord->id;

                $record = $this->notificationTemplateToRecord($template, $record);
                $record->save();

                $this->notificationTransferIdMap[$template->id] = $record->id;
            }

            // ===========================
            // Form Notifications
            // ===========================
            foreach ($form->notifications as $notification) {
                $notificationRecord = FormNotificationRecord::findOne(['uid' => $notification->uid]);
                if (!$notificationRecord) {
                    $notificationRecord = new FormNotificationRecord();
                    $notificationRecord->uid = $notification->uid;
                }

                $notificationRecord->formId = $formRecord->id;
                $notificationRecord->class = $notification->type;
                $notificationRecord->enabled = $notification->enabled;

                $metadata = $notification->metadata;
                $metadata['name'] = $notification->name;
                $metadata['enabled'] = $notification->enabled;

                $oldTemplateId = $metadata[$notification->idAttribute];
                $metadata[$notification->idAttribute] = $this->notificationTransferIdMap[$oldTemplateId] ?? null;

                if (Dynamic::class === $notification->type) {
                    $recipientMapping = [];

                    foreach ($metadata['recipientMapping'] as $recipient) {
                        $recipient['template'] = $this->notificationTransferIdMap[$recipient['template']] ?? null;
                        $recipientMapping[] = $recipient;
                    }

                    $metadata['recipientMapping'] = $recipientMapping;
                }

                $notificationRecord->metadata = json_encode($metadata);
                $notificationRecord->save();

                $notificationRecords[$notificationRecord->uid] = $notificationRecord;
            }

            foreach ($form->integrations as $integration) {
                $integrationRecord = $this->integrationRecords[$integration->integrationUid] ?? null;
                if (!$integrationRecord) {
                    continue;
                }

                $formIntegration = FormIntegrationRecord::findOne(['uid' => $integration->uid]);
                if (!$formIntegration) {
                    $formIntegration = new FormIntegrationRecord();
                    $formIntegration->uid = $integration->uid;
                }

                $formIntegration->formId = $formRecord->id;
                $formIntegration->integrationId = $integrationRecord->id;
                $formIntegration->enabled = $integration->enabled;
                $formIntegration->metadata = json_encode($integration->metadata);
                $formIntegration->save();

                $this->formIntegrationRecords[$formIntegration->uid] = $formIntegration;
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

                $pageMetadata = $page->metadata;
                $pageMetadata['buttons'] ??= [
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
                ];

                $notificationTemplateId = $pageMetadata['buttons']['notificationTemplate'] ?? null;
                if (null !== $notificationTemplateId) {
                    $mappedNotificationTemplateId = $this->notificationTransferIdMap[$notificationTemplateId] ?? null;
                    $pageMetadata['buttons']['notificationTemplate'] = $mappedNotificationTemplateId;
                }

                $pageRecord->metadata = json_encode($pageMetadata);

                $pageRecord->save();

                $pageRecords[$pageRecord->uid] = $pageRecord;
            }

            $manager = new ContentManager($formInstance, $fieldRecords);
            $manager->performDatabaseColumnAlterations();

            foreach ($form->rules as $rule) {
                $ruleRecord = RuleRecord::findOne(['uid' => $rule->uid]);
                if ($ruleRecord) {
                    if ($isStrategySkip && $this->hasTypedRuleRecord($rule->type, $ruleRecord->id)) {
                        continue;
                    }
                    $ruleRecord->delete();
                }

                $ruleRecord = new RuleRecord();
                $ruleRecord->uid = $rule->uid;
                $ruleRecord->combinator = $rule->combinator;
                $ruleRecord->save();

                if (FieldRule::class === $rule->type) {
                    $fieldRecord = $fieldRecords[$rule->metadata['fieldUid']] ?? null;
                    if (!$fieldRecord) {
                        continue;
                    }

                    $fieldRuleRecord = new FieldRuleRecord();
                    $fieldRuleRecord->id = $ruleRecord->id;
                    $fieldRuleRecord->fieldId = $fieldRecord->id;
                    $fieldRuleRecord->display = $rule->metadata['display'];
                    $fieldRuleRecord->save();
                }

                if (PageRule::class === $rule->type) {
                    $pageRecord = $pageRecords[$rule->metadata['pageUid']] ?? null;
                    if (!$pageRecord) {
                        continue;
                    }

                    $pageRuleRecord = new PageRuleRecord();
                    $pageRuleRecord->id = $ruleRecord->id;
                    $pageRuleRecord->pageId = $pageRecord->id;
                    $pageRuleRecord->save();
                }

                if (ButtonRule::class === $rule->type) {
                    $pageRecord = $pageRecords[$rule->metadata['pageUid']] ?? null;
                    if (!$pageRecord) {
                        continue;
                    }

                    $buttonRuleRecord = new ButtonRuleRecord();
                    $buttonRuleRecord->id = $ruleRecord->id;
                    $buttonRuleRecord->pageId = $pageRecord->id;
                    $buttonRuleRecord->button = $rule->metadata['button'];
                    $buttonRuleRecord->display = $rule->metadata['display'];
                    $buttonRuleRecord->save();
                }

                if (SubmitFormRule::class === $rule->type) {
                    $submitFormRuleRecord = new SubmitFormRuleRecord();
                    $submitFormRuleRecord->id = $ruleRecord->id;
                    $submitFormRuleRecord->formId = $formRecord->id;
                    $submitFormRuleRecord->save();
                }

                if (NotificationRule::class === $rule->type) {
                    $notificationRecord = $notificationRecords[$rule->metadata['notificationUid']] ?? null;
                    if (!$notificationRecord) {
                        continue;
                    }

                    $notificationRuleRecord = new NotificationRuleRecord();
                    $notificationRuleRecord->id = $ruleRecord->id;
                    $notificationRuleRecord->notificationId = $notificationRecord->id;
                    $notificationRuleRecord->send = $rule->metadata['send'] ?? true;
                    $notificationRuleRecord->save();
                }

                if (IntegrationRule::class === $rule->type) {
                    $integrationRecord = $this->formIntegrationRecords[$rule->metadata['integrationUid']] ?? null;
                    if (!$integrationRecord) {
                        continue;
                    }

                    $integrationRuleRecord = new IntegrationRuleRecord();
                    $integrationRuleRecord->id = $ruleRecord->id;
                    $integrationRuleRecord->integrationId = $integrationRecord->id;
                    $integrationRuleRecord->push = $rule->metadata['push'] ?? true;
                    $integrationRuleRecord->save();
                }

                foreach ($rule->conditions as $condition) {
                    $conditionRecord = new RuleConditionRecord();
                    $conditionRecord->uid = $condition->uid;
                    $conditionRecord->ruleId = $ruleRecord->id;
                    $conditionRecord->fieldId = FormFieldRecord::findOne(['uid' => $condition->fieldUid])->id;
                    $conditionRecord->operator = $condition->operator;
                    $conditionRecord->value = $condition->value;
                    $conditionRecord->save();
                }
            }

            $this->sse->message('progress', 1);
        }
    }

    private function hasTypedRuleRecord(string $ruleType, int $ruleId): bool
    {
        $recordClass = match ($ruleType) {
            FieldRule::class => FieldRuleRecord::class,
            PageRule::class => PageRuleRecord::class,
            ButtonRule::class => ButtonRuleRecord::class,
            SubmitFormRule::class => SubmitFormRuleRecord::class,
            NotificationRule::class => NotificationRuleRecord::class,
            IntegrationRule::class => IntegrationRuleRecord::class,
            default => null,
        };

        if (!$recordClass) {
            return false;
        }

        return $recordClass::find()->where(['id' => $ruleId])->exists();
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

                $fieldRecords[$fieldRecord->uid] = $fieldRecord;
            }
        }

        return [$layoutRecord, $fieldRecords];
    }

    private function importNotifications(): void
    {
        $this->notificationTransferIdMap = [];

        $collection = $this->dataset->getTemplates()?->getNotification();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->templates;

        $this->sse->message('reset', $collection->count());

        $existingNotifications = $this->notificationsService->getAllNotifications(skipStorageCheck: true);
        $notificationsByIdentificator = [];
        foreach ($existingNotifications as $notification) {
            $notificationsByIdentificator[$notification->uid ?? $notification->filepath] = $notification;
        }

        $existingFormNotifications = $this->notificationsService->getAllFormNotifications();
        foreach ($existingFormNotifications as $notification) {
            $notificationsByIdentificator[$notification->uid] = $notification;
        }

        foreach ($collection as $notification) {
            $this->sse->message('info', 'Importing notification: '.$notification->name);

            $record = $notificationsByIdentificator[$notification->uid] ?? null;
            if ($record) {
                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->notificationTransferIdMap[$notification->id ?? $notification->uid] = $record->id ?? $record->filepath;
                    $this->sse->message('progress', 1);

                    continue;
                }
            } else {
                $record = $this->notificationsService->createOfType(
                    $notification->name,
                    $notification->isFile
                        ? Settings::EMAIL_TEMPLATE_STORAGE_TYPE_FILES
                        : Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE,
                );
            }

            $record = $this->notificationTemplateToRecord($notification, $record);

            $this->notificationsService->save($record);
            $this->notificationTransferIdMap[$notification->id ?? $notification->uid] = $record->id ?? $record->filepath;

            $this->sse->message('progress', 1);
        }
    }

    private function importPdfTemplates(): void
    {
        $this->pdfTemplateTransferIdMap = [];

        $collection = $this->dataset->getTemplates()?->getPdf();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->templates;

        $this->sse->message('reset', $collection->count());

        /** @var PdfTemplateRecord[] $existingTemplates */
        $existingTemplates = PdfTemplateRecord::find()->indexBy('uid')->all();

        foreach ($collection as $template) {
            $this->sse->message('info', 'Importing pdf template: '.$template->name);

            $record = $existingTemplates[$template->uid] ?? null;
            if ($record) {
                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->pdfTemplateTransferIdMap[$template->id] = $record->id;
                    $this->sse->message('progress', 1);

                    continue;
                }
            } else {
                $record = new PdfTemplateRecord(['uid' => $template->uid]);
            }

            $record->name = $template->name;
            $record->fileName = $template->fileName;
            $record->description = $template->description;
            $record->body = $template->body;

            $record->save();

            $this->pdfTemplateTransferIdMap[$template->uid] = $record->id;

            $this->sse->message('progress', 1);
        }
    }

    private function importWrapperTemplates(): void
    {
        $this->wrapperTemplateTransferIdMap = [];

        $collection = $this->dataset->getTemplates()?->getWrapper();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->templates;

        $this->sse->message('reset', $collection->count());

        /** @var NotificationWrapperRecord[] $existingTemplates */
        $existingTemplates = NotificationWrapperRecord::find()->indexBy('uid')->all();

        foreach ($collection as $template) {
            $this->sse->message('info', 'Importing wrapper template: '.$template->name);

            $record = $existingTemplates[$template->uid] ?? null;
            if ($record) {
                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->wrapperTemplateTransferIdMap[$template->uid] = $record->id;
                    $this->sse->message('progress', 1);

                    continue;
                }
            } else {
                $record = new NotificationWrapperRecord(['uid' => $template->uid]);
            }

            $record->name = $template->name;
            $record->handle = $template->handle;
            $record->content = $template->content;
            $record->description = $template->description;

            $record->save();

            $this->wrapperTemplateTransferIdMap[$template->uid] = $record->id;

            $this->sse->message('progress', 1);
        }
    }

    private function importFormattingTemplates(): void
    {
        $this->importFileTemplates(
            'Formatting',
            $this->dataset->getTemplates()?->getFormatting(),
            Freeform::getInstance()->settings->getFormTemplateDirectory(),
        );
    }

    private function importSuccessTemplates(): void
    {
        $this->importFileTemplates(
            'Success',
            $this->dataset->getTemplates()?->getSuccess(),
            Freeform::getInstance()->settings->getSuccessTemplateDirectory(),
        );
    }

    private function importIntegrations(): void
    {
        $collection = $this->dataset->getIntegrations();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->integrations;

        $this->sse->message('reset', $collection->count());

        $this->integrationRecords = IntegrationRecord::find()->indexBy('uid')->all();
        foreach ($collection as $integration) {
            $this->sse->message('info', 'Importing Integration: '.$integration->name);

            $record = $this->integrationRecords[$integration->uid] ?? null;
            if ($record) {
                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->sse->message('progress', 1);

                    continue;
                }
            } else {
                $record = new IntegrationRecord();
            }

            $metadata = $integration->metadata;
            $properties = $this->propertyProvider->getEditableProperties($integration->class);
            foreach ($properties as $property) {
                if (!\array_key_exists($property->handle, $metadata)) {
                    continue;
                }

                $value = $metadata[$property->handle];
                $value = $this->integrationsService->processValueForSaving($property, $value);

                $metadata[$property->handle] = $value;
            }

            $record->uid = $integration->uid;
            $record->name = $integration->name;
            $record->handle = $integration->handle;
            $record->class = $integration->class;
            $record->metadata = $metadata;
            $record->type = $integration->type;
            $record->enabled = $integration->enabled;

            $record->save();

            $this->integrationRecords[$integration->uid] = $record;

            $this->sse->message('progress', 1);
        }
    }

    private function importFormGroups(): void
    {
        $collection = $this->dataset->getFormGroups();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->forms;

        $this->sse->message('reset', $collection->count());

        $groupRecords = FormGroupsRecord::find()->indexBy('uid')->all();
        foreach ($collection as $group) {
            $this->sse->message('info', 'Importing Form Group: '.$group->label);

            /** @var FormGroupsRecord $record */
            $record = $groupRecords[$group->uid] ?? null;
            if ($record) {
                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->sse->message('progress', 1);

                    continue;
                }
                FormGroupsEntriesRecord::deleteAll(['groupId' => $record->id]);
            } else {
                $record = new FormGroupsRecord();
            }

            $site = \Craft::$app->getSites()->getSiteByHandle($group->site);
            if (!$site) {
                $this->sse->message('err', 'Form Group "'.$group->label.'": site "'.$group->site.'" not found');
                $this->sse->message('progress', 1);

                continue;
            }

            $record->uid = $group->uid;
            $record->label = $group->label;
            $record->siteId = $site->id;
            $record->order = $group->order;
            $record->save();

            foreach ($group->entries as $entry) {
                $form = $this->formsByUid[$entry->formUid] ?? null;
                if (!$form) {
                    continue;
                }

                $entryRecord = new FormGroupsEntriesRecord();
                $entryRecord->formId = $form->id;
                $entryRecord->groupId = $record->id;
                $entryRecord->order = $entry->order;
                $entryRecord->save();
            }

            $this->sse->message('progress', 1);
        }
    }

    private function importFavorites(): void
    {
        $collection = $this->dataset->getFavorites();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->forms;

        $this->sse->message('reset', $collection->count());

        $records = FavoriteFieldRecord::find()->indexBy('uid')->all();
        foreach ($collection as $favorite) {
            $this->sse->message('info', 'Importing Favorite Field: '.strip_tags($favorite->label));

            $record = $records[$favorite->uid] ?? null;
            if ($record) {
                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->sse->message('progress', 1);

                    continue;
                }
            } else {
                $record = new FavoriteFieldRecord();
            }

            $record->uid = $favorite->uid;
            $record->label = $favorite->label;
            $record->type = $favorite->type;
            $record->metadata = $favorite->metadata;
            $record->save();

            $this->sse->message('progress', 1);
        }
    }

    private function importLimitedUsers(): void
    {
        $collection = $this->dataset->getLimitedUsers();
        if (!$collection) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->forms;

        $this->sse->message('reset', $collection->count());

        $records = LimitedUsersRecord::find()->indexBy('uid')->all();
        foreach ($collection as $limitedUser) {
            $this->sse->message('info', 'Importing Limited Users: '.strip_tags($limitedUser->name));

            $record = $records[$limitedUser->uid] ?? null;
            if ($record) {
                if (ImportStrategy::TYPE_SKIP === $strategy) {
                    $this->sse->message('progress', 1);

                    continue;
                }
            } else {
                $record = new LimitedUsersRecord();
            }

            $record->uid = $limitedUser->uid;
            $record->name = $limitedUser->name;
            $record->description = $limitedUser->description;
            $record->settings = $limitedUser->settings;
            $record->save();

            $this->sse->message('progress', 1);
        }
    }

    private function importSubmissions(): void
    {
        $collection = $this->dataset->getFormSubmissions();
        $defaultStatus = Freeform::getInstance()->statuses->getDefaultStatusId();

        /** @var FormSubmissions $formSubmissions */
        foreach ($collection as $formSubmissions) {
            $batchProcessor = $formSubmissions->submissionBatchProcessor;

            $form = $this->formsByUid[$formSubmissions->formUid] ?? null;
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

    private function importSettings(): void
    {
        $settings = $this->dataset->getSettings();
        if (!$settings) {
            return;
        }

        $data = $settings->toArray();

        $freeform = Freeform::getInstance();
        $freeform->setSettings($data);
        $freeform->getSettings()->prepareFolderStructure();

        \Craft::$app->plugins->savePluginSettings($freeform, $data);

        $projectConfig = \Craft::$app->projectConfig;
        $projectConfig->processConfigChanges('plugins.'.$freeform->id);
        $projectConfig->writeYamlFiles();

        $errors = $freeform->getSettings()->getErrorSummary(true);
        if ($errors) {
            $this->sse->message('err', implode('; ', $errors));
        }
    }

    private function importFileTemplates(
        string $type,
        ?FileTemplateCollection $collection,
        ?string $templateDirectory,
    ): void {
        if (!$collection || !$collection->count()) {
            return;
        }

        $strategy = $this->dataset->getStrategy()->templates;

        $this->sse->message('reset', $collection->count());
        $this->sse->message('info', "Importing templates: {$type}");

        if (!$templateDirectory) {
            $this->sse->message('err', "{$type} Template directory not found");
            $this->sse->message('progress', $collection->count());

            return;
        }

        foreach ($collection as $template) {
            $path = $template->path;
            $fileName = $template->fileName;

            if (ImportStrategy::TYPE_SKIP === $strategy) {
                if (file_exists($templateDirectory.'/'.$fileName)) {
                    $this->sse->message('progress', 1);

                    continue;
                }
            }

            if (preg_match('/\/index\.(twig|html)$/i', $fileName)) {
                $dir = \dirname($path);
                $dirName = basename($dir);
                FileHelper::copyDirectory($dir, $templateDirectory.'/'.$dirName);
            } else {
                $newPath = $templateDirectory.'/'.$fileName;

                copy($path, $newPath);
            }

            $this->sse->message('progress', 1);
        }
    }

    private function notificationTemplateToRecord(NotificationTemplate $template, ?NotificationTemplateRecord $reference = null): NotificationTemplateRecord
    {
        $record = $reference ?? new NotificationTemplateRecord();

        if (!$template->isFile) {
            $record->uid = $template->uid;
        }

        $record->name = $template->name;
        $record->handle = $template->handle;
        $record->description = $template->description;

        $record->fromEmail = $template->fromEmail;
        $record->fromName = $template->fromName;
        $record->replyToName = $template->replyToName;
        $record->replyToEmail = $template->replyToEmail;
        $record->cc = implode(', ', $template->cc ?? []);
        $record->bcc = implode(', ', $template->bcc ?? []);

        $record->subject = $template->subject;
        $record->bodyHtml = $template->body;
        $record->bodyText = $template->textBody;
        $record->autoText = $template->autoText;

        $record->includeAttachments = $template->includeAttachments;
        $record->presetAssets = implode(', ', $template->presetAssets ?? []);

        $record->wrapperId = $this->wrapperTemplateTransferIdMap[$template->wrapperId] ?? null;

        if ($template->pdfTemplateIds) {
            $record->pdfTemplateIds = json_encode(
                array_filter(
                    array_map(
                        fn (string $uid) => isset($this->pdfTemplateTransferIdMap[$uid]) ? (int) $this->pdfTemplateTransferIdMap[$uid] : null,
                        $template->pdfTemplateIds
                    )
                )
            );
        }

        return $record;
    }
}
