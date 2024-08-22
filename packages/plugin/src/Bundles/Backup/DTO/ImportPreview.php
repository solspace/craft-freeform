<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\TemplateCollection;

class ImportPreview
{
    public FormCollection $forms;
    public TemplateCollection $templates;
    public IntegrationCollection $integrations;
    public array $formSubmissions = [];
    public bool $settings = false;
}
