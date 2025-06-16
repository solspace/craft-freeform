<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250616_182402_SetDefaultTemplateMethod extends Migration
{
    public function safeUp(): bool
    {
        \Craft::$app->projectConfig->set(
            'plugins.freeform.settings.emailTemplateMethod',
            'all'
        );

        return true;
    }

    public function safeDown(): bool
    {
        return true;
    }
}
