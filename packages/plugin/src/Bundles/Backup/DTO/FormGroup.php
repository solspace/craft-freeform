<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\FormGroupEntriesCollection;

class FormGroup
{
    public string $uid;
    public string $siteId;
    public string $label;
    public int $order;

    public FormGroupEntriesCollection $entries;
}
