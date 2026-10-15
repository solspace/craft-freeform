<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Phone;

use libphonenumber\PhoneNumberUtil;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class PhoneCountriesOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $phone = PhoneNumberUtil::getInstance();
        $countries = [];
        foreach ($phone->getSupportedRegions() as $code) {
            $countries[$code] = \Locale::getDisplayRegion('-'.$code, \Craft::$app->language).' (+'.$phone->getCountryCodeForRegion($code).')';
        }
        asort($countries);

        return (new OptionCollection())->fromArray($countries);
    }
}
