<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\records\UserPermission;
use craft\records\UserPermission_UserGroup;
use yii\db\Expression;

/**
 * m210414_104951_MigrateSubmissionPermissions migration.
 */
class m210413_104951_MigrateSubmissionPermissions extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $managePerm = (new Query())
            ->select('id')
            ->from('{{%userpermissions}}')
            ->where(['name' => 'freeform-submissionsmanage'])
            ->scalar()
        ;

        if (!$managePerm) {
            return true;
        }

        $accessPerm = (new Query())
            ->select('id')
            ->from('{{%userpermissions}}')
            ->where(['name' => 'freeform-submissionsmanageindividual'])
            ->scalar()
        ;

        if (!$accessPerm) {
            $record = new UserPermission();
            $record->name = 'freeform-submissionsmanageindividual';
            $record->save();

            $accessPerm = $record->id;
        }

        $userIds = (new Query())
            ->select('uu.[[userId]]')
            ->from('{{%userpermissions_users}} uu')
            ->innerJoin('{{%userpermissions}} u', 'u.[[id]] = uu.[[permissionId]]')
            ->where(new Expression('u.[[name]] LIKE :name', ['name' => 'freeform-submissionsmanage:%']))
            ->groupBy('uu.[[userId]]')
            ->column()
        ;

        $userPermissions = \Craft::$app->userPermissions;

        foreach ($userIds as $userId) {
            $permissions = $userPermissions->getPermissionsByUserId($userId);

            $manageIndex = array_search('freeform-submissionsmanage', $permissions, true);
            if (false !== $manageIndex) {
                unset($permissions[$manageIndex]);
            }

            $permissions[] = 'freeform-submissionsmanageindividual';
            $permissions = array_unique($permissions);

            $userPermissions->saveUserPermissions($userId, $permissions);
        }

        $groupIds = (new Query())
            ->select('ug.[[groupId]]')
            ->from('{{%userpermissions_usergroups}} ug')
            ->innerJoin('{{%userpermissions}} u', 'u.[[id]] = ug.[[permissionId]]')
            ->where(new Expression('u.[[name]] LIKE :name', ['name' => 'freeform-submissionsmanage:%']))
            ->groupBy('ug.[[groupId]]')
            ->column()
        ;

        $projectConfig = \Craft::$app->getProjectConfig();
        if ($projectConfig->readOnly) {
            return true;
        }

        foreach ($groupIds as $groupId) {
            $permissions = $userPermissions->getPermissionsByGroupId($groupId);

            $manageIndex = array_search('freeform-submissionsmanage', $permissions);
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

            $permissions[] = 'freeform-submissionsmanageindividual';
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
        echo "m210414_104951_MigrateSubmissionPermissions cannot be reverted.\n";

        return false;
    }
}
