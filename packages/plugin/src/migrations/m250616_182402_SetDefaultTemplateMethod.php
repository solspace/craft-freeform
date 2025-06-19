<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250616_182402_SetDefaultTemplateMethod extends Migration
{
    public function safeUp(): bool
    {
        if (!\Craft::$app->config->general->allowAdminChanges) {
            return true;
        }

        \Craft::$app->projectConfig->set(
            'plugins.freeform.settings.emailTemplateMethod',
            'global'
        );

        return true;
    }

    public function safeDown(): bool
    {
        return true;
    }
}
