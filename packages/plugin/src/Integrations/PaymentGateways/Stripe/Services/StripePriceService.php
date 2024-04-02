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
    ) {}

    public function getFormattedAmount(int|string $amount, string $currency): string
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

    public function getAmount(Form $form, StripeField $field): int
    {
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

    public function getInterval(Form $form, StripeField $field): string
    {
        return match ($field->getIntervalType()) {
            StripeField::PAYMENT_INTERVAL_TYPE_STATIC => $field->getInterval(),
            StripeField::PAYMENT_INTERVAL_TYPE_DYNAMIC => $this->getDynamicInterval($form, $field),
        };
    }

    public function getIntervalCount(Form $form, StripeField $field): int
    {
        return match ($field->getIntervalCountType()) {
            StripeField::PAYMENT_INTERVAL_TYPE_STATIC => $field->getIntervalCount(),
            StripeField::PAYMENT_INTERVAL_TYPE_DYNAMIC => $this->getDynamicIntervalCount($form, $field),
        };
    }

    public function getPrice(
        StripeField $field,
        Form $form,
        Stripe $integration,
    ): Price {
        $amount = $this->getAmount($form, $field);
        $currency = $field->getCurrency();

        $interval = $this->getInterval($form, $field);
        $intervalCount = $this->getIntervalCount($form, $field);

        $stripe = $integration->getStripeClient();

        $productName = $field->getProductName();
        if (!$productName) {
            $productName = StripeField::DEFAULT_PRODUCT_NAME;
        }

        $productName = $this->isolatedTwig->render(
            $productName,
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

        $lookupKey = "[{$product->id}]{$amount}{$currency}-{$interval}:{$intervalCount}";

        $price = $stripe
            ->prices
            ->search([
                'query' => "product: '{$product->id}' and lookup_key: '{$lookupKey}'",
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
                    'lookup_key' => "{$lookupKey}",
                    'currency' => $currency,
                    'recurring' => [
                        'interval' => $interval,
                        'interval_count' => $intervalCount,
                    ],
                ])
            ;
        }

        return $price;
    }

    private function getDynamicAmount(Form $form, StripeField $field): float
    {
        $amount = 0;
        $formField = $form->get($field->getAmountField()?->getId());
        if ($formField) {
            $amount = (float) $formField->getValue();
        }

        return $amount;
    }

    private function getDynamicInterval(Form $form, StripeField $field): string
    {
        $interval = $field->getInterval();
        $formField = $form->get($field->getIntervalField()?->getId());
        if ($formField) {
            $interval = $formField->getValue();
        }

        return $interval;
    }

    private function getDynamicIntervalCount(Form $form, StripeField $field): int
    {
        $intervalCount = $field->getIntervalCount();
        $formField = $form->get($field->getIntervalCountField()?->getId());
        if ($formField) {
            $intervalCount = (int) $formField->getValueAsString();
        }

        return $intervalCount;
    }
}
