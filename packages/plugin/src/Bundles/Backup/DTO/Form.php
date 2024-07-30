<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\NotificationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\PageCollection;
use Solspace\Freeform\Form\Settings\Settings;

class Form
{
    public string $uid;
    public string $name;
    public string $handle;
    public int $order;

    public int $spamBlockCount;

    public Settings $settings;

    public NotificationCollection $notifications;
    public PageCollection $pages;

    public function __construct()
    {
        $this->notifications = new NotificationCollection();
        $this->pages = new PageCollection();
    }
}
