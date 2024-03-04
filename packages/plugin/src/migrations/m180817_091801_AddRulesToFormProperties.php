<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m180817_091801_AddRulesToFormProperties migration.
 */
class m180817_091801_AddRulesToFormProperties extends Migration
{
    public function safeUp(): void
    {
        $forms = (new Query())
            ->select(['id', 'layoutJson'])
            ->from('{{%freeform_forms}}')
            ->all()
        ;

        foreach ($forms as $form) {
            $id = $form['id'];
            $layoutJson = $form['layoutJson'];

            $layout = json_decode($layoutJson, true);
            if (!isset($layout['composer']['properties']['rules'])) {
                $layout['composer']['properties']['rules'] = [
                    'type' => 'rules',
                    'list' => [],
                ];

                $this->update(
                    '{{%freeform_forms}}',
                    ['layoutJson' => json_encode($layout)],
                    ['id' => $id]
                );
            }
        }
    }

    public function safeDown(): bool
    {
        echo "m180817_091801_AddRulesToFormProperties cannot be reverted.\n";

        return false;
    }
}
