<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m200907_081059_AddValidationsToFormProperties migration.
 */
class m200907_081059_AddValidationToFormProperties extends Migration
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
            if (!isset($layout['composer']['properties']['validation'])) {
                $layout['composer']['properties']['validation'] = [
                    'type' => 'validation',
                    'validationType' => 'submit',
                    'successMessage' => '',
                    'errorMessage' => '',
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
        echo "m200907_081059_AddValidationsToFormProperties cannot be reverted.\n";

        return false;
    }
}
