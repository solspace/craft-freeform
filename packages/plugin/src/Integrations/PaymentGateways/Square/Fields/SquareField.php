<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Square\Fields;

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
use Solspace\Freeform\Integrations\PaymentGateways\Square\Square;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\HashHelper;

#[Type(
    name: 'Square Payment',
    typeShorthand: 'square',
    iconPath: __DIR__.'/../icon.svg',
    previewTemplatePath: __DIR__.'/../Templates/square-field-preview.ejs',
)]
class SquareField extends AbstractField implements PaymentFieldInterface
{
    public const AMOUNT_TYPE_FIXED = 'fixed';
    public const AMOUNT_TYPE_DYNAMIC = 'dynamic';

    #[Required]
    #[ValueTransformer(IntegrationTransformer::class)]
    #[Input\ApplicationStateSelect(
        label: 'Integration',
        instructions: 'Select a Square integration to use for this field.',
        emptyOption: 'No integration selected.',
        source: 'integrations',
        optionValue: 'uid',
        optionLabel: 'name',
        filters: [
            'Boolean(enabled)',
            'type === "payment-gateways"',
            'shortName === "Square"',
        ],
    )]
    protected ?Square $integration = null;

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

    #[Section(
        handle: 'redirect',
        label: 'Redirect after payment',
        icon: __DIR__.'/../Icons/redirect.svg',
        order: 3,
    )]
    #[Input\Text(
        label: 'Successful Payment Redirect',
        instructions: 'Enter a URL to redirect to after a successful payment. You can use the `form`, `submission`, and `payment` variables in twig.',
    )]
    protected ?string $redirectSuccess = null;

    #[Section('redirect')]
    #[Input\Text(
        label: 'Failed Payment Redirect',
        instructions: 'Enter a URL to redirect to after a failed payment. You can use the `form` and `payment` variables in twig.',
    )]
    protected ?string $redirectFailed = null;

    public function getIntegration(): ?Square
    {
        return $this->integration;
    }

    public function getType(): string
    {
        return 'square';
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

    public function getRedirectSuccess(): ?string
    {
        return $this->redirectSuccess ?: null;
    }

    public function getRedirectFailed(): ?string
    {
        return $this->redirectFailed ?: null;
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
            ->set('data-freeform-square-token')
            ->set('name', $this->getHandle())
            ->set('type', 'hidden')
            ->set('value', $this->getValue())
        ;

        $config = json_encode([
            'applicationId' => $this->integration?->getApplicationId(),
            'locationId' => $this->integration?->getLocationId(),
            'sandbox' => $this->integration?->isUseSandbox(),
            'integration' => $id,
            'amountField' => $this->amountField?->getHandle(),
            'amountType' => $this->amountType,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'redirectSuccess' => $this->redirectSuccess,
            'redirectFailed' => $this->redirectFailed,
        ]);

        $attributes = (new Attributes())
            ->set('data-freeform-square', true)
            ->set('data-config', $config)
        ;
        $output .= '<div'.$attributes.'>';
        $output .= '<div data-freeform-square-card></div>';
        $output .= '<input'.$inputAttributes.' />';
        $output .= '</div>';

        if (!$this->integration) {
            $output .= '<p class="error" style="color: #cf1124;">No Square integration selected</p>';
        }

        $output .= '</div>';

        return $output;
    }
}
