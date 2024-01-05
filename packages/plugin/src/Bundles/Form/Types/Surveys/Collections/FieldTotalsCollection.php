<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Collections;

use Solspace\Freeform\Bundles\Form\Types\Surveys\DTO\FieldTotals;
use Solspace\Freeform\Library\Collections\Collection;
use Symfony\Component\Serializer\Annotation\Ignore;

/**
 * @extends Collection<FieldTotals>
 */
class FieldTotalsCollection extends Collection implements \JsonSerializable
{
    #[Ignore]
    public function jsonSerialize(): array
    {
        return array_values($this->items);
    }
}
