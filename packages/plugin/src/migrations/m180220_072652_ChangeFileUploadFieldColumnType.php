<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Elements\Submission;

/**
 * m180220_072652_ChangeFileUploadFieldColumnType migration.
 */
class m180220_072652_ChangeFileUploadFieldColumnType extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $ids = (new Query())
            ->select(['id'])
            ->from('{{%freeform_fields}}')
            ->where(['type' => 'file'])
            ->all()
        ;

        foreach ($ids as $row) {
            $column = Submission::getFieldColumnName($row['id']);
            $this->alterColumn('{{%freeform_submissions}}', $column, $this->text()->null());
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $ids = (new Query())
            ->select(['id'])
            ->from('{{%freeform_fields}}')
            ->where(['type' => 'file'])
            ->all()
        ;

        foreach ($ids as $row) {
            $column = Submission::getFieldColumnName($row['id']);
            $this->alterColumn('{{%freeform_submissions}}', $column, $this->string(100)->null());
        }
    }
}
