<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Integrations\IntegrationTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Interfaces\TextInterface;
use Solspace\Freeform\Integrations\PaymentGateways\Common\Currency\CurrencyOptionsGenerator;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentFieldInterface;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\HashHelper;

#[Type(
    name: 'PayPal Payment',
    typeShorthand: 'paypal',
    iconPath: __DIR__.'/../icon.svg',
    previewTemplatePath: __DIR__.'/../Templates/paypal-field-preview.ejs',
)]
class PayPalField extends AbstractField implements PaymentFieldInterface
{
    public const AMOUNT_TYPE_FIXED = 'fixed';
    public const AMOUNT_TYPE_DYNAMIC = 'dynamic';
    #[Required]
    #[ValueTransformer(IntegrationTransformer::class)]
    #[Input\ApplicationStateSelect(
        label: 'Integration',
        instructions: 'Select a PayPal integration to use for this field.',
        emptyOption: 'No integration selected.',
        source: 'integrations',
        optionValue: 'uid',
        optionLabel: 'name',
        filters: [
            'Boolean(enabled)',
            'type === "payment-gateways"',
            'shortName === "PayPal"',
        ],
    )]
    protected ?PayPal $integration = null;

    #[Input\TextArea(
        instructions: 'Enter a description for this payment. You can use the `form` object in twig.',
    )]
    protected string $description = 'Payment from "{{ form.name }}" form';

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
        min: 1,
        unsigned: true,
    )]
    protected float $amount = 0;

    #[VisibilityFilter('properties.amountType === "dynamic"')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Payment Amount Field',
        instructions: 'Select a Number/Text/Options field which will determine the amount.',
        emptyOption: 'No field selected',
        implements: [
            NumericInterface::class,
            TextInterface::class,
            OptionsInterface::class,
        ],
    )]
    protected ?FieldInterface $amountField = null;

    #[Input\Select(
        label: 'Payment Currency',
        options: CurrencyOptionsGenerator::class,
    )]
    protected string $currency = 'USD';

    public function getType(): string
    {
        return 'paypal';
    }

    public function getIntegration(): ?PayPal
    {
        return $this->integration;
    }

    public function getDescription(): string
    {
        return $this->description;
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

    protected function getInputHtml(): string
    {
        $id = HashHelper::hash([
            $this->getForm()->getId(),
            $this->integration?->getId() ?? 0,
            $this->getId(),
        ]);

        $output = '<div'.$this->getAttributes()->getInput().'>';

        $inputAttributes = (new Attributes())
            ->set('data-freeform-paypal-order')
            ->set('name', $this->getHandle())
            ->set('type', 'hidden')
            ->set('value', $this->getValue())
        ;
        $output .= '<input'.$inputAttributes.' />';

        $provider = \Craft::$container->get(FormIntegrationsProvider::class);
        $integrations = $provider->getForForm($this->getForm(), PayPal::class);

        $config = json_encode([
            'required' => $this->isRequired(),
            'integration' => $id,
            'clientId' => $this->integration?->getClientId(),
            'sandbox' => $this->integration?->isSandbox(),
            'currency' => $this->getCurrency(),
            'finalizeOnSubmit' => false,
        ]);

        $paypalAttributes = (new Attributes())
            ->set('data-freeform-paypal-buttons', true)
            ->set('data-config', $config)
        ;
        $output .= '<div'.$paypalAttributes.'></div>';

        if (!$this->integration) {
            $output .= '<p class="error" style="color: #cf1124;">No PayPal integration selected</p>';
        }

        $output .= '</div>';

        return $output;
    }
}
