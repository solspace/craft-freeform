<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Helpers\CryptoHelper;
use yii\db\Query;

/**
 * m180214_094247_AddtokenToSubmissionsAndForms migration.
 */
class m180214_094247_AddUniqueTokenToSubmissionsAndForms extends Migration
{
    const TOKEN_LENGTH = 100;

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('{{%freeform_forms}}', 'optInDataStorageTargetHash', $this->string(20)->null());
        $this->addColumn('{{%freeform_submissions}}', 'token', $this->string(self::TOKEN_LENGTH)->notNull());

        $rows = (new Query())
            ->select(['id'])
            ->from('{{%freeform_submissions}}')
            ->all()
        ;

        foreach ($rows as $row) {
            $this->update(
                '{{%freeform_submissions}}',
                ['token' => CryptoHelper::getUniqueToken(self::TOKEN_LENGTH)],
                ['id' => $row['id']]
            );
        }

        $this->createIndex('token_unq_idx', '{{%freeform_submissions}}', ['token'], true);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropIndex('token_unq_idx', '{{%freeform_submissions}}');

        $this->dropColumn('{{%freeform_forms}}', 'optInDataStorageTargetHash');
        $this->dropColumn('{{%freeform_submissions}}', 'token');

        return true;
    }
}
