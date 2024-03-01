<?php

namespace Solspace\Freeform\Bundles\Backup\BatchProcessing;

use craft\elements\db\ElementQuery;

class ElementQueryProcessor implements BatchProcessInterface
{
    public function __construct(private ElementQuery $query) {}

    public function batch(int $size): mixed
    {
        return $this->query->batch($size);
    }

    public function total(): int
    {
        return $this->query->count();
    }
}
