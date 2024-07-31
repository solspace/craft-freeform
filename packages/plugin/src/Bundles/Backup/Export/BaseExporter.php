<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\DTO\FreeformDataset;
use Solspace\Freeform\Bundles\Backup\DTO\ImportStrategy;
use Solspace\Freeform\Models\Settings;

abstract class BaseExporter implements ExporterInterface
{
    private array $options = [];

    public function setOptions(array $options): void
    {
        $this->options = $options;
    }

    public function getOption(string $key, mixed $defaultValue = null): mixed
    {
        return $this->options[$key] ?? $defaultValue;
    }

    public function collect(): FreeformDataset
    {
        $dataset = new FreeformDataset();

        $formIds = $this->getOption('forms', []);
        $notificationIds = $this->getOption('notificationTemplates', []);
        $integrationIds = $this->getOption('integrations', []);
        $formSubmissions = $this->getOption('formSubmissions', []);
        $strategy = $this->getOption('strategy', []);
        $settings = $this->getOption('settings', false);

        $dataset->setNotificationTemplates($this->collectNotifications($notificationIds));
        $dataset->setForms($this->collectForms($formIds));
        $dataset->setFormSubmissions($this->collectSubmissions($formSubmissions));
        $dataset->setIntegrations($this->collectIntegrations($integrationIds));
        $dataset->setSettings($this->collectSettings($settings));
        $dataset->setStrategy(new ImportStrategy($strategy));

        return $dataset;
    }

    public function destruct(): void {}

    abstract protected function collectForms(?array $ids = null): FormCollection;

    abstract protected function collectIntegrations(?array $ids = null): IntegrationCollection;

    abstract protected function collectNotifications(?array $ids = null): NotificationTemplateCollection;

    abstract protected function collectSubmissions(?array $ids = null): FormSubmissionCollection;

    abstract protected function collectSettings(bool $collect): ?Settings;
}
