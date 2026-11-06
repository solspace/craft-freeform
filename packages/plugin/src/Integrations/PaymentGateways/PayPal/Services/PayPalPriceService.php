<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Common\DynamicAmountService;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;

class PayPalPriceService
{
    public function getAmount(Form $form, PayPalField $field): int
    {
        $amount = match ($field->getAmountType()) {
            PayPalField::AMOUNT_TYPE_DYNAMIC => (new DynamicAmountService())->getAmount($form, $field->getAmountField()),
            default => $field->getAmount(),
        };

        $finalAmount = (int) round($amount * 100);

        if ($finalAmount <= 0) {
            throw new \InvalidArgumentException("PayPal amount must be greater than 0. Current amount: {$amount} (final: {$finalAmount})");
        }

        return $finalAmount;
    }
}
