<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Stripe\Price;

class StripePriceService
{
    private const ZERO_DECIMAL_CURRENCIES = [
        'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf',
        'krw', 'mga', 'pyg', 'rwf', 'ugx',
        'vnd', 'vuv', 'xaf', 'xof', 'xpf',
    ];

    public function __construct(
        private IsolatedTwig $isolatedTwig,
    ) {
    }

    public function getFormattedAmount(string|int $amount, string $currency): string
    {
        $currency = strtolower($currency);
        $isZeroDecimal = \in_array($currency, self::ZERO_DECIMAL_CURRENCIES, true);

        $divisor = $isZeroDecimal ? 1 : 100;

        return number_format($amount / $divisor, 2);
    }

    public function getCurrencySymbol(string $currency): string
    {
        $currencies = json_decode(file_get_contents(__DIR__.'/../../Common/Currency/currencies.json'));

        return $currencies->{strtoupper($currency)}?->symbol ?? $currency;
    }

    public function getAmount(
        Form $form,
        StripeField $field,
    ): int {
        $amount = $field->getAmount();

        switch ($field->getAmountType()) {
            case StripeField::AMOUNT_TYPE_DYNAMIC:
                $amount = $this->getDynamicAmount($form, $field);

                break;

            case StripeField::AMOUNT_TYPE_FIXED:
                $amount = $field->getAmount();

                break;
        }

        $currency = strtolower($field->getCurrency());
        $isZeroDecimal = \in_array($currency, self::ZERO_DECIMAL_CURRENCIES, true);

        $multiplier = $isZeroDecimal ? 1 : 100;

        return (int) round($amount * $multiplier);
    }

    public function getPrice(
        StripeField $field,
        Form $form,
        Stripe $integration,
    ): Price {
        $amount = $this->getAmount($form, $field);
        $currency = $field->getCurrency();

        $stripe = $integration->getStripeClient();

        $productName = $this->isolatedTwig->render(
            $field->getProductName(),
            [
                'form' => $form,
                'integration' => $integration,
            ],
        );

        $product = $stripe
            ->products
            ->search([
                'query' => "name: '{$productName}'",
                'limit' => 1,
            ])
            ->first()
        ;

        if (!$product) {
            $product = $stripe->products->create(['name' => $productName]);
        }

        $price = $stripe
            ->prices
            ->search([
                'query' => "product: '{$product->id}' and lookup_key: '{$amount}{$currency}'",
                'limit' => 1,
            ])
            ->first()
        ;

        if (!$price) {
            $price = $stripe
                ->prices
                ->create([
                    'product' => $product->id,
                    'unit_amount' => $amount,
                    'lookup_key' => "{$amount}{$currency}",
                    'currency' => $currency,
                    'recurring' => [
                        'interval' => $field->getInterval(),
                        'interval_count' => $field->getIntervalCount(),
                    ],
                ])
            ;
        }

        return $price;
    }

    private function getDynamicAmount($form, $field): string
    {
        $amount = 0;
        $formField = $form->get($field->getAmountField()?->getId());
        if ($formField) {
            $amount = $formField->getValue();
        }

        return $amount;
    }
}
