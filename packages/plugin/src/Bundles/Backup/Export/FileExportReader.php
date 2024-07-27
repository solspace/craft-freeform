<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use craft\helpers\ArrayHelper;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Backup\BatchProcessing\FileLineProcessor;
use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\Collections\PageCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\DTO\Form;
use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Bundles\Backup\DTO\ImportPreview;
use Solspace\Freeform\Bundles\Backup\DTO\Integration;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\NotificationTemplate;
use Solspace\Freeform\Bundles\Backup\DTO\Page;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Bundles\Backup\DTO\Submission;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Library\Helpers\FileHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormsService;

class FileExportReader extends BaseExporter
{
    public function __construct(
        private PropertyProvider $propertyProvider,
        private IntegrationTypeProvider $integrationTypeProvider,
        private FormsService $formsService,
    ) {}

    public function collectDataPreview(): ImportPreview
    {
        $preview = new ImportPreview();

        $preview->forms = $this->collectForms();
        $preview->notificationTemplates = $this->collectNotifications();
        $preview->integrations = $this->collectIntegrations();

        $submissions = [];
        foreach ($this->getSubmissionFiles() as $uid => $file) {
            $submissions[] = [
                'formUid' => $uid,
                'count' => FileHelper::countLines($file),
            ];
        }

        $preview->formSubmissions = $submissions;

        return $preview;
    }

    protected function collectForms(?array $ids = null): FormCollection
    {
        $collection = new FormCollection();

        foreach ($this->readLineData('forms.jsonl') as $json) {
            if (null !== $ids && \in_array($json['uid'], $ids)) {
                continue;
            }

            $form = new Form();
            $form->uid = $json['uid'];
            $form->name = $json['name'];
            $form->handle = $json['handle'];
            $form->order = $json['order'];
            $form->settings = new FormSettings($json['settings'], $this->propertyProvider);

            $form->pages = new PageCollection();
            foreach ($json['pages'] as $pageJson) {
                $layout = new Layout();
                $layout->uid = $pageJson['layout']['uid'];
                $layout->rows = new RowCollection();

                $page = new Page();
                $page->uid = $pageJson['uid'];
                $page->layout = $layout;
                $page->label = $pageJson['label'];

                $form->pages->add($page);

                foreach ($pageJson['layout']['rows'] as $rowJson) {
                    $row = new Row();
                    $row->uid = $rowJson['uid'];
                    $row->fields = new FieldCollection();

                    foreach ($rowJson['fields'] as $fieldJson) {
                        $field = new Field();
                        $field->uid = $fieldJson['uid'];
                        $field->name = $fieldJson['name'];
                        $field->handle = $fieldJson['handle'];
                        $field->type = $fieldJson['type'];
                        $field->required = $fieldJson['required'];
                        $field->metadata = $fieldJson['metadata'];

                        $row->fields->add($field);
                    }

                    $layout->rows->add($row);
                }
            }

            $collection->add($form);
        }

        return $collection;
    }

    protected function collectIntegrations(?array $ids = null): IntegrationCollection
    {
        $collection = new IntegrationCollection();

        foreach ($this->readLineData('integrations.jsonl') as $json) {
            if (null !== $ids && \in_array($json['uid'], $ids)) {
                continue;
            }

            $integration = new Integration();
            $integration->uid = $json['uid'];
            $integration->type = $json['type'];
            $integration->class = $json['class'];
            $integration->name = $json['name'];
            $integration->handle = $json['handle'];
            $integration->metadata = $json['metadata'];

            $type = $this->integrationTypeProvider->getTypeDefinition($integration->class);
            $integration->icon = $type->getIconUrl();

            $collection->add($integration);
        }

        return $collection;
    }

    protected function collectNotifications(?array $ids = null): NotificationTemplateCollection
    {
        $collection = new NotificationTemplateCollection();

        foreach ($this->readLineData('notifications.jsonl') as $json) {
            if (null !== $ids && \in_array($json['originalId'], $ids)) {
                continue;
            }

            $template = new NotificationTemplate();
            $template->originalId = $json['originalId'];
            $template->name = $json['name'];
            $template->handle = $json['handle'];
            $template->description = $json['description'];

            $template->fromName = $json['fromName'] ?? '{{ craft.app.projectConfig.get("email.fromName") }}';
            $template->fromEmail = $json['fromEmail'] ?? '{{ craft.app.projectConfig.get("email.fromEmail") }}';
            $template->replyToName = $json['replyToName'] ?? null;
            $template->replyToEmail = $json['replyToEmail'] ?? null;
            $template->cc = $json['cc'] ?? [];
            $template->bcc = $json['bcc'] ?? [];

            $template->includeAttachments = $json['includeAttachments'];

            $template->subject = $json['subject'] ?? '';
            $template->body = $json['body'] ?? '';
            $template->textBody = $json['textBody'] ?? '';
            $template->autoText = $json['autoText'] ?? false;

            $collection->add($template);
        }

        return $collection;
    }

    protected function collectSubmissions(?array $ids = null): FormSubmissionCollection
    {
        $collection = new FormSubmissionCollection();

        $forms = $this->formsService->getAllForms();
        $forms = ArrayHelper::index($forms, 'uid');

        foreach ($this->getSubmissionFiles() as $uid => $file) {
            $form = $forms[$uid];

            $formSubmissions = new FormSubmissions();
            $formSubmissions->formUid = $uid;
            $formSubmissions->submissionBatchProcessor = new FileLineProcessor($file);
            $formSubmissions->setProcessor(
                function (array $json) use ($form) {
                    $exported = new Submission();
                    $exported->title = $json['title'];
                    $exported->status = $json['status'];

                    foreach ($form->getLayout()->getFields() as $field) {
                        $exported->{$field->getHandle()} = $json[$field->getHandle()];
                    }

                    return $exported;
                }
            );

            $collection->add($formSubmissions, $uid);
        }

        return $collection;
    }

    protected function collectSettings(bool $collect): ?Settings
    {
        if (!$collect) {
            return null;
        }

        $content = $this->getFile('settings.json');
        $json = json_decode($content, true);

        return new Settings($json);
    }

    /**
     * @return false|resource
     *
     * @throws \Exception
     */
    private function getFile(string $name)
    {
        $path = $this->getPath();

        $filePath = $path.'/'.$name;
        if (!file_exists($filePath)) {
            throw new \Exception('File not found');
        }

        return fopen($filePath, 'r');
    }

    private function getPath(): string
    {
        $path = $this->getOption('path');
        if (!$path) {
            throw new \Exception('Path is required');
        }

        return $path;
    }

    private function readLineData(string $file): \Generator
    {
        try {
            $handle = $this->getFile($file);
        } catch (\Exception) {
            return;
        }

        while (($line = fgets($handle)) !== false) {
            yield json_decode($line, true);
        }

        fclose($handle);
    }

    private function getSubmissionFiles(): \Generator
    {
        $path = $this->getPath();
        $files = scandir($path);

        foreach ($files as $file) {
            if (!str_starts_with($file, 'submissions-')) {
                continue;
            }

            $uid = $file;
            $uid = str_replace('submissions-', '', $uid);
            $uid = str_replace('.jsonl', '', $uid);

            yield $uid => $path.'/'.$file;
        }
    }
}
