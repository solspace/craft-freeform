<?php
/**
 * Freeform for Craft.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see          https:   //solspace.com/craft/freeform
 *
 * @license       https:   //solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Properties;

class PaymentProperties extends IntegrationProperties
{
    const PAYMENT_TYPE_SINGLE = 'single';
    const PAYMENT_TYPE_PREDEFINED_SUBSCRIPTION = 'predefined_subscription';
    const PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION = 'dynamic_subscription';

    const PLAN_INTERVAL_DAILY = 'daily';
    const PLAN_INTERVAL_WEEKLY = 'weekly';
    const PLAN_INTERVAL_BIWEEKLY = 'biweekly';
    const PLAN_INTERVAL_MONTHLY = 'monthly';
    const PLAN_INTERVAL_ANNUALLY = 'annually';

    const NOTIFICATION_TYPE_CHARGE_SUCCEEDED = 'charge_success';
    const NOTIFICATION_TYPE_CHARGE_FAILED = 'charge_failed';
    const NOTIFICATION_TYPE_SUBSCRIPTION_CREATED = 'subscription_created';
    const NOTIFICATION_TYPE_SUBSCRIPTION_ENDED = 'subscription_ended';
    const NOTIFICATION_TYPE_SUBSCRIPTION_PAYMENT_SUCCEEDED = 'subscription_payment_succeeded';
    const NOTIFICATION_TYPE_SUBSCRIPTION_PAYMENT_FAILED = 'subscription_payment_failed';

    const FIELD_PAYMENT_TYPE = 'paymentType';
    const FIELD_AMOUNT = 'amount';
    const FIELD_CURRENCY = 'currency';
    const FIELD_PLAN = 'plan';
    const FIELD_INTERVAL = 'interval';
    const FIELD_DESCRIPTION = 'description';
    const FIELD_PAYMENT_NOTIFICATIONS = 'paymentNotifications';
    const FIELD_PAYMENT_FIELD_MAPPING = 'paymentFieldMapping';
    const FIELD_CUSTOMER_FIELD_MAPPING = 'customerFieldMapping';

    /** @var string */
    protected $paymentType;

    /** @var float */
    protected $amount;

    /** @var string */
    protected $currency = 'USD';

    /** @var string */
    protected $interval = self::PLAN_INTERVAL_MONTHLY;

    /** @var string */
    protected $description;

    /** @var string */
    protected $plan = '';

    /** @var array */
    protected $paymentNotifications = [];

    /** @var array */
    protected $paymentFieldMapping;

    /** @var array */
    protected $customerFieldMapping;

    /**
     * @return string
     */
    public function getCurrency()
    {
        return $this->currency;
    }

    /**
     * @return float
     */
    public function getAmount()
    {
        return $this->amount;
    }

    /**
     * @return string
     */
    public function getPlan()
    {
        return $this->plan;
    }

    /**
     * @return string
     */
    public function getPaymentType()
    {
        return $this->paymentType;
    }

    /**
     * @return string
     */
    public function getInterval()
    {
        return $this->interval;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    public function getPaymentNotifications(): array
    {
        return $this->paymentNotifications;
    }

    /**
     * @return array
     */
    public function getPaymentFieldMapping()
    {
        return $this->paymentFieldMapping;
    }

    /**
     * @return array
     */
    public function getCustomerFieldMapping()
    {
        return $this->customerFieldMapping;
    }

    /**
     * {@inheritDoc}
     */
    protected function getPropertyManifest(): array
    {
        $props = parent::getPropertyManifest();

        $props[self::FIELD_CURRENCY] = self::TYPE_STRING;
        $props[self::FIELD_AMOUNT] = self::TYPE_DOUBLE;
        $props[self::FIELD_PLAN] = self::TYPE_STRING;
        $props[self::FIELD_PAYMENT_TYPE] = self::TYPE_STRING;
        $props[self::FIELD_INTERVAL] = self::TYPE_STRING;
        $props[self::FIELD_DESCRIPTION] = self::TYPE_STRING;
        $props[self::FIELD_PAYMENT_NOTIFICATIONS] = self::TYPE_ARRAY;
        $props[self::FIELD_PAYMENT_FIELD_MAPPING] = self::TYPE_ARRAY;
        $props[self::FIELD_CUSTOMER_FIELD_MAPPING] = self::TYPE_ARRAY;

        return $props;
    }
}
