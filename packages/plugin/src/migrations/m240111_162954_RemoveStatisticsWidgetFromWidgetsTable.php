<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240111_162954_RemoveStatisticsWidgetFromWidgetsTable migration.
 */
class m240111_162954_RemoveStatisticsWidgetFromWidgetsTable extends Migration
{
    public function safeUp(): bool
    {
        \craft\records\Widget::deleteAll(['type' => 'Solspace\\Freeform\\Widgets\\StatisticsWidget']);

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240111_162954_RemoveStatisticsWidgetFromWidgetsTable cannot be reverted.\n";

        return false;
    }
}
