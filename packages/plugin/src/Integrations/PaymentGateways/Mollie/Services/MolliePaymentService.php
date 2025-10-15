<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services;

use Mollie\Api\Exceptions\ApiException;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;

class MolliePaymentService
{
    private Mollie $integration;

    public function __construct(Mollie $integration)
    {
        $this->integration = $integration;
    }

    public function createPayment(array $paymentData): array
    {
        try {
            $mollie = $this->integration->getMollieClient();
            $payment = $mollie->payments->create($paymentData);

            return $this->toArray($payment);
        } catch (ApiException $e) {
            throw new IntegrationException('Mollie API error: '.$e->getMessage());
        }
    }

    public function getPayment(string $paymentId): array
    {
        try {
            $mollie = $this->integration->getMollieClient();
            $payment = $mollie->payments->get($paymentId);

            return $this->toArray($payment);
        } catch (ApiException $e) {
            throw new IntegrationException('Mollie API error: '.$e->getMessage());
        }
    }

    public function cancelPayment(string $paymentId): array
    {
        try {
            $mollie = $this->integration->getMollieClient();
            $payment = $mollie->payments->get($paymentId);
            $payment->cancel();

            return $this->toArray($payment);
        } catch (ApiException $e) {
            throw new IntegrationException('Mollie API error: '.$e->getMessage());
        }
    }

    public function refundPayment(string $paymentId, array $refundData): array
    {
        try {
            $mollie = $this->integration->getMollieClient();
            $payment = $mollie->payments->get($paymentId);
            $refund = $payment->refund($refundData);

            return $this->toArray($refund);
        } catch (ApiException $e) {
            throw new IntegrationException('Mollie API error: '.$e->getMessage());
        }
    }

    public function getPaymentMethods(): array
    {
        try {
            $mollie = $this->integration->getMollieClient();
            $methods = $mollie->methods->all();

            return $this->toArray($methods);
        } catch (ApiException $e) {
            throw new IntegrationException('Mollie API error: '.$e->getMessage());
        }
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $webhookSecret = $this->integration->getWebhookSecret();

        if (empty($webhookSecret)) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

        return hash_equals($expectedSignature, $signature);
    }

    private function toArray(mixed $resource): array
    {
        if ($resource instanceof \JsonSerializable) {
            // @var array $data
            return $resource->jsonSerialize();
        }

        // Fallback: best-effort convert
        $json = json_encode($resource);
        if (false !== $json) {
            $decoded = json_decode($json, true);
            if (\is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }
}
