<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;

class Row
{
    public string $uid;
    public FieldCollection $fields;
}
