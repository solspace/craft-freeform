<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Library\Attributes\Attributes;

trait BrowserAutofillTrait
{
    #[Section('general')]
    #[Input\Select(
        label: 'Browser Autofill',
        instructions: 'Tell browsers what information this field collects so they can offer saved details.',
        order: 55,
        emptyOption: 'Use browser default',
        options: [
            'on' => 'On',
            'off' => 'Off',
            'name' => 'Full name',
            'given-name' => 'Given name',
            'family-name' => 'Family name',
            'nickname' => 'Nickname',
            'email' => 'Email address',
            'tel' => 'Phone number',
            'organization' => 'Organization',
            'organization-title' => 'Job title',
            'street-address' => 'Street address',
            'address-line1' => 'Address line 1',
            'address-line2' => 'Address line 2',
            'address-level2' => 'City',
            'address-level1' => 'State or province',
            'postal-code' => 'Postal code',
            'country-name' => 'Country name',
            'url' => 'Website URL',
            'username' => 'Username',
            'current-password' => 'Current password',
            'new-password' => 'New password',
        ],
    )]
    protected string $browserAutofill = '';

    public function getBrowserAutofill(): string
    {
        return $this->browserAutofill;
    }

    protected function addBrowserAutofillAttribute(Attributes $attributes): void
    {
        if ('' !== $this->browserAutofill) {
            $attributes->setIfEmpty('autocomplete', $this->browserAutofill);
        }
    }
}
