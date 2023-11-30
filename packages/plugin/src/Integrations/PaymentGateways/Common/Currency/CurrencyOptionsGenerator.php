<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Common\Currency;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class CurrencyOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        static $countries;
        if (null === $countries) {
            $countries = json_decode(file_get_contents(__DIR__.'/currencies.json'), true);
        }

        $collection = new OptionCollection();
        foreach ($countries as $code => $data) {
            $collection->add($code, $code);
        }

        return $collection;
    }
}
