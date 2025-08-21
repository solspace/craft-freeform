<?php

namespace Solspace\Freeform\Fields\Properties\Cards;

use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Card>
 */
class CardCollection extends Collection
{
    protected static function supports(): array
    {
        return [Card::class];
    }
}
