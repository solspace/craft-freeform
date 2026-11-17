<?php

namespace Solspace\Freeform\Library\Configuration;

use craft\db\Query;
use craft\helpers\StringHelper;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;
use Solspace\Freeform\Records\Pro\ExportSettingRecord;
use yii\db\Connection;

class ExportFormattingUpgrade
{
    public static function seed(Connection $db, array $legacySettings): void
    {
        $formatting = json_encode(ExportFormatting::fromLegacySettings($legacySettings), \JSON_THROW_ON_ERROR);
        if (null !== $db->getTableSchema(ExportProfileRecord::TABLE)) {
            $db->createCommand()->update(ExportProfileRecord::TABLE, ['formatting' => $formatting], ['formatting' => null])->execute();
        }
        if (null === $db->getTableSchema(ExportSettingRecord::TABLE)) {
            return;
        }

        $schema = $db->getTableSchema(ExportSettingRecord::TABLE);
        $db->createCommand()->update(ExportSettingRecord::TABLE, ['formatting' => $formatting], ['formatting' => null])->execute();

        // Include existing users who have never opened Quick Export. Their first
        // v6 export must retain the old site-wide choices as well.
        $users = (new Query())->select('id')->from('{{%users}}')->where(['not in', 'id', (new Query())->select('userId')->from(ExportSettingRecord::TABLE)]);
        while ($batch = (clone $users)->limit(200)->all($db)) {
            foreach ($batch as $user) {
                $values = ['userId' => $user['id'], 'setting' => '{}', 'formatting' => $formatting];
                foreach (['dateCreated', 'dateUpdated'] as $column) {
                    if (isset($schema->columns[$column])) {
                        $values[$column] = gmdate('Y-m-d H:i:s');
                    }
                }
                if (isset($schema->columns['uid'])) {
                    $values['uid'] = StringHelper::UUID();
                }
                $db->createCommand()->insert(ExportSettingRecord::TABLE, $values)->execute();
            }
        }
    }
}
