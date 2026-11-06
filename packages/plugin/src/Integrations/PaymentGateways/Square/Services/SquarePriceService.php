<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Square\Services;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Common\DynamicAmountService;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Fields\SquareField;

class SquarePriceService
{
    public function getAmount(Form $form, SquareField $field): int
    {
        $amount = match ($field->getAmountType()) {
            SquareField::AMOUNT_TYPE_DYNAMIC => (new DynamicAmountService())->getAmount($form, $field->getAmountField()),
            default => $field->getAmount(),
        };

        $finalAmount = (int) round($amount * 100);

        if ($finalAmount <= 0) {
            throw new \InvalidArgumentException("Square amount must be greater than 0. Current amount: {$amount} (final: {$finalAmount})");
        }

        return $finalAmount;
    }

    public function getFormattedAmount(int $amountInCents, string $currency): string
    {
        return number_format($amountInCents / 100, 2);
    }
}
