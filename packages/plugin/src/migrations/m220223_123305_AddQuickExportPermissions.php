<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\records\UserPermission;

/**
 * m220223_123305_AddQuickExportPermissions migration.
 */
class m220223_123305_AddQuickExportPermissions extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $quickExportPerm = (new Query())
            ->select('id')
            ->from('{{%userpermissions}}')
            ->where(['name' => 'freeform-access-quick-export'])
            ->scalar()
        ;

        if (!$quickExportPerm) {
            $record = new UserPermission();
            $record->name = 'freeform-access-quick-export';
            $record->save();
        }

        $userIds = (new Query())
            ->select('uu.[[userId]]')
            ->from('{{%userpermissions_users}} uu')
            ->innerJoin('{{%userpermissions}} u', 'u.[[id]] = uu.[[permissionId]]')
            ->where(['u.[[name]]' => 'freeform-submissionsaccess'])
            ->groupBy('uu.[[userId]]')
            ->column()
        ;

        $userPermissions = \Craft::$app->userPermissions;

        foreach ($userIds as $userId) {
            $permissions = $userPermissions->getPermissionsByUserId($userId);
            $permissions[] = 'freeform-access-quick-export';
            $permissions = array_unique($permissions);

            $userPermissions->saveUserPermissions($userId, $permissions);
        }

        $groupIds = (new Query())
            ->select('ug.[[groupId]]')
            ->from('{{%userpermissions_usergroups}} ug')
            ->innerJoin('{{%userpermissions}} u', 'u.[[id]] = ug.[[permissionId]]')
            ->where(['u.[[name]]' => 'freeform-submissionsaccess'])
            ->groupBy('ug.[[groupId]]')
            ->column()
        ;

        $projectConfig = \Craft::$app->getProjectConfig();
        if ($projectConfig->readOnly) {
            return true;
        }

        foreach ($groupIds as $groupId) {
            $permissions = $userPermissions->getPermissionsByGroupId($groupId);
            $permissions[] = 'freeform-access-quick-export';
            $permissions = array_unique($permissions);

            $userPermissions->saveGroupPermissions($groupId, $permissions);
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m220223_123305_AddQuickExportPermissions cannot be reverted.\n";

        return false;
    }
}
