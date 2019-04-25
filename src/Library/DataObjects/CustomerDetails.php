<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\DataObjects;

class CustomerDetails
{
    /** @var string */
    private $name;

    /** @var float */
    private $email;

    /** @var string */
    private $phone;

    /** @var AddressDetails */
    private $address;

    /**
     * Creates CustomerDetails instance with properties from provided array
     *
     * @param array $customer
     *
     * @return CustomerDetails
     */
    public static function fromArray(array $customer): CustomerDetails
    {
        $firstName = isset($customer['first_name']) ? $customer['first_name'] : null;
        $lastName  = isset($customer['last_name']) ? $customer['last_name'] : null;
        $name      = isset($customer['name']) ? $customer['name'] : implode(' ', array($firstName, $lastName));

        $email = isset($customer['email']) ? $customer['email'] : null;
        $email = is_array($email) ? $email[0] : $email;
        $phone = isset($customer['phone']) ? $customer['phone'] : null;
        $address = null;

        if (isset($customer['address'])) {
            if (is_a($address, AddressDetails::name)) {
                $address = $customer['address'];
            } elseif (is_array($address)) {
                $addressProps = $customer['address'];
            }
        } else {
            $addressProps = $customer;
        }

        if ($addressProps) {
            $line1      = isset($addressProps['line1']) ? $addressProps['line1'] : null;
            $line2      = isset($addressProps['line2']) ? $addressProps['line2'] : null;
            $city       = isset($addressProps['city']) ? $addressProps['city'] : null;
            $postalCode = isset($addressProps['postal_code']) ? $addressProps['postal_code'] : null;
            $state      = isset($addressProps['state']) ? $addressProps['state'] : null;
            $country    = isset($addressProps['country']) ? $addressProps['country'] :  null;

            //validating if we have any address data at all
            if ($line1 || $line2) {
                $address = new AddressDetails($line1, $line2, $city, $postalCode, $state, $country);
            }
        }

        return new self($name, $email, $phone, $address);
    }

    /**
     * CustomerDetails constructor
     *
     * @param string $name
     * @param string $email
     * @param string $phone
     * @param AddressDetails $address
     */
    public function __construct($name, $email, $phone, $address)
    {
        $this->name    = $name;
        $this->email   = $email;
        $this->phone   = $phone;
        $this->address = $address;
    }

    /**
     * Get the value of name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Get the value of email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Get the value of phone
     *
     * @return string
     */
    public function getPhone()
    {
        return $this->phone;
    }

    /**
     * Get the value of address
     *
     * @return AddressDetails
     */
    public function getAddress()
    {
        return $this->address;
    }
}
