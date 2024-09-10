<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Form;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Form>
 */
class FormCollection extends Collection
{
    public function getByUid(mixed $key, mixed $defaultValue = null): mixed
    {
        foreach ($this->items as $form) {
            if ($form->uid === $key) {
                return $form;
            }
        }

        return null;
    }

    protected static function supports(): array
    {
        return [Form::class];
    }
}
