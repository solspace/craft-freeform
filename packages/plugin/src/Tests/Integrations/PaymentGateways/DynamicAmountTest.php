<?php

namespace Solspace\Freeform\Tests\Integrations\PaymentGateways;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Fields\Validation\NumericFieldValidation;
use Solspace\Freeform\Bundles\Fields\Validation\RangeFieldValidation;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Fields\Implementations\Pro\RangeField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Common\DynamicAmountService;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePriceService;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalPriceService;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Fields\SquareField;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Services\SquarePriceService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\PaymentIntentsController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripePriceService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Library\Translations\TranslationTable;
use yii\base\Event;
use yii\web\Response;

#[CoversClass(DynamicAmountService::class)]
#[CoversClass(MolliePriceService::class)]
#[CoversClass(PayPalPriceService::class)]
#[CoversClass(SquarePriceService::class)]
#[CoversClass(StripePriceService::class)]
#[CoversClass(PaymentIntentsController::class)]
class DynamicAmountTest extends TestCase
{
    private Form $form;
    private array $fields = [];
    private array $validators;

    protected function setUp(): void
    {
        $this->form = $this->createMock(Form::class);
        $this->form->method('get')->willReturnCallback(function ($id) {
            foreach ($this->fields as $field) {
                if ($field->getId() === $id || $field->getHandle() === $id) {
                    return $field;
                }
            }

            return null;
        });
        $this->validators = [new NumericFieldValidation(), new RangeFieldValidation()];
    }

    protected function tearDown(): void
    {
        foreach ($this->validators as $validator) {
            Event::off(FieldInterface::class, FieldInterface::EVENT_VALIDATE, [$validator, 'validate']);
        }
    }

