<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Form;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Form>
 */
class FormCollection extends Collection
{
    protected static function supports(): array
    {
        return [Form::class];
    }
}
