<?php

namespace Solspace\Freeform\Tests\Services\Headless\Manifest;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\Headless\Manifest\ManifestExtensionResolver;

#[CoversClass(ManifestExtensionResolver::class)]
class ManifestExtensionResolverTest extends TestCase
{
    private ManifestExtensionResolver $resolver;

    protected function setUp(): void
    {
        $this->resolver = new ManifestExtensionResolver();
    }

    public function testStripeUsesThePaymentStripeRendererAndExtension(): void
    {
        self::assertSame('payment.stripe', $this->resolver->resolveRenderer('stripe'));
        self::assertSame('payment.stripe', $this->resolver->resolveExtension('stripe'));
    }

    public function testStripeExtensionIsRequired(): void
    {
        self::assertSame(
            [[
                'name' => 'payment.stripe',
                'package' => '@solspace/freeform-extensions',
                'version' => '^0.1.0',
                'severity' => 'error',
                'fallback' => null,
            ]],
            $this->resolver->resolveRequiredExtensions([
                'payment' => [
                    'type' => 'stripe',
                    'frontend' => ['extension' => 'payment.stripe'],
                ],
            ])
        );
    }

    public function testSquareUsesThePaymentSquareRendererAndExtension(): void
    {
        self::assertSame('payment.square', $this->resolver->resolveRenderer('square'));
        self::assertSame('payment.square', $this->resolver->resolveExtension('square'));
    }

    public function testSquareExtensionIsRequired(): void
    {
        self::assertSame(
            [[
                'name' => 'payment.square',
                'package' => '@solspace/freeform-extensions',
                'version' => '^0.1.0',
                'severity' => 'error',
                'fallback' => null,
            ]],
            $this->resolver->resolveRequiredExtensions([
                'payment' => [
                    'type' => 'square',
                    'frontend' => ['extension' => 'payment.square'],
                ],
            ])
        );
    }

    public function testPayPalUsesThePaymentPayPalRendererAndExtension(): void
    {
        self::assertSame('payment.paypal', $this->resolver->resolveRenderer('paypal'));
        self::assertSame('payment.paypal', $this->resolver->resolveExtension('paypal'));
    }

    public function testPayPalExtensionIsRequired(): void
    {
        self::assertSame(
            [[
                'name' => 'payment.paypal',
                'package' => '@solspace/freeform-extensions',
                'version' => '^0.1.0',
                'severity' => 'error',
                'fallback' => null,
            ]],
            $this->resolver->resolveRequiredExtensions([
                'payment' => [
                    'type' => 'paypal',
                    'frontend' => ['extension' => 'payment.paypal'],
                ],
            ])
        );
    }

    public function testMollieUsesThePaymentMollieRendererAndExtension(): void
    {
        self::assertSame('payment.mollie', $this->resolver->resolveRenderer('mollie'));
        self::assertSame('payment.mollie', $this->resolver->resolveExtension('mollie'));
    }

    public function testMollieExtensionIsRequired(): void
    {
        self::assertSame(
            [[
                'name' => 'payment.mollie',
                'package' => '@solspace/freeform-extensions',
                'version' => '^0.1.0',
                'severity' => 'error',
                'fallback' => null,
            ]],
            $this->resolver->resolveRequiredExtensions([
                'payment' => [
                    'type' => 'mollie',
                    'frontend' => ['extension' => 'payment.mollie'],
                ],
            ])
        );
    }
}
