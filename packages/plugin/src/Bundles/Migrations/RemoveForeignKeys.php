<?php

namespace Solspace\Freeform\Bundles\Migrations;

use craft\events\PluginEvent;
use craft\services\Plugins;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RemoveForeignKeys extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Plugins::class,
            Plugins::EVENT_BEFORE_UNINSTALL_PLUGIN,
            [$this, 'handleRemoveForeignKeys']
        );
    }

    public function handleRemoveForeignKeys(PluginEvent $event): void
    {
        if ($event->plugin !== Freeform::getInstance()) {
            return;
        }

        $db = \Craft::$app->getDb();
        $tables = $db->schema->getTableSchemas();
        $prefix = $db->tablePrefix;

        foreach ($tables as $table) {
            if (!str_starts_with($table->name, $prefix.'freeform_')) {
                continue;
            }

            foreach ($table->foreignKeys as $name => $foreignKey) {
                try {
                    $db->createCommand()->dropForeignKey($name, $table->name)->execute();
                } catch (\Exception $e) {
                }
            }
        }
    }
}
