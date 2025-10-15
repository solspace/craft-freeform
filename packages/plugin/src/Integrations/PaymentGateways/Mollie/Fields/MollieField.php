<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Integrations\IntegrationTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Interfaces\TextInterface;
use Solspace\Freeform\Integrations\PaymentGateways\Common\Currency\CurrencyOptionsGenerator;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentFieldInterface;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\HashHelper;

#[Type(
    name: 'Mollie',
    typeShorthand: 'mollie',
    iconPath: __DIR__.'/../icon.svg',
    previewTemplatePath: __DIR__.'/../Templates/mollie-field-preview.ejs',
)]
class MollieField extends HiddenField implements PaymentFieldInterface
{
    public const AMOUNT_TYPE_FIXED = 'fixed';
    public const AMOUNT_TYPE_DYNAMIC = 'dynamic';

    #[Required]
    #[ValueTransformer(IntegrationTransformer::class)]
    #[Input\ApplicationStateSelect(
        label: 'Integration',
        instructions: 'Select a Mollie integration to use for this field.',
        emptyOption: 'No integration selected.',
        source: 'integrations',
        optionValue: 'uid',
        optionLabel: 'name',
        filters: [
            'Boolean(enabled)',
            'type === "payment-gateways"',
            'shortName === "Mollie"',
        ],
    )]
    protected ?Mollie $integration = null;

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
    protected string $currency = 'EUR';

    #[Input\Text(
        label: 'Successful Redirect URL',
        instructions: 'Optional. URL to redirect to after successful Mollie checkout. Falls back to form Return URL.',
        placeholder: 'https://example.com/thank-you',
    )]
    protected string $redirectUrl = '';

    public function getIntegration(): ?Mollie
    {
        return $this->integration;
    }

    public function getDescription(): string
    {
        return $this->getTranslationTable()->get('description', $this->description);
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

    public function getRedirectUrl(): ?string
    {
        return $this->redirectUrl ?: null;
    }

    public function getType(): string
    {
        return 'mollie';
    }

    public function getInputHtml(): string
    {
        $id = HashHelper::hash([
            $this->getForm()->getId(),
            $this->integration?->getId() ?? 0,
            $this->getId(),
        ]);
        $config = json_encode([
            'required' => $this->isRequired(),
            'integration' => $id,
            'currency' => $this->getCurrency(),
            'description' => $this->getDescription(),
            'redirectUrl' => $this->getRedirectUrl(),
            'webhookUrl' => $this->integration?->getWebhookUrl() ?? '',
        ]);

        $inputAttributes = (new Attributes())
            ->set('data-freeform-mollie')
            ->set('data-mollie-config', $config)
            ->set('name', $this->getHandle())
            ->set('type', 'hidden')
            ->set('value', $this->getValue())
        ;

        return '<input'.$inputAttributes.' />';
    }
}
