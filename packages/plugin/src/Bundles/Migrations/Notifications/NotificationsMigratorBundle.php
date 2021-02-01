<?php

namespace Solspace\Freeform\Bundles\Migrations\Notifications;

use Solspace\Freeform\Library\Bundles\BundleInterface;

class NotificationsMigratorBundle implements BundleInterface
{
    public function __construct()
    {
        \Craft::$container->set(NotificationsMigrator::class);
    }
}