    #[DataProvider('gateways')]
    public function testConfiguredMinimumIsEnforcedWithoutPostingAFormPage(string $gateway): void
    {
        $field = $this->field(NumberField::class, 'amount', '0.01', ['minMaxValues' => [10, 100], 'decimalCount' => 2]);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testConfiguredMaximumIsEnforced(string $gateway): void
    {
        $field = $this->field(NumberField::class, 'amount', 101, ['minMaxValues' => [10, 100]]);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testValidAmountCanBeRepricedAndNormallyValidatedAfterwards(string $gateway): void
    {
        $field = $this->field(NumberField::class, 'amount', 10, ['minMaxValues' => [10, 100]]);
        self::assertSame(1000, $this->amount($gateway, $field));
        $field->setValue(25);
        self::assertSame(2500, $this->amount($gateway, $field));
        $field->validate($this->form);
        self::assertTrue($field->isValid());
    }

    #[DataProvider('gateways')]
    public function testPreviouslyValidatedValuesAreRevalidatedAfterOverrides(string $gateway): void
    {
        $field = $this->field(NumberField::class, 'amount', 10, ['minMaxValues' => [10, 100]]);
        $field->validate($this->form);
        $field->setValue('0.01');
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('malformedAmounts')]
    public function testMalformedOrUnsafeAmountsNeverProduceAPrice(string $gateway, mixed $value): void
    {
        $field = $this->field(TextField::class, 'amount', $value);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    public static function malformedAmounts(): iterable
    {
        foreach (self::gateways() as [$gateway]) {
            foreach (['0.01USD', '$0.01', '', null, false, true, [], ['0.01'], [['0.01']], 'NaN', \INF, \NAN, '1e999', 0, -1, 0.001, \PHP_INT_MAX] as $i => $value) {
                yield $gateway.' '.$i => [$gateway, $value];
            }
        }
    }

    #[DataProvider('gateways')]
    public function testUnrestrictedDonationsRemainSupported(string $gateway): void
    {
        $field = $this->field(TextField::class, 'donation', '15.25');
        self::assertSame(1525, $this->amount($gateway, $field));
    }

    #[DataProvider('gateways')]
    public function testUnknownOptionValuesAreRejected(string $gateway): void
    {
        $field = $this->options(DropdownField::class, '0.01');
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testScalarOptionsCannotBeReplacedWithArrays(string $gateway): void
    {
        $field = $this->options(DropdownField::class, ['25']);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testConfiguredOptionsAndOptgroupsCanDetermineTheAmount(string $gateway): void
    {
        self::assertSame(2500, $this->amount($gateway, $this->options(DropdownField::class, '25')));
        self::assertSame(7500, $this->amount($gateway, $this->options(CheckboxesField::class, ['25', '50'])));
    }

    #[DataProvider('gateways')]
    public function testDuplicateOptionsCannotAlterTheTotal(string $gateway): void
    {
        $field = $this->options(CheckboxesField::class, ['25', '25']);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testCalculationResultComesFromServerLogicAndValidatedDependencies(string $gateway): void
    {
        $this->field(NumberField::class, 'quantity', 2, ['minMaxValues' => [1, 10]]);
        $field = $this->field(CalculationField::class, 'total', '0.01', ['calculations' => 'field:quantity * 25']);
        self::assertSame(5000, $this->amount($gateway, $field));
    }

    #[DataProvider('gateways')]
    public function testCalculationDependenciesCannotBypassTheirMinimum(string $gateway): void
    {
        $this->field(NumberField::class, 'quantity', '0.01', ['minMaxValues' => [1, 10]]);
        $field = $this->field(CalculationField::class, 'total', '25', ['calculations' => 'field:quantity * 25']);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testNestedCalculationsAreRecomputedWithRounding(string $gateway): void
    {
        $this->field(NumberField::class, 'quantity', 2);
        $this->field(CalculationField::class, 'subtotal', '0.01', ['calculations' => 'field:quantity * 12.345', 'decimalCount' => 2]);
        $field = $this->field(CalculationField::class, 'total', '0.01', ['calculations' => 'field:subtotal + sqrt(4)']);
        self::assertSame(2669, $this->amount($gateway, $field));
    }

    #[DataProvider('gateways')]
    public function testCircularCalculationsFailClosed(string $gateway): void
    {
        $field = $this->field(CalculationField::class, 'total', 25, ['calculations' => 'field:total * 2']);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testRangeRestrictionsApplyToPaymentAmounts(string $gateway): void
    {
        $field = $this->field(RangeField::class, 'amount', '0.01', ['minValue' => 10, 'maxValue' => 100]);
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, $field);
    }

    #[DataProvider('gateways')]
    public function testMissingAmountSourceDoesNotFallBackToAGatewayMinimum(string $gateway): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->amount($gateway, null);
    }

    #[DataProvider('gateways')]
    public function testFixedAmountsUseOnlyServerConfiguration(string $gateway): void
    {
        $field = $this->field(TextField::class, 'amount', '0.01');
        self::assertSame(7500, $this->amount($gateway, $field, 'fixed'));
    }

    public static function gateways(): iterable
    {
        foreach (['Mollie', 'PayPal', 'Square', 'Stripe'] as $gateway) {
            yield $gateway => [$gateway];
        }
    }

    public function testStripeZeroDecimalCurrencyConversionIsPreserved(): void
    {
        self::assertSame(25, $this->amount('Stripe', $this->field(TextField::class, 'amount', '25'), currency: 'JPY'));
    }

    public function testStripeRejectsInvalidAmountsBeforeCreatingOrUpdatingGatewayResources(): void
    {
        $field = $this->field(NumberField::class, 'amount', '0.01', ['minMaxValues' => [10, 100]]);
        [$payment, $service] = $this->payment('Stripe', $field);
        $integration = $this->createMock(Stripe::class);
        $integration->expects($this->never())->method('getStripeClient');

        foreach (['actionCreate', 'actionUpdateAmount'] as $action) {
            $controller = $this->getMockBuilder(PaymentIntentsController::class)
                ->disableOriginalConstructor()
                ->onlyMethods(['getRequestItems', 'asSerializedJson'])
                ->getMock()
            ;
            $controller->method('getRequestItems')->willReturn([$this->form, $integration, $payment, 'hash', null]);
            $response = $this->createStub(Response::class);
            $controller->expects($this->once())->method('asSerializedJson')
                ->with($this->callback(static fn ($data) => !empty($data['errors'])), 400)
                ->willReturn($response)
            ;
            (new \ReflectionProperty(PaymentIntentsController::class, 'amountService'))->setValue($controller, $service);
            self::assertSame($response, $controller->{$action}('pi_existing'));
        }
    }

    public function testStripeSubscriptionPricingRejectsInvalidAmountsBeforeContactingTheGateway(): void
    {
        $field = $this->field(NumberField::class, 'amount', '0.01', ['minMaxValues' => [10, 100]]);
        [$payment, $service] = $this->payment('Stripe', $field);
        $integration = $this->createMock(Stripe::class);
        $integration->expects($this->never())->method('getStripeClient');
        $this->expectException(\InvalidArgumentException::class);
        $service->getPrice($payment, $this->form, $integration);
    }

    private function amount(string $gateway, ?FieldInterface $source, string $type = 'dynamic', string $currency = 'USD'): int
    {
        [$payment, $service] = $this->payment($gateway, $source, $type, $currency);

        return $service->getAmount($this->form, $payment);
    }

    private function payment(string $gateway, ?FieldInterface $source, string $type = 'dynamic', string $currency = 'USD'): array
    {
        [$class, $service] = match ($gateway) {
            'Mollie' => [MollieField::class, new MolliePriceService()],
            'PayPal' => [PayPalField::class, new PayPalPriceService()],
            'Square' => [SquareField::class, new SquarePriceService()],
            'Stripe' => [StripeField::class, new StripePriceService(new IsolatedTwig(sys_get_temp_dir()))],
        };
        $payment = $this->getMockBuilder($class)->setConstructorArgs([$this->form])->onlyMethods(['getTranslationTable'])->getMock();
        $payment->method('getTranslationTable')->willReturn(new TranslationTable());
        $this->properties($payment, ['amountType' => $type, 'amountField' => $source, 'amount' => 75, 'currency' => $currency]);

        return [$payment, $service];
    }

    private function field(string $class, string $handle, mixed $value, array $properties = []): AbstractField
    {
        $field = new $class($this->form);
        $this->properties($field, ['id' => \count($this->fields) + 1, 'handle' => $handle] + $properties);
        $field->setValue($value);
        $this->fields[] = $field;

        return $field;
    }

    private function options(string $class, mixed $value): AbstractField
    {
        $field = $this->getMockBuilder($class)->setConstructorArgs([$this->form])->onlyMethods(['getOptions'])->getMock();
        $options = (new OptionCollection())->add('25')->addCollection((new OptionCollection('More'))->add('50'));
        $field->method('getOptions')->willReturn($options);
        $this->properties($field, ['id' => \count($this->fields) + 1, 'handle' => 'option'.\count($this->fields)]);
        $field->setValue($value);
        $this->fields[] = $field;

        return $field;
    }

    private function properties(object $object, array $properties): void
    {
        foreach ($properties as $name => $value) {
            (new \ReflectionProperty($object, $name))->setValue($object, $value);
        }
    }
}
