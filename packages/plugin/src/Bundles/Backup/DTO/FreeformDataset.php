<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;
use Solspace\Freeform\Models\Settings;

class FreeformDataset
{
    private ?FormCollection $forms = null;
    private ?IntegrationCollection $integrations = null;
    private ?NotificationTemplateCollection $notificationTemplates = null;
    private ?FormSubmissionCollection $formSubmissions = null;
    private ?Settings $settings = null;

    private ?ImportStrategy $strategy = null;

    public function getForms(): ?FormCollection
    {
        return $this->forms;
    }

    public function setForms(?FormCollection $forms): self
    {
        $this->forms = $forms;

        return $this;
    }

    public function getIntegrations(): ?IntegrationCollection
    {
        return $this->integrations;
    }

    public function setIntegrations(?IntegrationCollection $integrations): self
    {
        $this->integrations = $integrations;

        return $this;
    }

    public function getNotificationTemplates(): ?NotificationTemplateCollection
    {
        return $this->notificationTemplates;
    }

    public function setNotificationTemplates(?NotificationTemplateCollection $notificationTemplates): self
    {
        $this->notificationTemplates = $notificationTemplates;

        return $this;
    }

    public function getFormSubmissions(): ?FormSubmissionCollection
    {
        return $this->formSubmissions;
    }

    public function setFormSubmissions(?FormSubmissionCollection $formSubmissions): self
    {
        $this->formSubmissions = $formSubmissions;

        return $this;
    }

    public function getSettings(): ?Settings
    {
        return $this->settings;
    }

    public function setSettings(?Settings $settings): self
    {
        $this->settings = $settings;

        return $this;
    }

    public function getStrategy(): ?ImportStrategy
    {
        return $this->strategy;
    }

    public function setStrategy(?ImportStrategy $strategy): self
    {
        $this->strategy = $strategy;

        return $this;
    }
}
