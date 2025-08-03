<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\FavoritesCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormGroupsCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\LimitedUsersCollection;
use Solspace\Freeform\Bundles\Backup\Collections\TemplateCollection;

class ImportPreview
{
    public FormCollection $forms;
    public TemplateCollection $templates;
    public IntegrationCollection $integrations;
    public FavoritesCollection $favorites;
    public FormGroupsCollection $formGroups;
    public LimitedUsersCollection $limitedUsers;
    public array $formSubmissions = [];
    public bool $settings = false;
}
