<?php

namespace Solspace\Freeform\Bundles\Form;

use craft\elements\User;

class FormUserProvider
{
    /** @var array<int, array<int, null|User>> */
    private array $usersBySite = [];

    public function getUser(?int $userId): ?User
    {
        if (!$userId) {
            return null;
        }

        $siteId = \Craft::$app->getSites()->getCurrentSite()->id;
        if (!\array_key_exists($userId, $this->usersBySite[$siteId] ?? [])) {
            $this->usersBySite[$siteId][$userId] = \Craft::$app->getElements()
                ->createElementQuery(User::class)
                ->id($userId)
                ->one()
            ;
        }

        return $this->usersBySite[$siteId][$userId];
    }
}
