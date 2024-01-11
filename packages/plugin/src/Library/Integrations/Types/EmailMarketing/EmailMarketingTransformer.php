<?php

namespace Solspace\Freeform\Library\Integrations\Types\EmailMarketing;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\DataObjects\ListObject;
use Solspace\Freeform\Services\Integrations\EmailMarketingService;

class EmailMarketingTransformer implements TransformerInterface
{
    public function __construct(
        private EmailMarketingService $emailMarketingService
    ) {}

    public function transform($value): ?ListObject
    {
        return $this->emailMarketingService->getListObjectById((int) $value);
    }

    public function reverseTransform($value): mixed
    {
        if ($value instanceof ListObject) {
            return $value->getId();
        }

        return $value;
    }
}
