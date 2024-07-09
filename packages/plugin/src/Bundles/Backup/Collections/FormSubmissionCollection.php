<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<FormSubmissions>
 */
class FormSubmissionCollection extends Collection
{
    public function getTotals(): int
    {
        $count = 0;

        /** @var FormSubmissions $item */
        foreach ($this->items as $item) {
            $count += $item->submissionBatchProcessor->total();
        }

        return $count;
    }

    protected static function supports(): array
    {
        return [FormSubmissions::class];
    }
}
