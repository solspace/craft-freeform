<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use craft\db\Query;
use Solspace\Commons\Helpers\StringHelper as FreeformStringHelper;
use Solspace\ExpressForms\ExpressForms;
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
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\NotificationTemplate;
use Solspace\Freeform\Bundles\Backup\DTO\Page;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Bundles\Backup\DTO\Submission;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Models\Settings;
use verbb\formie\base\FormField;
use verbb\formie\elements\db\SubmissionQuery;
use verbb\formie\elements\Form as FormElement;
use verbb\formie\elements\Submission as FormieSubmissionElement;
use verbb\formie\fields\formfields\Agree;
use verbb\formie\fields\formfields\Calculations;
use verbb\formie\fields\formfields\Categories;
use verbb\formie\fields\formfields\Checkboxes;
use verbb\formie\fields\formfields\Date;
use verbb\formie\fields\formfields\Dropdown;
use verbb\formie\fields\formfields\Email;
use verbb\formie\fields\formfields\Entries;
use verbb\formie\fields\formfields\FileUpload;
use verbb\formie\fields\formfields\Group;
use verbb\formie\fields\formfields\Heading;
use verbb\formie\fields\formfields\Hidden;
use verbb\formie\fields\formfields\Html;
use verbb\formie\fields\formfields\SingleLineText;
use verbb\formie\Formie;
use verbb\formie\records\Form as FormRecord;
use verbb\formie\records\Submission as FormieSubmission;

class FormieExporter implements ExporterInterface
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
            ->from(FormieSubmission::tableName().' s')
            ->innerJoin(FormRecord::tableName().' f', 'f.id = s.formId')
            ->groupBy('s.formId')
            ->indexBy('f.uid')
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
        $collection = new FormCollection();

        /** @var FormElement[] $forms */
        $forms = FormElement::find()->all();

        foreach ($forms as $index => $form) {
            $exported = new Form();

            $exported->uid = $form->uid;
            $exported->name = $form->title;
            $exported->handle = $form->handle;
            $exported->order = $index;

            $exported->settings = new FormSettings([], $this->propertyProvider);

            $exported->notifications = new NotificationCollection();

            $exported->pages = new PageCollection();
            foreach ($form->getPages() as $page) {
                $exportPage = new Page();
                $exportPage->uid = $page->uid;
                $exportPage->label = $page->name;

                $layout = new Layout();
                $layout->uid = $page->getLayout()->uid;
                $layout->rows = new RowCollection();

                foreach ($page->getRows() as $row) {
                    $exportRow = new Row();
                    $exportRow->uid = $row['uid'];
                    $exportRow->fields = new FieldCollection();

                    foreach ($row['fields'] as $field) {
                        $exportField = new Field();
                        $exportField->uid = $field->uid;
                        $exportField->name = $field->name;
                        $exportField->handle = $field->handle;
                        $exportField->type = $this->extractFieldType($field);
                        $exportField->required = $field->required;
                        $exportField->metadata = $this->extractFieldMetadata($field);

                        $exportRow->fields->add($exportField);
                    }

                    $layout->rows->add($exportRow);
                }

                $exportPage->layout = $layout;
                $exported->pages->add($exportPage);
            }

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectIntegrations(): IntegrationCollection
    {
        return new IntegrationCollection();
    }

    private function collectNotifications(?array $ids = null): NotificationTemplateCollection
    {
        $collection = new NotificationTemplateCollection();

        $notifications = Formie::getInstance()->getNotifications()->getAllNotifications();
        foreach ($notifications as $notification) {
            if (null !== $ids && !\in_array($notification->uid, $ids, true)) {
                continue;
            }

            $exported = new NotificationTemplate();
            $exported->originalId = $notification->uid;
            $exported->name = $notification->name;
            $exported->handle = $notification->handle;
            $exported->description = '';

            $exported->fromName = $notification->fromName ?? '{{ craft.app.projectConfig.get("email.fromName") }}';
            $exported->fromEmail = $notification->fromEmail ?? '{{ craft.app.projectConfig.get("email.fromEmail") }}';
            $exported->replyToName = $notification->replyToName ?? null;
            $exported->replyToEmail = $notification->replyTo ?? null;
            $exported->cc = FreeformStringHelper::extractSeparatedValues($notification->cc ?? '');
            $exported->bcc = FreeformStringHelper::extractSeparatedValues($notification->bcc ?? '');

            $exported->includeAttachments = (bool) ($notification->attachFiles ?? false);

            $exported->subject = $notification->subject ?? '';
            $exported->body = $notification->content ?? '';
            $exported->textBody = $notification->content ?? '';
            $exported->autoText = true;

            $collection->add($exported);
        }

        return $collection;
    }

    private function collectSubmissions(?array $ids = null): FormSubmissionCollection
    {
        $collection = new FormSubmissionCollection();

        $forms = Formie::getInstance()->getForms()->getAllForms();

        foreach ($forms as $form) {
            if (null !== $ids && !\in_array($form->uid, $ids, true)) {
                continue;
            }

            /** @var SubmissionQuery $submissions */
            $submissions = FormieSubmissionElement::find();
            $submissions->formId($form->id);

            $formSubmissions = new FormSubmissions();
            $formSubmissions->formUid = $form->uid;
            $formSubmissions->submissionBatchProcessor = new ElementQueryProcessor($submissions);
            $formSubmissions->setProcessor(
                function (FormieSubmissionElement $row) {
                    $exported = new Submission();
                    $exported->title = $row->title;
                    $exported->status = $row->status;

                    foreach ($row->getFieldValues() as $key => $value) {
                        $exported->{$key} = $value;
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

    private function extractFieldType(FormField $field): string
    {
        return match ($field->getType()) {
            SingleLineText::class => TextField::class,
            Agree::class => CheckboxField::class,
            Calculations::class => CalculationField::class,
            Checkboxes::class => CheckboxesField::class,
            Date::class => DatetimeField::class,
            Email::class => EmailField::class,
            FileUpload::class => FileUploadField::class,
            Hidden::class => HiddenField::class,

            Html::class, Heading::class => HtmlField::class,
            Group::class => GroupField::class,

            Categories::class => DropdownField::class,
            Dropdown::class => DropdownField::class,
            Entries::class => DropdownField::class,

            default => TextField::class,
        };
    }

    private function extractFieldMetadata(FormField $field): array
    {
        return [];
    }
}
