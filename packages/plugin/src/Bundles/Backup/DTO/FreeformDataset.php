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

    public function getForms(?array $uids = null): ?FormCollection
    {
        if (null === $uids) {
            return $this->forms;
        }

        return $this->forms->filter(
            fn (Form $form) => \in_array($form->uid, $uids, true)
        );
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

    public function getNotificationTemplates(?array $ids = null): ?NotificationTemplateCollection
    {
        if (null === $ids) {
            return $this->notificationTemplates;
        }

        return $this->notificationTemplates->filter(
            fn (NotificationTemplate $template) => \in_array($template->originalId, $ids, true)
        );
    }

    public function setNotificationTemplates(?NotificationTemplateCollection $notificationTemplates): self
    {
        $this->notificationTemplates = $notificationTemplates;

        return $this;
    }

    public function getFormSubmissions(?array $uids = null): ?FormSubmissionCollection
    {
        if (null === $uids) {
            return $this->formSubmissions;
        }

        return $this->formSubmissions->filter(
            fn (FormSubmissions $submissions) => \in_array($submissions->formUid, $uids, true)
        );
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

    public function getCounters(): object
    {
        $forms = 0;
        $pages = 0;
        $rows = 0;
        $fields = 0;

        foreach ($this->forms as $form) {
            ++$forms;

            foreach ($form->pages as $page) {
                ++$pages;

                foreach ($page->layout->rows as $row) {
                    ++$rows;

                    foreach ($row->fields as $field) {
                        ++$fields;
                    }
                }
            }
        }

        return (object) [
            'forms' => $forms,
            'fields' => $fields,
            'pages' => $pages,
            'rows' => $rows,
        ];
    }
}
