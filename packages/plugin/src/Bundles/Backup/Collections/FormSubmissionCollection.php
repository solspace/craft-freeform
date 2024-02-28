<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Library\Collections\Collection;

class FormSubmissionCollection extends Collection
{
    protected static function supports(): array
    {
        return [FormSubmissions::class];
    }
}
