<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;

#[Type(
    name: 'Stripe Payment',
    typeShorthand: 'stripe',
    iconPath: __DIR__.'/../icon.svg',
)]
class StripeField extends AbstractField implements NoStorageInterface
{
    public const PAYMENT_TYPE_SINGLE = 'single';
    public const PAYMENT_TYPE_SUBSCRIPTION = 'subscription';

    public const AMOUNT_TYPE_FIXED = 'fixed';
    public const AMOUNT_TYPE_DYNAMIC = 'dynamic';

    #[Required]
    #[Input\ButtonGroup(
        options: [
            self::PAYMENT_TYPE_SINGLE => 'Single',
            self::PAYMENT_TYPE_SUBSCRIPTION => 'Subscription',
        ],
    )]
    protected string $paymentType = self::PAYMENT_TYPE_SINGLE;

    #[Input\ButtonGroup(
        label: 'Payment Amount Type',
        options: [
            self::AMOUNT_TYPE_FIXED => 'Fixed',
            self::AMOUNT_TYPE_DYNAMIC => 'Dynamic',
        ],
    )]
    protected string $amountType = self::AMOUNT_TYPE_FIXED;

    #[VisibilityFilter('properties.amountType === "fixed"')]
    #[Input\Integer(
        label: 'Payment Amount',
        instructions: 'Enter the amount you want to charge for this payment.',
        step: 0.01,
        unsigned: true,
    )]
    protected float $amount = 0;

    #[VisibilityFilter('properties.amountType === "dynamic"')]
    #[Input\Field(
        label: 'Payment Amount Field',
        instructions: 'Select a Number field which will determine the payment amount.',
        emptyOption: 'No field selected',
        implements: [NumericInterface::class],
    )]
    protected ?FieldInterface $amountField = null;

    public function getType(): string
    {
        return 'stripe';
    }

    protected function getInputHtml(): string
    {
        return '<div class="stripe-field" data-id="'.$this->getId().'">stripe</div>';
    }
}
