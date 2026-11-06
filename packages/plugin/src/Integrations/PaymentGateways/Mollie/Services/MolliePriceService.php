<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Common\DynamicAmountService;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;

class MolliePriceService
{
    public function getAmount(Form $form, MollieField $field): int
    {
        $amount = match ($field->getAmountType()) {
            MollieField::AMOUNT_TYPE_DYNAMIC => (new DynamicAmountService())->getAmount($form, $field->getAmountField()),
            default => $field->getAmount(),
        };

        $finalAmount = (int) round($amount * 100);

        if ($finalAmount <= 0) {
            throw new \InvalidArgumentException("Mollie amount must be greater than 0. Current amount: {$amount} (final: {$finalAmount})");
        }

        return $finalAmount;
    }

    public function getFormattedAmount(int $amountInCents, string $currency): string
    {
        return number_format($amountInCents / 100, 2);
    }
}
