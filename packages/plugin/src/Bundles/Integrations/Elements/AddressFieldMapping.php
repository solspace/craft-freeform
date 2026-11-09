<?php

namespace Solspace\Freeform\Bundles\Integrations\Elements;

use craft\base\ElementInterface;
use craft\base\FieldInterface;
use craft\elements\db\ElementQuery;
use craft\fields\Addresses;

/**
 * Maps individual inputs to the first address owned by an Addresses field.
 */
class AddressFieldMapping
{
    public const ATTRIBUTES = [
        'title' => 'Label',
        'fullName' => 'Full Name',
        'firstName' => 'First Name',
        'lastName' => 'Last Name',
        'organization' => 'Organization',
        'organizationTaxId' => 'Organization Tax ID',
        'addressLine1' => 'Address Line 1',
        'addressLine2' => 'Address Line 2',
        'addressLine3' => 'Address Line 3',
        'locality' => 'City / Locality',
        'dependentLocality' => 'Dependent Locality',
        'administrativeArea' => 'State / Province',
        'postalCode' => 'Postal Code',
        'sortingCode' => 'Sorting Code',
        'countryCode' => 'Country Code',
        'latitude' => 'Latitude',
        'longitude' => 'Longitude',
    ];

    public static function getMappingFields(FieldInterface $field): array
    {
        if (!$field instanceof Addresses) {
            return [[
                'id' => $field->handle,
                'label' => $field->name,
                'required' => $field->required,
            ]];
        }

        $fields = [];
        foreach (self::ATTRIBUTES as $attribute => $label) {
            $fields[] = [
                'id' => $field->handle.'.'.$attribute,
                'label' => $field->name.' — '.\Craft::t('freeform', $label),
                // Craft validates required components according to the selected country.
                'required' => false,
            ];
        }

        return $fields;
    }

    public static function getAttribute(FieldInterface $field, string $source): ?string
    {
        if (!$field instanceof Addresses || !str_starts_with($source, $field->handle.'.')) {
            return null;
        }

        $attribute = substr($source, \strlen($field->handle) + 1);

        return isset(self::ATTRIBUTES[$attribute]) ? $attribute : null;
    }

    public static function getAddresses(ElementInterface $element, Addresses $field): array
    {
        $value = $element->getFieldValue($field->handle);
        if ($value instanceof ElementQuery) {
            return $value->getCachedResult() ?? (clone $value)->status(null)->limit(null)->all();
        }

        return $value->all();
    }

    public static function apply(ElementInterface $element, Addresses $field, array $attributes): void
    {
        $addresses = self::getAddresses($element, $field);
        // An optional, entirely empty address must not create an invalid nested element.
        if (!$addresses && !array_filter($attributes, static fn ($value) => null !== $value && '' !== trim((string) $value))) {
            return;
        }

        $value = $element->getFieldValue($field->handle);
        if ($value instanceof ElementQuery) {
            $value = clone $value;
            $value->setCachedResult($addresses);
        }
        $serialized = $field->serializeValue($value, $element);
        // Craft's serializer omits coordinates. Preserve them on all existing addresses.
        $new = 0;
        foreach ($addresses as $address) {
            $key = $address->id ?? 'new'.++$new;
            $serialized[$key]['latitude'] = $address->latitude;
            $serialized[$key]['longitude'] = $address->longitude;
        }
        $key = array_key_first($serialized) ?? 'new1';
        if (!$addresses && !\array_key_exists('title', $attributes)) {
            $attributes['title'] = $field->name;
        }
        if (isset($attributes['countryCode'])) {
            $attributes['countryCode'] = strtoupper(trim($attributes['countryCode']));
        }

        // Let Craft create/validate/save nested addresses along with their owner.
        $serialized[$key] = array_replace($serialized[$key] ?? [], $attributes);
        $element->setFieldValue($field->handle, $serialized);

        // Match Craft's native name handling, including clearing a previously saved name.
        $names = array_intersect_key($attributes, array_flip(['fullName', 'firstName', 'lastName']));
        if ($names) {
            $addresses = self::getAddresses($element, $field);
            $addresses[0]->setAttributes(array_map(static fn ($value) => '' === trim((string) $value) ? null : $value, $names), false);
        }
    }
}
