<?php

namespace Solspace\Freeform\Library\Helpers;

class OverviewCardHelper
{
    public static function groupByAccess(array $cards, EditionHelper $edition): array
    {
        $groups = ['cards' => [], 'permissionCards' => [], 'editionCards' => []];

        foreach ($cards as $card) {
            if (isset($card['edition']) && $edition->isBelow($card['edition'])) {
                $groups['editionCards'][] = $card;
            } elseif ($card['canAccess']) {
                $groups['cards'][] = $card;
            } else {
                $groups['permissionCards'][] = $card;
            }
        }

        return $groups;
    }
}
