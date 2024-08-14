<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use craft\db\Query;
use craft\helpers\StringHelper as CraftStringHelper;
use Solspace\ExpressForms\elements\Submission as XFSubmission;
use Solspace\ExpressForms\ExpressForms;
use Solspace\ExpressForms\records\FormRecord;
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
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\RandomColorGenerator;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\StringHelper as FreeformStringHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField as EmailFieldNotification;

class ExpressFormsExporter implements ExporterInterface
{
    private array $notificationReference = [];

    public function __construct(private PropertyProvider $propertyProvider) {}

    public function collectDataPreview(): ImportPreview
    {
        $preview = new ImportPreview();

        $preview->forms = $this->collectForms();
        $preview->notificationTemplates = $this->collectNotifications();

        $submissions = (new Query())
            ->select(['COUNT(s.id)'])
            ->from(XFSubmission::TABLE.' s')
            ->innerJoin(FormRecord::TABLE.' f', 'f.id = s.formId')
            ->groupBy('s.formId')
            ->indexBy('f.uuid')
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
        array $formSubmissions,
        array $strategy,
    ): FreeformDataset {
        $dataset = new FreeformDataset();

        $dataset->setNotificationTemplates($this->collectNotifications($notificationIds));
        $dataset->setForms($this->collectForms($formIds));
        $dataset->setFormSubmissions($this->collectSubmissions($formSubmissions));
        $dataset->setSettings($this->collectSettings());
        $dataset->setStrategy(new ImportStrategy($strategy));

        return $dataset;
    }

