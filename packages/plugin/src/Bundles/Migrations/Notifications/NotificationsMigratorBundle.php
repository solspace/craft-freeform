<?php

namespace Solspace\Freeform\Bundles\Migrations\Notifications;

use Solspace\Freeform\Library\Bundles\FeatureBundle;

class NotificationsMigratorBundle extends FeatureBundle
{
    public function __construct()
    {
        \Craft::$container->set(NotificationsMigrator::class);
    }
}
