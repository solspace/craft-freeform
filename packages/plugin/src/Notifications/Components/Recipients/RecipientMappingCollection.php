<?php

namespace Solspace\Freeform\Notifications\Components\Recipients;

use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<RecipientMapping>
 */
class RecipientMappingCollection extends Collection
{
    public function getMappingByValue(mixed $value): ?RecipientMapping
    {
        foreach ($this->items as $item) {
            if ($value == $item->getValue()) {
                return $item;
            }
        }

        return null;
    }
}
