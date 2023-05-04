<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionFetcherInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Services\StatusesService;

class FormStatusOptions implements OptionFetcherInterface
{
    public function __construct(private StatusesService $statusesService)
    {
    }

    public function fetchOptions(Property $property): OptionCollection
    {
        $collection = new OptionCollection();
        $statuses = $this->statusesService->getAllStatuses();
        foreach ($statuses as $status) {
            $collection->add($status->id, $status->name);
        }

        return $collection;
    }
}
