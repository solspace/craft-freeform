<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Integrations\IntegrationTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;
use Solspace\Freeform\Integrations\PaymentGateways\Common\Currency\CurrencyOptionsGenerator;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentFieldInterface;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

#[Type(
    name: 'Stripe Payment',
    typeShorthand: 'stripe',
    iconPath: __DIR__.'/../icon.svg',
)]
class StripeField extends AbstractField implements PaymentFieldInterface
{
    public const PAYMENT_TYPE_SINGLE = 'single';
    public const PAYMENT_TYPE_SUBSCRIPTION = 'subscription';

    public const AMOUNT_TYPE_FIXED = 'fixed';
    public const AMOUNT_TYPE_DYNAMIC = 'dynamic';

    public const CURRENCY_TYPE_FIXED = 'fixed';
    public const CURRENCY_TYPE_DYNAMIC = 'dynamic';

    #[ValueTransformer(IntegrationTransformer::class)]
    #[Input\ApplicationStateSelect(
        label: 'Integration',
        instructions: 'Select a Stripe integration to use for this field.',
        emptyOption: 'No integration selected.',
        source: 'integrations',
        optionValue: 'uid',
        optionLabel: 'name',
        filters: [
            'Boolean(enabled)',
            'type === "payment-gateways"',
            'shortName === "Stripe"',
        ],
    )]
    protected ?IntegrationInterface $integration = null;

    #[Input\TextArea(
        instructions: 'Enter a description for this payment. You can use the `form` object in twig.',
    )]
    protected string $description = 'Payment from "{{ form.name }}" form';

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
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Payment Amount Field',
        instructions: 'Select a Number field which will determine the payment amount.',
        emptyOption: 'No field selected',
        implements: [NumericInterface::class],
    )]
    protected ?FieldInterface $amountField = null;

    #[Input\ButtonGroup(
        label: 'Currency Type',
        options: [
            self::CURRENCY_TYPE_FIXED => 'Fixed',
            self::CURRENCY_TYPE_DYNAMIC => 'Dynamic',
        ],
    )]
    protected string $currencyType = self::CURRENCY_TYPE_FIXED;

    #[VisibilityFilter('properties.currencyType === "fixed"')]
    #[Input\Select(
        label: 'Payment Currency',
        options: CurrencyOptionsGenerator::class,
    )]
    protected string $currency = 'USD';

    #[VisibilityFilter('properties.currencyType === "dynamic"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Payment Currency Field',
        instructions: 'Select a field which will determine the payment currency.',
        emptyOption: 'No field selected',
    )]
    protected ?FieldInterface $currencyField = null;

    public function getType(): string
    {
        return 'stripe';
    }

    public function getIntegration(): ?IntegrationInterface
    {
        return $this->integration;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getPaymentType(): string
    {
        return $this->paymentType;
    }

    public function getAmountType(): string
    {
        return $this->amountType;
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getAmountField(): ?FieldInterface
    {
        return $this->amountField;
    }

    public function getCurrencyType(): string
    {
        return $this->currencyType;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function getCurrencyField(): ?FieldInterface
    {
        return $this->currencyField;
    }

    protected function getInputHtml(): string
    {
        $id = Stripe::getHashids()->encode(
            $this->getForm()->getId(),
            $this->integration?->getId() ?? 0,
            $this->getId()
        );

        $output = '<div'.$this->getAttributes()->getInput().'>';

        $inputAttributes = (new Attributes())
            ->set('name', $this->getHandle())
            ->set('type', 'hidden')
            ->set('value', $this->getValue())
        ;
        $output .= '<input'.$inputAttributes.' />';

        $stripeAttributes = (new Attributes())
            ->set('class', 'freeform-stripe-card')
            ->set('data-integration', $id)
        ;
        $output .= '<div'.$stripeAttributes.'></div>';

        if (!$this->integration) {
            $output .= '<p class="error" style="color: #cf1124;">No Stripe integration selected</p>';
        }

        $output .= '</div>';

        return $output;
    }
}
