<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m201014_161213_AddFormSortOrder migration.
 */
class m201014_161213_AddFormSortOrder extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_forms}}', 'order')) {
                $this->addColumn('{{%freeform_forms}}', 'order', $this->integer());
            }

            $forms = (new Query())
                ->select('id')
                ->from('{{%freeform_forms}}')
                ->orderBy(['id' => \SORT_ASC])
                ->column()
            ;

            foreach ($forms as $index => $formId) {
                $this->update(
                    '{{%freeform_forms}}',
                    ['order' => $index + 1],
                    ['id' => $formId]
                );
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_forms}}', 'order')) {
                $this->dropColumn('{{%freeform_order}}', 'order');
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
