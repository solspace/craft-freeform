<?php

namespace Solspace\Freeform\Library\Integrations\Types\MailingLists;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Services\Integrations\MailingListsService;

class MailingListTransformer implements TransformerInterface
{
    public function __construct(
        private MailingListsService $mailingListsService
    ) {
    }

    public function transform($value): ?ListObject
    {
        return $this->mailingListsService->getListObjectById((int) $value);
    }

    public function reverseTransform($value): mixed
    {
        if ($value instanceof ListObject) {
            return $value->getId();
        }

        return $value;
    }
}
