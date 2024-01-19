<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Integrations\IntegrationTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Interfaces\TextInterface;
use Solspace\Freeform\Integrations\PaymentGateways\Common\Currency\CurrencyOptionsGenerator;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentFieldInterface;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

#[Type(
    name: 'Stripe Payment',
    typeShorthand: 'stripe',
    iconPath: __DIR__.'/../icon.svg',
    previewTemplatePath: __DIR__.'/../Templates/stripe-field-preview.ejs',
)]
class StripeField extends AbstractField implements PaymentFieldInterface
{
    public const PAYMENT_TYPE_SINGLE = 'single';
    public const PAYMENT_TYPE_SUBSCRIPTION = 'subscription';

    public const PAYMENT_INTERVAL_TYPE_STATIC = 'static';
    public const PAYMENT_INTERVAL_TYPE_DYNAMIC = 'dynamic';

    public const AMOUNT_TYPE_FIXED = 'fixed';
    public const AMOUNT_TYPE_DYNAMIC = 'dynamic';

    public const DEFAULT_PRODUCT_NAME = 'Freeform: {{ form.name }}';

    #[Required]
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

    #[VisibilityFilter('properties.paymentType === "subscription"')]
    #[Input\Text(
        label: 'Subscription Product Name',
        instructions: 'Enter the name of the product you want to subscribe to. You can use the `form` and `integration` objects in twig.',
        placeholder: self::DEFAULT_PRODUCT_NAME,
    )]
    protected string $productName = '';

    #[VisibilityFilter('properties.paymentType === "subscription"')]
    #[Input\ButtonGroup(
        label: 'Subscription Interval Type',
        options: [
            self::PAYMENT_INTERVAL_TYPE_STATIC => 'Static',
            self::PAYMENT_INTERVAL_TYPE_DYNAMIC => 'Dynamic',
        ],
    )]
    protected string $intervalType = self::PAYMENT_INTERVAL_TYPE_STATIC;

    #[VisibilityFilter('properties.paymentType === "subscription"')]
    #[VisibilityFilter('properties.intervalType === "static"')]
    #[Input\Select(
        label: 'Subscription Interval',
        options: [
            'day' => 'Day',
            'week' => 'Week',
            'month' => 'Month',
            'year' => 'Year',
        ],
    )]
    protected string $interval = 'month';

    #[VisibilityFilter('properties.paymentType === "subscription"')]
    #[VisibilityFilter('properties.intervalType === "dynamic"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Subscription Interval Field',
        instructions: 'Select a field which will determine the interval. (Available values: `year`, `month`, `week`, `day`)',
        emptyOption: 'No field selected',
    )]
    protected ?FieldInterface $intervalField = null;

    #[VisibilityFilter('properties.paymentType === "subscription"')]
    #[Input\ButtonGroup(
        label: 'Subscription Interval Count Type',
        options: [
            self::PAYMENT_INTERVAL_TYPE_STATIC => 'Static',
            self::PAYMENT_INTERVAL_TYPE_DYNAMIC => 'Dynamic',
        ],
    )]
    protected string $intervalCountType = self::PAYMENT_INTERVAL_TYPE_STATIC;

    #[VisibilityFilter('properties.paymentType === "subscription"')]
    #[VisibilityFilter('properties.intervalCountType === "static"')]
    #[Input\Integer(
        label: 'Interval Count',
        instructions: 'Enter the number of intervals between each subscription payment. If using interval `month` and count `3`, the subscription will be charged every 3 months.',
        unsigned: true,
    )]
    protected int $intervalCount = 1;

    #[VisibilityFilter('properties.paymentType === "subscription"')]
    #[VisibilityFilter('properties.intervalCountType === "dynamic"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Subscription Interval Count Field',
        instructions: 'Select a field which will determine the interval count.',
        emptyOption: 'No field selected',
        implements: [NumericInterface::class],
    )]
    protected ?FieldInterface $intervalCountField = null;

    #[Section(
        handle: 'payment-amount',
        label: 'Payment Amount',
        icon: __DIR__.'/Icons/money.svg',
        order: 2,
    )]
    #[Input\ButtonGroup(
        label: 'Payment Amount Type',
        options: [
            self::AMOUNT_TYPE_FIXED => 'Fixed',
            self::AMOUNT_TYPE_DYNAMIC => 'Dynamic',
        ],
    )]
    protected string $amountType = self::AMOUNT_TYPE_FIXED;

    #[Section('payment-amount')]
    #[VisibilityFilter('properties.amountType === "fixed"')]
    #[Input\Integer(
        label: 'Payment Amount',
        instructions: 'Enter the amount you want to charge for this payment.',
        min: 1,
        unsigned: true,
    )]
    protected float $amount = 0;

    #[Section('payment-amount')]
    #[VisibilityFilter('properties.amountType === "dynamic"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Payment Amount Field',
        instructions: 'Select a Number field which will determine the payment amount.',
        emptyOption: 'No field selected',
        implements: [
            NumericInterface::class,
            TextInterface::class,
            OptionsInterface::class,
        ],
    )]
    protected ?FieldInterface $amountField = null;

    #[Section('payment-amount')]
    #[Input\Select(
        label: 'Payment Currency',
        options: CurrencyOptionsGenerator::class,
    )]
    protected string $currency = 'USD';

    #[Section(
        handle: 'redirect',
        label: 'Redirect after payment',
        icon: __DIR__.'/Icons/redirect.svg',
        order: 3,
    )]
    #[Input\Text(
        label: 'Successful Payment Redirect',
        instructions: 'Enter a URL to redirect to after a successful payment. You can use the `form`, `submission` and `paymentIntent` objects in twig.',
    )]
    protected string $redirectSuccess = '';

    #[Section('redirect')]
    #[Input\Text(
        label: 'Failed Payment Redirect',
        instructions: 'Enter a URL to redirect to after a failed payment. You can use the `form` and `paymentIntent` objects in twig.',
    )]
    protected string $redirectFailed = '';

    #[Section(
        handle: 'appearance',
        label: 'Appearance',
        icon: __DIR__.'/Icons/appearance.svg',
        order: 4,
    )]
    #[Input\Select(
        instructions: 'Choose the base theme to be used for styling the appearance of the Stripe field. Styles can be further fine-tuned at template-level using JS overrides.',
        options: [
            'default' => 'Default',
            'night' => 'Dark',
            'flat' => 'Minimal',
        ],
    )]
    protected string $theme = 'default';

    #[Section('appearance')]
    #[Input\Select(
        instructions: 'Choose the layout for the Stripe field.',
        options: [
            'tabs' => 'Tabs',
            'accordion-radios' => 'Accordion with radio buttons',
            'accordion' => 'Accordion without radio buttons',
        ],
    )]
    protected string $layout = 'tabs';

    #[Section('appearance')]
    #[Input\Boolean]
    protected bool $floatingLabels = false;

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

    public function getProductName(): string
    {
        return $this->productName ?: self::DEFAULT_PRODUCT_NAME;
    }

    public function getIntervalType(): string
    {
        return $this->intervalType ?: self::PAYMENT_INTERVAL_TYPE_STATIC;
    }

    public function getInterval(): string
    {
        return $this->interval;
    }

    public function getIntervalField(): ?FieldInterface
    {
        return $this->intervalField;
    }

    public function getIntervalCountType(): string
    {
        return $this->intervalCountType ?: self::PAYMENT_INTERVAL_TYPE_STATIC;
    }

    public function getIntervalCount(): int
    {
        return $this->intervalCount;
    }

    public function getIntervalCountField(): ?FieldInterface
    {
        return $this->intervalCountField;
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

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function getRedirectSuccess(): string
    {
        return $this->redirectSuccess;
    }

    public function getRedirectFailed(): string
    {
        return $this->redirectFailed;
    }

    public function getTheme(): string
    {
        return $this->theme;
    }

    public function getLayout(): string
    {
        return $this->layout;
    }

    public function isFloatingLabels(): bool
    {
        return $this->floatingLabels;
    }

    protected function getInputHtml(): string
    {
        $id = HashHelper::hash([
            $this->getForm()->getId(),
            $this->integration?->getId() ?? 0,
            $this->getId(),
        ]);

        $output = '<div'.$this->getAttributes()->getInput().'>';

        $inputAttributes = (new Attributes())
            ->set('name', $this->getHandle())
            ->set('type', 'hidden')
            ->set('value', $this->getValue())
        ;
        $output .= '<input'.$inputAttributes.' />';

        $amountFields = array_filter([
            $this->amountField?->getHandle() ?? false,
            $this->intervalField?->getHandle() ?? false,
            $this->intervalCountField?->getHandle() ?? false,
        ]);

        $stripeAttributes = (new Attributes())
            ->set('class', 'freeform-stripe-card')
            ->set('data-required', $this->isRequired())
            ->set('data-integration', $id)
            ->set('data-amount-fields', !empty($amountFields) ? implode(';', $amountFields) : false)
            ->set('data-layout', $this->getLayout())
            ->set('data-theme', $this->getTheme())
            ->set('data-floating-labels', $this->isFloatingLabels())
        ;
        $output .= '<div'.$stripeAttributes.'></div>';

        if (!$this->integration) {
            $output .= '<p class="error" style="color: #cf1124;">No Stripe integration selected</p>';
        }

        $output .= '</div>';

        return $output;
    }
}