    private function collectForms(?array $ids = null): FormCollection
    {
        $colorGenerator = new RandomColorGenerator();
        $collection = new FormCollection();

        $forms = (new Query())
            ->select('*')
            ->from('{{%expressforms_forms}}')
            ->where(null !== $ids ? ['uuid' => $ids] : null)
            ->all()
        ;

        $defaultStatus = Freeform::getInstance()->statuses->getDefaultStatusId();

        foreach ($forms as $index => $form) {
            $exported = new Form();
            $exported->uid = $form['uuid'];
            $exported->name = $form['name'] ?? 'Untitled '.$form['id'];
            $exported->handle = $form['handle'] ?? 'untitled-'.$form['id'];
            $exported->order = $form['sortOrder'] ?? $index;

            $exported->settings = new FormSettings([], $this->propertyProvider);

            $general = $exported->settings->getGeneral();
            $general->name = $exported->name;
            $general->handle = $exported->handle;
            $general->description = $form['description'] ?? '';
            $general->submissionTitle = $form['submissionTitle'] ?? '{{ dateCreated|date("Y-m-d H:i:s") }}';
            $general->color = $form['color'] ?? $colorGenerator->generateValue($form);
            $general->defaultStatus = $defaultStatus;
            $general->storeData = (bool) $form['saveSubmissions'] ?? true;
            $general->formattingTemplate = 'flexbox/index.twig';

            $behavior = $exported->settings->getBehavior();
            $behavior->ajax = true;
            $behavior->showProcessingSpinner = true;
            $behavior->showProcessingText = true;

            $exported->notifications = new NotificationCollection();

            if (isset($form['adminNotification']) && $form['adminNotification']) {
                $notification = new Notification();
                $notification->name = 'Admin Notification';
                $notification->type = Admin::class;
                $notification->id = $form['adminNotification'];
                $notification->idAttribute = 'template';

                $recipients = FreeformStringHelper::extractSeparatedValues($form['adminEmails'] ?? '');

                $notification->metadata = [
                    'recipients' => array_map(
                        fn (string $recipient) => ['email' => $recipient, 'name' => ''],
                        $recipients,
                    ),
                ];

                $exported->notifications->add($notification);
            }

            if (isset($form['submitterNotification']) && $form['submitterNotification']) {
                $notification = new Notification();
                $notification->name = 'Submitter Notification';
                $notification->type = EmailFieldNotification::class;
                $notification->id = $form['submitterNotification'];
                $notification->idAttribute = 'template';
                $notification->metadata = [
                    'field' => $form['submitterEmailField'],
                ];

                $exported->notifications->add($notification);
            }

            $exported->pages = new PageCollection();

            $pageUid = preg_replace(
                '/^(\w{8})-(\w{4})-(\w{4})-(\w{4})-(\w{12})$/',
                '$1-$2-$3-1000-'.str_repeat('0', 12),
                $form['uuid']
            );

            $page = new Page();
            $page->uid = $pageUid;
            $page->label = 'Page 1';

            $layoutUid = preg_replace(
                '/^(\w{8})-(\w{4})-(\w{4})-(\w{4})-(\w{12})$/',
                '$1-$2-$3-1001-'.str_repeat('0', 12),
                $form['uuid']
            );

            $layout = new Layout();
            $layout->uid = $layoutUid;
            $layout->rows = new RowCollection();

            $formFields = JsonHelper::decode($form['fields'] ?? []);
            foreach ($formFields as $index => $formField) {
                $type = match ($formField->type) {
                    'textarea' => TextareaField::class,
                    'options' => DropdownField::class,
                    'checkbox' => CheckboxField::class,
                    'email' => EmailField::class,
                    'hidden' => HiddenField::class,
                    'file' => FileUploadField::class,
                    default => TextField::class,
                };

                $field = new Field();
                $field->uid = $formField->uid;
                $field->name = $formField->name;
                $field->handle = $formField->handle;
                $field->type = $type;
                $field->required = $formField->required ?? false;
                $field->metadata = match ($formField->type) {
                    'file' => [
                        'maxFileSizeKB' => $formField->maxFileSizeKB ?? 0,
                        'fileKinds' => $formField->fileKinds ?? ['image'],
                        'fileCount' => $formField->fileCount ?? 1,
                        'assetSourceId' => $formField->volumeId ?? null,
                    ],
                    'options' => [
                        'optionConfiguration' => [
                            'source' => 'custom',
                            'useCustomValues' => true,
                            'options' => [],
                        ],
                    ],
                    default => [],
                };

                $rowUid = preg_replace(
                    '/^(\w{8})-(\w{4})-(\w{4})-(\w{4})-(\w{12})$/',
                    '$1-$2-$3-1001-'.str_pad($index + 1, 12, '0', \STR_PAD_LEFT),
                    $form['uuid']
                );

                $row = new Row();
                $row->uid = $rowUid;
                $row->fields = new FieldCollection();
                $row->fields->add($field);

                $layout->rows->add($row);
            }

            $page->layout = $layout;

            $exported->pages->add($page);

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectIntegrations(): IntegrationCollection
    {
        $collection = new IntegrationCollection();

        $integrations = ExpressForms::getInstance()->integrations->getIntegrationTypes();
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            $exported = new Integration();
            $exported->name = $integration->getName();
            $exported->handle = $integration->getHandle();

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectNotifications(?array $ids = null): NotificationTemplateCollection
    {
        $collection = new NotificationTemplateCollection();
        $notifications = ExpressForms::getInstance()->emailNotifications->getNotifications();

        foreach ($notifications as $notification) {
            if (null !== $ids && !\in_array($notification->fileName, $ids, true)) {
                continue;
            }

            $exported = new NotificationTemplate();
            $exported->originalId = $notification->fileName;
            $exported->name = $notification->name;
            $exported->handle = CraftStringHelper::toCamelCase($notification->name);
            $exported->description = $notification->getDescription() ?? null;

            $exported->fromName = $notification->fromName ?? '{{ craft.app.projectConfig.get("email.fromName") }}';
            $exported->fromEmail = $notification->fromEmail ?? '{{ craft.app.projectConfig.get("email.fromEmail") }}';
            $exported->replyToName = $notification->replyTo ?? null;
            $exported->replyToEmail = $notification->replyTo ?? null;
            $exported->cc = FreeformStringHelper::extractSeparatedValues($notification->cc ?? '');
            $exported->bcc = FreeformStringHelper::extractSeparatedValues($notification->bcc ?? '');

            $exported->includeAttachments = (bool) ($notification->includeAttachments ?? false);

            $exported->subject = $notification->subject ?? '';
            $exported->body = $notification->body ?? '';
            $exported->textBody = $notification->body ?? '';
            $exported->autoText = true;

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectSubmissions(?array $ids = null): FormSubmissionCollection
    {
        $collection = new FormSubmissionCollection();

        $forms = ExpressForms::getInstance()->forms->getAllForms();

        foreach ($forms as $form) {
            if (null !== $ids && !\in_array($form->getUuid(), $ids, true)) {
                continue;
            }

            $submissions = XFSubmission::find()->formId($form->getId());

            $formSubmissions = new FormSubmissions();
            $formSubmissions->formUid = $form->getUuid();
            $formSubmissions->submissionBatchProcessor = new ElementQueryProcessor($submissions);
            $formSubmissions->setProcessor(
                function (XFSubmission $row) use ($form) {
                    $exported = new Submission();
                    $exported->title = $row->title;
                    $exported->status = $row->status;

                    foreach ($form->getFields() as $field) {
                        $exported->{$field->getHandle()} = $row->getFieldValue($field->getHandle());
                    }

                    return $exported;
                }
            );

            $collection->add($formSubmissions, $form->getUuid());
        }

        return $collection;
    }

    private function collectSettings(): Settings
    {
        $settings = ExpressForms::getInstance()->settings->getSettingsModel();

        $exported = new Settings();
        $exported->pluginName = $settings->name;
        $exported->emailTemplateDirectory = $settings->emailNotificationsDirectoryPath;
        $exported->defaults = new Defaults();

        return $exported;
    }
}
