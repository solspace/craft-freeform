<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\Collections\SubmissionCollection;
use Solspace\Freeform\Models\Settings;

class FreeformDataset
{
    private ?FormCollection $forms = null;
    private ?IntegrationCollection $integrations = null;
    private ?NotificationTemplateCollection $notificationTemplates = null;
    private ?SubmissionCollection $submissions = null;
    private ?Settings $settings = null;

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

    public function getSubmissions(): ?SubmissionCollection
    {
        return $this->submissions;
    }

    public function setSubmissions(?SubmissionCollection $submissions): self
    {
        $this->submissions = $submissions;

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
}
