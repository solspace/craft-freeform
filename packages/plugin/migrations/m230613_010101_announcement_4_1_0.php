<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\i18n\Translation;

/**
 * m230613_010101_announcement_4_1_0 migration.
 */
class m230613_010101_announcement_4_1_0 extends Migration
{
    public function safeUp(): bool
    {
        \Craft::$app->announcements->push(
            Translation::prep('freeform', 'Improved GraphQL / Headless support!', []),
            Translation::prep('freeform', 'Added support for [GraphQL Mutations]({url1}) and significantly improved support for [headless implementations]({url2}).', [
                'url1' => 'https://docs.solspace.com/craft/freeform/v4/headless/graphql/',
                'url2' => 'https://docs.solspace.com/craft/freeform/v4/headless/',
            ]),
            'freeform',
            true
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230613_010101_announcement_4_1_0 cannot be reverted.\n";

        return false;
    }
}
