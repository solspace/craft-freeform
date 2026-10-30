<?php

namespace Solspace\Freeform\Library\Helpers;

use CommerceGuys\Addressing\Country\CountryRepository;
use CommerceGuys\Addressing\Subdivision\SubdivisionRepository;

class LocationMappingHelper
{
    public static function countryCode(string $value): string
    {
        if ('' === trim($value)) {
            return '';
        }

        static $repository;
        $repository ??= new CountryRepository();
        foreach (array_unique([\Craft::$app->language ?? 'en', 'en']) as $locale) {
            foreach ($repository->getList($locale) as $code => $name) {
                if (self::matches($value, [$code, $name])) {
                    return $code;
                }
            }
        }

        return '';
    }

    public static function stateCode(string $value, string $country): string
    {
        $countryCode = self::countryCode($country);
        if ('' === trim($value) || '' === $countryCode) {
            return '';
        }

        static $repository;
        $repository ??= new SubdivisionRepository();
        foreach ($repository->getAll([$countryCode]) as $subdivision) {
            if (self::matches($value, [$subdivision->getId(), $subdivision->getCode(), $subdivision->getName(), $subdivision->getLocalCode(), $subdivision->getLocalName()])) {
                // Craft uses the addressing repository's subdivision codes.
                return $subdivision->getCode();
            }
        }

        return '';
    }

    private static function matches(string $value, array $candidates): bool
    {
        $value = mb_strtolower(trim($value));
        foreach ($candidates as $candidate) {
            if (null !== $candidate && $value === mb_strtolower(trim($candidate))) {
                return true;
            }
        }

        return false;
    }
}
