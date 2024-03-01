<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationTemplateCollection;

class ImportPreview
{
    public FormCollection $forms;
    public NotificationTemplateCollection $notificationTemplates;
    public array $formSubmissions = [];
}
