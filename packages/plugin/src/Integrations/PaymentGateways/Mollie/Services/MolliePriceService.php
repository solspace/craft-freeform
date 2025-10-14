<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;

class MolliePriceService
{
    public function getAmount(Form $form, MollieField $field): int
    {
        $amount = match ($field->getAmountType()) {
            MollieField::AMOUNT_TYPE_DYNAMIC => $this->getDynamicAmount($field),
            default => $field->getAmount(),
        };

        $finalAmount = (int) round($amount * 100);

        if ($finalAmount <= 0) {
            throw new \Exception("Mollie amount must be greater than 0. Current amount: {$amount} (final: {$finalAmount})");
        }

        return $finalAmount;
    }

    public function getFormattedAmount(int $amountInCents, string $currency): string
    {
        return number_format($amountInCents / 100, 2);
    }

    private function getDynamicAmount(MollieField $field): float
    {
        $amountField = $field->getAmountField();
        $value = $amountField?->getValue();

        if (is_numeric($value)) {
            return (float) $value;
        }

        if (\is_string($value)) {
            return (float) preg_replace('/[^0-9.]/', '', $value);
        }

        if (\is_array($value)) {
            return (float) array_sum(
                array_filter(
                    array_map(
                        static fn ($val) => is_numeric($val) ? (float) $val : 0,
                        $value
                    )
                )
            );
        }

        return 0.0;
    }
}
