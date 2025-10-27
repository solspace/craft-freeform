<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

use Solspace\Freeform\Records\LimitedUsersRecord;

class LimitedUserSettingsProvider
{
    private array $cache = [];

    public function getSettings(?int $id): ?array
    {
        if (!\array_key_exists($id, $this->cache)) {
            if (!$id) {
                $this->cache[$id] = null;

                return null;
            }

            $record = LimitedUsersRecord::findOne(['id' => $id]);
            if (!$record) {
                $this->cache[$id] = null;

                return null;
            }

            $this->cache[$id] = json_decode($record->settings, true);
        }

        return $this->cache[$id];
    }
}
