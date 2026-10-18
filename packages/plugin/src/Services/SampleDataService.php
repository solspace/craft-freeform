<?php

namespace Solspace\Freeform\Services;

use Faker\Factory;

class SampleDataService
{
    // Only scalar, local generators with no required arguments belong in the picker.
    // Never expose provider reflection or evaluate user-supplied Twig to build previews.
    private const GENERATORS = [
        'firstName' => 'First name',
        'lastName' => 'Last name',
        'name' => 'Full name',
        'email' => 'Email address',
        'phoneNumber' => 'Phone number',
        'company' => 'Company name',
        'streetAddress' => 'Street address',
        'city' => 'City',
        'postcode' => 'Postal code',
        'sentence' => 'Sentence',
        'address' => 'Full address',
        'amPm' => 'AM / PM',
        'buildingNumber' => 'Building number',
        'catchPhrase' => 'Company catchphrase',
        'colorName' => 'Color name',
        'companyEmail' => 'Company email address',
        'companySuffix' => 'Company suffix',
        'country' => 'Country',
        'countryCode' => 'Country code',
        'currencyCode' => 'Currency code',
        'date' => 'Date',
        'dayOfMonth' => 'Day of month',
        'dayOfWeek' => 'Day of week',
        'domainName' => 'Domain name',
        'domainWord' => 'Domain word',
        'e164PhoneNumber' => 'International phone number',
        'ean8' => 'EAN-8 barcode',
        'ean13' => 'EAN-13 barcode',
        'firstNameFemale' => 'First name (female)',
        'firstNameMale' => 'First name (male)',
        'freeEmail' => 'Personal email address',
        'hexColor' => 'Hex color',
        'ipv4' => 'IPv4 address',
        'ipv6' => 'IPv6 address',
        'isbn10' => 'ISBN-10',
        'isbn13' => 'ISBN-13',
        'iso8601' => 'ISO date and time',
        'jobTitle' => 'Job title',
        'languageCode' => 'Language code',
        'latitude' => 'Latitude',
        'locale' => 'Locale',
        'longitude' => 'Longitude',
        'macAddress' => 'MAC address',
        'month' => 'Month number',
        'monthName' => 'Month name',
        'numberBetween' => 'Number',
        'paragraph' => 'Paragraph',
        'password' => 'Password',
        'randomDigit' => 'Digit',
        'randomDigitNotNull' => 'Digit (1–9)',
        'randomFloat' => 'Decimal number',
        'randomLetter' => 'Letter',
        'randomNumber' => 'Random number',
        'rgbCssColor' => 'RGB color',
        'safeColorName' => 'Basic color name',
        'safeEmail' => 'Example email address',
        'slug' => 'URL slug',
        'state' => 'State / province',
        'streetName' => 'Street name',
        'suffix' => 'Name suffix',
        'text' => 'Text',
        'time' => 'Time',
        'timezone' => 'Time zone',
        'title' => 'Name title',
        'tld' => 'Top-level domain',
        'unixTime' => 'Unix timestamp',
        'url' => 'Website URL',
        'userName' => 'Username',
        'uuid' => 'UUID',
        'word' => 'Word',
        'year' => 'Year',
    ];

    public function getCatalog(string $locale): array
    {
        $faker = Factory::create(str_replace('-', '_', $locale));
        $catalog = [];
        foreach (self::GENERATORS as $id => $label) {
            try {
                $value = $faker->format($id);
            } catch (\Throwable) {
                // A locale may not implement every generator. Leave unsupported ones out.
                continue;
            }

            if (!\is_scalar($value)) {
                continue;
            }

            $catalog[] = [
                'id' => $id,
                'label' => $label,
                'value' => mb_substr((string) $value, 0, 500),
            ];
        }

        return $catalog;
    }
}
