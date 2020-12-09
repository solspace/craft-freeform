<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m200616_143808_FormPermissionsUpdate migration.
 */
class m200616_143808_FormPermissionsUpdate extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $permissions = (new Query())
            ->select('id, name')
            ->from('{{%userpermissions}}')
            ->where(['name' => ['freeform-formscreate', 'freeform-formsdelete', 'freeform-formsmanage']])
            ->all()
        ;

        $create = $delete = $manage = null;
        foreach ($permissions as $permission) {
            if ('freeform-formscreate' === $permission['name']) {
                $create = $permission['id'];
            }
            if ('freeform-formsdelete' === $permission['name']) {
                $delete = $permission['id'];
            }
            if ('freeform-formsmanage' === $permission['name']) {
                $manage = $permission['id'];
            }
        }

        if (!$create) {
            $this->insert('{{%userpermissions}}', ['name' => 'freeform-formscreate']);
            $create = $this->db->getLastInsertID();
        }

        if (!$delete) {
            $this->insert('{{%userpermissions}}', ['name' => 'freeform-formsdelete']);
            $delete = $this->db->getLastInsertID();
        }

        $groups = (new Query())
            ->select('groupId')
            ->from('{{%userpermissions_usergroups}}')
            ->where(['permissionId' => $manage])
            ->column()
        ;

        foreach ($groups as $groupId) {
            $this->insert('{{%userpermissions_usergroups}}', ['groupId' => $groupId, 'permissionId' => $create]);
            $this->insert('{{%userpermissions_usergroups}}', ['groupId' => $groupId, 'permissionId' => $delete]);
        }

        $users = (new Query())
            ->select('userId')
            ->from('{{%userpermissions_users}}')
            ->where(['permissionId' => $manage])
            ->column()
        ;

        foreach ($users as $userId) {
            $this->insert('{{%userpermissions_users}}', ['userId' => $userId, 'permissionId' => $create]);
            $this->insert('{{%userpermissions_users}}', ['userId' => $userId, 'permissionId' => $delete]);
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m200616_143808_FormPermissionsUpdate cannot be reverted.\n";

        return false;
    }
}
