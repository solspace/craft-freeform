<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;

class Layout
{
    public string $uid;
    public RowCollection $rows;
}
