<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Library\Helpers\HashHelper;

class PayPalPaymentService
{
    public function __construct(
        private IntegrationClientProvider $clientProvider,
        private PayPalPriceService $priceService,
    ) {}

    /** @return array{object, object} */
    public function verify(Form $form, PayPal $integration, PayPalField $field, string $orderId): array
    {
        // Order IDs are opaque identifiers, never paths or query strings.
        if (!preg_match('/^[A-Z0-9]{1,50}$/D', $orderId)) {
            throw new \InvalidArgumentException('Invalid PayPal order ID.');
        }

        $amount = $this->priceService->getAmount($form, $field);
        $currency = strtoupper($field->getCurrency());
        $hash = HashHelper::hash([$form->getId(), $integration->getId(), $field->getId()]);
        $client = $this->clientProvider->getAuthorizedClient($integration);
        $response = $client->get($integration->getApiRootUrl().'/v2/checkout/orders/'.$orderId);
        $order = json_decode((string) $response->getBody(), false, 512, \JSON_THROW_ON_ERROR);
        $units = $order->purchase_units ?? [];
        $unit = $units[0] ?? null;
        $captures = $unit->payments->captures ?? [];
        $capture = $captures[0] ?? null;

        if (
            ($order->id ?? null) !== $orderId
            || 'COMPLETED' !== ($order->status ?? null)
            || 'CAPTURE' !== ($order->intent ?? null)
            || 1 !== \count($units)
            || ($unit->custom_id ?? null) !== $hash
            || 1 !== \count($captures)
            || empty($capture->id)
            || 'COMPLETED' !== ($capture->status ?? null)
            || !$this->matchesAmount($unit->amount ?? null, $amount, $currency)
            || !$this->matchesAmount($capture->amount ?? null, $amount, $currency)
        ) {
            throw new \InvalidArgumentException('PayPal payment does not match this submission.');
        }

        return [$order, $capture];
    }

    private function matchesAmount(?object $amount, int $expected, string $currency): bool
    {
        $value = $amount->value ?? null;
        if (!\is_string($value) || !preg_match('/^\d+(?:\.\d{1,2})?$/D', $value)) {
            return false;
        }

        // Compare decimal strings exactly; do not round gateway amounts or use floats.
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');
        $minorUnits = ltrim($whole.str_pad($fraction, 2, '0'), '0');

        return $minorUnits === (string) $expected && ($amount->currency_code ?? null) === $currency;
    }
}
