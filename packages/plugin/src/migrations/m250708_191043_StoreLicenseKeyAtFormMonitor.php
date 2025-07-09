<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m250708_191043_StoreLicenseKeyAtFormMonitor migration.
 */
class m250708_191043_StoreLicenseKeyAtFormMonitor extends Migration
{
    public function safeUp(): bool
    {
        $plugin = \Craft::$app->plugins->getPlugin('freeform');
        if (!$plugin) {
            return true;
        }

        $licenseKey = \Craft::$app->plugins->getPluginLicenseKey($plugin->id);

        $table = '{{%freeform_integrations}}';
        $class = 'Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor';

        $row = (new Query())
            ->select(['id', 'metadata'])
            ->from($table)
            ->where(['class' => $class, 'enabled' => 1])
            ->one()
        ;

        if ($row) {
            $metadata = json_decode($row['metadata'], true);
            if (empty($metadata['storedLicenseKey'])) {
                $metadata['storedLicenseKey'] = $licenseKey;
                $this->update(
                    $table,
                    ['metadata' => json_encode($metadata)],
                    ['id' => $row['id']]
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return true;
    }
}
