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

        $settings = $this->cache[$id];
        $date = $settings['props.date'] ?? null;
        if (\is_array($date) && !\in_array('picker', $date, true)
            && \in_array('datepicker', $date, true) && \in_array('nativeTypes', $date, true)) {
            // The new picker selector replaces both legacy controls. Require both
            // permissions so upgrading never grants access to a restricted mode.
            $settings['props.date'][] = 'picker';
            $settings['props.date'][] = 'minuteStep';
        }

        return $settings;
    }
}
