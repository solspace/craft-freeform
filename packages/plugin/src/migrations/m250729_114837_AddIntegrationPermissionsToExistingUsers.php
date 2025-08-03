<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

class m250729_114837_AddIntegrationPermissionsToExistingUsers extends Migration
{
    private const PERMISSIONS_TABLE = '{{%userpermissions}}';
    private const GROUPS_TABLE = '{{%userpermissions_usergroups}}';
    private const USERS_TABLE = '{{%userpermissions_users}}';

    public function safeUp(): bool
    {
        $settingsPermission = 'freeform-settingsaccess';
        $integrationPermissions = [
            'freeform-integrationsaccess',
            'freeform-integrationsmanage',
        ];

        // Fetch permission IDs
        $permissions = (new Query())
            ->select(['id'])
            ->from(self::PERMISSIONS_TABLE)
            ->where(['name' => array_merge($integrationPermissions, [$settingsPermission])])
            ->indexBy('name')
            ->column()
        ;

        $integrationIds = [];
        foreach ($integrationPermissions as $permission) {
            if (!isset($permissions[$permission])) {
                $this->insert(self::PERMISSIONS_TABLE, ['name' => $permission]);
                $permissions[$permission] = $this->db->getLastInsertID();
            }

            $integrationIds[] = $permissions[$permission];
        }

        // Find permissionId for settings access
        $settingsId = $permissions[$settingsPermission] ?? null;
        if (!$settingsId) {
            // If settings permission doesn't exist, nothing to do
            return true;
        }

        // Add to user groups
        $groupIds = (new Query())
            ->select('groupId')
            ->from(self::GROUPS_TABLE)
            ->where(['permissionId' => $settingsId])
            ->column()
        ;

        foreach ($groupIds as $groupId) {
            foreach ($integrationIds as $integrationId) {
                $exists = (new Query())
                    ->from(self::GROUPS_TABLE)
                    ->where(['groupId' => $groupId, 'permissionId' => $integrationId])
                    ->exists()
                ;

                if (!$exists) {
                    $this->insert(
                        self::GROUPS_TABLE,
                        ['groupId' => $groupId, 'permissionId' => $integrationId]
                    );
                }
            }
        }

        // Add to users
        $userIds = (new Query())
            ->select('userId')
            ->from(self::USERS_TABLE)
            ->where(['permissionId' => $settingsId])
            ->column()
        ;

        foreach ($userIds as $userId) {
            foreach ($integrationIds as $integrationId) {
                $exists = (new Query())
                    ->from(self::USERS_TABLE)
                    ->where(['userId' => $userId, 'permissionId' => $integrationId])
                    ->exists()
                ;

                if (!$exists) {
                    $this->insert(
                        self::USERS_TABLE,
                        ['userId' => $userId, 'permissionId' => $integrationId]
                    );
                }
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m250729_114837_AddIntegrationPermissionsToExistingUsers cannot be reverted.\n";

        return false;
    }
}
