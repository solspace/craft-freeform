<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m180606_141402_AddConnectionsToFormProperties migration.
 */
class m180606_141402_AddConnectionsToFormProperties extends Migration
{
    public function safeUp()
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
            if (!isset($layout['composer']['properties']['connections'])) {
                $layout['composer']['properties']['connections'] = [
                    'type' => 'connections',
                    'list' => null,
                ];

                $this->update(
                    '{{%freeform_forms}}',
                    ['layoutJson' => json_encode($layout)],
                    ['id' => $id]
                );
            }
        }
    }

    public function safeDown()
    {
        echo "m180606_141402_AddConnectionsToFormProperties cannot be reverted.\n";

        return false;
    }
}
