<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Date;

use Carbon\Carbon;
use Solspace\Freeform\Attributes\Property\TransformerInterface;

class DateTimeTransformer implements TransformerInterface
{
    public function transform($value): ?Carbon
    {
        if (!$value) {
            return null;
        }

        try {
            return new Carbon($value);
        } catch (\Exception) {
            return null;
        }
    }

    public function reverseTransform($value): ?string
    {
        if ($value instanceof Carbon) {
            return $value->toIso8601String();
        }

        if ($value instanceof \DateTime) {
            return $value->format(\DateTime::ATOM);
        }

        if (\is_string($value)) {
            return $value;
        }

        return null;
    }
}
