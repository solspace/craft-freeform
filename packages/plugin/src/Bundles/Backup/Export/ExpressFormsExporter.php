<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use craft\db\Query;
use craft\helpers\StringHelper;
use Solspace\Commons\Helpers\StringHelper as FreeformStringHelper;
use Solspace\ExpressForms\ExpressForms;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\PageCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\Collections\SubmissionCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\DTO\Form;
use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Bundles\Backup\DTO\Integration;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\Notification;
use Solspace\Freeform\Bundles\Backup\DTO\Page;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\RandomColorGenerator;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Models\Settings;

class ExpressFormsExporter implements ExporterInterface
{
    private array $notificationReference = [];

    public function __construct(private PropertyProvider $propertyProvider) {}

    public function collect(
        bool $forms = true,
        bool $integrations = true,
        bool $notifications = true,
        bool $submissions = true,
        bool $settings = true,
    ): FreeformDataset {
        $dataset = new FreeformDataset();

        if ($notifications) {
            $dataset->setNotifications($this->collectNotifications());
        }

        if ($forms) {
            $dataset->setForms($this->collectForms());
        }

        if ($submissions) {
            $dataset->setSubmissions($this->collectSubmissions());
        }

        if ($settings) {
            $dataset->setSettings($this->collectSettings());
        }

        return $dataset;
    }

    private function collectForms(): FormCollection
    {
        $collection = new FormCollection();

        $forms = (new Query())
            ->select('*')
            ->from('{{%expressforms_forms}}')
            ->all()
        ;

        $defaultStatus = (int) (new Query())
            ->select('id')
            ->from('{{%freeform_statuses}}')
            ->where(['isDefault' => true])
            ->limit(1)
            ->scalar()
        ;

        $colorGenerator = new RandomColorGenerator();

        foreach ($forms as $index => $form) {
            $exported = new Form();
            $exported->uid = $form['uid'];
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
            $general->formattingTemplate = 'bootstrap-5/index.twig';

            $behavior = $exported->settings->getBehavior();
            $behavior->ajax = true;
            $behavior->showProcessingSpinner = true;
            $behavior->showProcessingText = true;

            $exported->pages = new PageCollection();

            $page = new Page();
            $page->uid = StringHelper::UUID();
            $page->label = 'Page 1';

            $layout = new Layout();
            $layout->uid = StringHelper::UUID();
            $layout->rows = new RowCollection();

            $formFields = JsonHelper::decode($form['fields'] ?? []);
            foreach ($formFields as $formField) {
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
                    default => [],
                };

                $row = new Row();
                $row->uid = StringHelper::UUID();
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

    private function collectNotifications(): NotificationCollection
    {
        $collection = new NotificationCollection();

        $notifications = ExpressForms::getInstance()->emailNotifications->getNotifications();

        foreach ($notifications as $notification) {
            $exported = new Notification();
            $exported->originalId = $notification->fileName;
            $exported->name = $notification->name;
            $exported->handle = StringHelper::toCamelCase($notification->name);
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

    private function collectSubmissions(): SubmissionCollection
    {
        return new SubmissionCollection();
    }

    private function collectSettings(): Settings
    {
        $settings = ExpressForms::getInstance()->settings->getSettingsModel();

        $exported = new Settings();
        $exported->pluginName = $settings->name;
        $exported->emailTemplateDirectory = $settings->emailNotificationsDirectoryPath;

        return $exported;
    }
}