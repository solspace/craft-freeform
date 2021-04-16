<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\records\UserPermission_UserGroup;
use yii\db\Expression;

/**
 * m210416_052726_MigrateFormPermissions migration.
 */
class m210416_072726_MigrateFormPermissions extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $managePerm = (new Query())
            ->select('id')
            ->from('{{%userpermissions}}')
            ->where(['name' => 'freeform-formsmanage'])
            ->scalar()
        ;

        if (!$managePerm) {
            return true;
        }

        $accessPerm = (new Query())
            ->select('id')
            ->from('{{%userpermissions}}')
            ->where(['name' => 'freeform-formsmanageindividual'])
            ->scalar()
        ;

        if (!$accessPerm) {
            $record = new UserPermission();
            $record->name = 'freeform-formsmanageindividual';
            $record->save();

            $accessPerm = $record->id;
        }

        $userIds = (new Query())
            ->select('uu.[[userId]]')
            ->from('{{%userpermissions_users}} uu')
            ->innerJoin('{{%userpermissions}} u', 'u.[[id]] = uu.[[permissionId]]')
            ->where(new Expression('u.[[name]] LIKE :name', ['name' => 'freeform-formsmanage:%']))
            ->groupBy('uu.[[userId]]')
            ->column()
        ;

        $userPermissions = \Craft::$app->userPermissions;

        foreach ($userIds as $userId) {
            $permissions = $userPermissions->getPermissionsByUserId($userId);

            $manageIndex = array_search('freeform-formsmanage', $permissions, true);
            if (false !== $manageIndex) {
                unset($permissions[$manageIndex]);
            }

            $permissions[] = 'freeform-formsmanageindividual';
            $permissions = array_unique($permissions);

            $userPermissions->saveUserPermissions($userId, $permissions);
        }

        $groupIds = (new Query())
            ->select('ug.[[groupId]]')
            ->from('{{%userpermissions_usergroups}} ug')
            ->innerJoin('{{%userpermissions}} u', 'u.[[id]] = ug.[[permissionId]]')
            ->where(new Expression('u.[[name]] LIKE :name', ['name' => 'freeform-formsmanage:%']))
            ->groupBy('ug.[[groupId]]')
            ->column()
        ;

        foreach ($groupIds as $groupId) {
            $permissions = $userPermissions->getPermissionsByGroupId($groupId);

            $manageIndex = array_search('freeform-formsmanage', $permissions);
            if (false !== $manageIndex) {
                unset($permissions[$manageIndex]);

                $record = UserPermission_UserGroup::findOne([
                    'permissionId' => $managePerm,
                    'groupId' => $groupId,
                ]);

                if ($record) {
                    $record->delete();
                }

                $record = new UserPermission_UserGroup();
                $record->permissionId = $accessPerm;
                $record->groupId = $groupId;
                $record->save();
            }

            $permissions[] = 'freeform-formsmanageindividual';
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
        echo "m210416_052726_MigrateFormPermissions cannot be reverted.\n";

        return false;
    }
}
