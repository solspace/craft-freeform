<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;

class PayPalPriceService
{
    public function getAmount(Form $form, PayPalField $field): int
    {
        $amount = $field->getAmount();

        switch ($field->getAmountType()) {
            case PayPalField::AMOUNT_TYPE_DYNAMIC:
                $amount = $this->getDynamicAmount($form, $field);

                break;

            case PayPalField::AMOUNT_TYPE_FIXED:
            default:
                $amount = $field->getAmount();

                break;
        }

        $finalAmount = (int) round($amount * 100);

        if ($finalAmount <= 0) {
            throw new \Exception("PayPal amount must be greater than 0. Current amount: {$amount} (final: {$finalAmount})");
        }

        return $finalAmount;
    }

    private function getDynamicAmount(Form $form, PayPalField $field): float
    {
        $amount = 0;

        $amountField = $field->getAmountField();
        if ($amountField) {
            $value = $amountField->getValue();
            if (is_numeric($value)) {
                $amount = (float) $value;
            } elseif (\is_string($value)) {
                $amount = (float) preg_replace('/[^0-9.]/', '', $value);
            } elseif (\is_array($value)) {
                $flat = array_filter(array_map(static fn ($v) => is_numeric($v) ? (float) $v : 0, $value));
                $amount = (float) array_sum($flat);
            }
        }

        return (float) $amount;
    }
}
