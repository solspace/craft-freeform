<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Backup\BatchProcessing\ElementQueryProcessor;
use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\Collections\PageCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\DTO\Form;
use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Bundles\Backup\DTO\ImportPreview;
use Solspace\Freeform\Bundles\Backup\DTO\ImportStrategy;
use Solspace\Freeform\Bundles\Backup\DTO\Integration;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\Notification;
use Solspace\Freeform\Bundles\Backup\DTO\NotificationTemplate;
use Solspace\Freeform\Bundles\Backup\DTO\Page;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Bundles\Backup\DTO\Submission;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Elements\Submission as FFSubmission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Helpers\StringHelper as FreeformStringHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;

class FreeformFormsExporter implements ExporterInterface
{
    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private PropertyProvider $propertyProvider,
        private FormsService $forms,
        private IntegrationsService $integrations,
    ) {}

    public function collectDataPreview(): ImportPreview
    {
        $preview = new ImportPreview();

        $preview->forms = $this->collectForms();
        $preview->notificationTemplates = $this->collectNotifications();

        $integrations = $this->integrations->getAllIntegrations();
        $preview->integrations = new IntegrationCollection();
        foreach ($integrations as $integration) {
            $dto = new Integration();
            $dto->name = $integration->name;
            $dto->uid = $integration->uid;
            $dto->icon = $integration->getIntegrationObject()->getTypeDefinition()->getIconUrl();

            $preview->integrations->add($dto);
        }

        $table = FFSubmission::TABLE;

        $submissions = FFSubmission::find()
            ->select("COUNT({$table}.[[id]]) as count")
            ->innerJoin(FormRecord::TABLE.' f', "[[f]].[[id]] = {$table}.[[formId]]")
            ->groupBy("{$table}.[[formId]]")
            ->indexBy('[[f]].uid')
            ->column()
        ;

        $submissions = array_map(
            fn (int $count, string $formUid) => ['formUid' => $formUid, 'count' => (int) $count],
            $submissions,
            array_keys($submissions),
        );

        $preview->formSubmissions = $submissions;

        return $preview;
    }

    public function collect(
        array $formIds,
        array $notificationIds,
        array $integrationIds,
        array $formSubmissions,
        array $strategy,
        bool $settings,
    ): FreeformDataset {
        $dataset = new FreeformDataset();

        $dataset->setNotificationTemplates($this->collectNotifications($notificationIds));
        $dataset->setForms($this->collectForms($formIds));
        $dataset->setFormSubmissions($this->collectSubmissions($formSubmissions));
        $dataset->setIntegrations($this->collectIntegrations($integrationIds));
        $dataset->setSettings($this->collectSettings($settings));
        $dataset->setStrategy(new ImportStrategy($strategy));

        return $dataset;
    }

    private function collectForms(?array $ids = null): FormCollection
    {
        $collection = new FormCollection();

        $query = $this->forms->getFormQuery();
        if (null !== $ids) {
            $query->where(['uid' => $ids]);
        }

        $forms = $this->forms->getFormsFromQuery($query);

        foreach ($forms as $index => $form) {
            /** @var FormFieldRecord[] $formFieldRecords */
            $formFieldRecords = FormFieldRecord::find()
                ->where(['formId' => $form->getId()])
                ->indexBy('uid')
                ->all()
            ;

            $exported = new Form();
            $exported->uid = $form->getUid();
            $exported->name = $form->getName();
            $exported->handle = $form->getHandle();
            $exported->order = $index;
            $exported->settings = $form->getSettings();

            $exported->notifications = new NotificationCollection();

            $notifications = $this->notificationsProvider->getRecordsByForm($form);
            foreach ($notifications as $notification) {
                $metadata = json_decode($notification->metadata, true);

                $exportNotification = new Notification();
                $exportNotification->id = $notification->id;
                $exportNotification->idAttribute = 'template';
                $exportNotification->name = $metadata['name'] ?? 'Admin Notification';
                $exportNotification->type = $notification->class;
                $exportNotification->metadata = $metadata;

                $exported->notifications->add($exportNotification);
            }

            $exported->pages = new PageCollection();

            foreach ($form->getLayout()->getPages() as $page) {
                $exportedLayout = new Layout();
                $exportedLayout->uid = $page->getLayout()->getUid();
                $exportedLayout->rows = new RowCollection();

                $exportedPage = new Page();
                $exportedPage->uid = $page->getUid();
                $exportedPage->layout = $exportedLayout;
                $exportedPage->label = $page->getLabel();

                $exported->pages->add($exportedPage);

                foreach ($page->getRows() as $row) {
                    $exportedRow = new Row();
                    $exportedRow->uid = $row->getUid();
                    $exportedRow->fields = new FieldCollection();

                    foreach ($row->getFields() as $field) {
                        $fieldRecord = $formFieldRecords[$field->getUid()] ?? null;
                        if (null === $fieldRecord) {
                            continue;
                        }

                        $exportedField = new Field();
                        $exportedField->uid = $field->getUid();
                        $exportedField->name = $field->getLabel();
                        $exportedField->handle = $field->getHandle();
                        $exportedField->type = $field::class;
                        $exportedField->required = $field->isRequired();
                        $exportedField->metadata = json_decode($fieldRecord->metadata, true);

                        $exportedRow->fields->add($exportedField);
                    }

                    $exportedLayout->rows->add($exportedRow);
                }
            }

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectIntegrations(?array $ids = null): IntegrationCollection
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;
        $collection = new IntegrationCollection();

        $integrations = Freeform::getInstance()->integrations->getAllIntegrations();
        foreach ($integrations as $integration) {
            if (null !== $ids && !\in_array($integration->uid, $ids, true)) {
                continue;
            }

            $exported = new Integration();
            $exported->name = $integration->name;
            $exported->handle = $integration->handle;
            $exported->uid = $integration->uid;
            $exported->type = $integration->type;

            $metadata = $integration->metadata;

            $properties = $this->propertyProvider->getEditableProperties($integration->class);
            foreach ($properties as $property) {
                if (!$property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
                    continue;
                }

                $value = $metadata[$property->handle] ?? null;
                $isEnvVariable = StringHelper::isEnvVariable($value);
                if (!$isEnvVariable && $value) {
                    $value = \Craft::$app->security->decryptByKey(base64_decode($value), $securityKey);
                }

                $metadata[$property->handle] = $value;
            }

            $exported->metadata = $metadata;

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectNotifications(?array $ids = null): NotificationTemplateCollection
    {
        $collection = new NotificationTemplateCollection();
        $notifications = Freeform::getInstance()->notifications->getAllNotifications();

        foreach ($notifications as $notification) {
            if (null !== $ids && !\in_array($notification->id, $ids, true)) {
                continue;
            }

            $exported = new NotificationTemplate();
            $exported->originalId = $notification->id;
            $exported->name = $notification->name;
            $exported->handle = $notification->handle;
            $exported->description = $notification->description;

            $exported->fromName = $notification->fromName ?? '{{ craft.app.projectConfig.get("email.fromName") }}';
            $exported->fromEmail = $notification->fromEmail ?? '{{ craft.app.projectConfig.get("email.fromEmail") }}';
            $exported->replyToName = $notification->replyToName ?? null;
            $exported->replyToEmail = $notification->replyToEmail ?? null;
            $exported->cc = FreeformStringHelper::extractSeparatedValues($notification->cc ?? '');
            $exported->bcc = FreeformStringHelper::extractSeparatedValues($notification->bcc ?? '');

            $exported->includeAttachments = $notification->isIncludeAttachmentsEnabled();

            $exported->subject = $notification->subject ?? '';
            $exported->body = $notification->bodyHtml ?? '';
            $exported->textBody = $notification->bodyText ?? '';
            $exported->autoText = $notification->isAutoText();

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectSubmissions(?array $ids = null): FormSubmissionCollection
    {
        $collection = new FormSubmissionCollection();

        $forms = Freeform::getInstance()->forms->getAllForms();

        foreach ($forms as $form) {
            if (null !== $ids && !\in_array($form->getUid(), $ids, true)) {
                continue;
            }

            $submissions = FFSubmission::find()->formId($form->getId());

            $formSubmissions = new FormSubmissions();
            $formSubmissions->formUid = $form->getUid();
            $formSubmissions->submissionBatchProcessor = new ElementQueryProcessor($submissions);
            $formSubmissions->setProcessor(
                function (FFSubmission $row) use ($form) {
                    $exported = new Submission();
                    $exported->title = $row->title;
                    $exported->status = $row->status;

                    foreach ($form->getLayout()->getFields() as $field) {
                        $exported->{$field->getHandle()} = $row->{$field->getHandle()}->getValue();
                    }

                    return $exported;
                }
            );

            $collection->add($formSubmissions, $form->getUid());
        }

        return $collection;
    }

    private function collectSettings(bool $collect): ?Settings
    {
        if (!$collect) {
            return null;
        }

        return Freeform::getInstance()->settings->getSettingsModel();
    }
}
