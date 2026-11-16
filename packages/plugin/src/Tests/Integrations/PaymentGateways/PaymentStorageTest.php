<?php

namespace Solspace\Freeform\Tests\Integrations\PaymentGateways;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response as GatewayResponse;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentStorageService;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Controllers\MolliePaymentController;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Controllers\OrdersController;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalOrderService;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Controllers\PaymentsController;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Fields\SquareField;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Square;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\PaymentIntentsController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners\RegisterField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripeCustomerService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripePriceService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Services\ActivityService;
use Stripe\PaymentIntent;
use Stripe\Service\PaymentIntentService;
use Stripe\StripeClient;
use yii\web\Request;
use yii\web\Response;

#[CoversClass(PaymentStorageService::class)]
#[CoversClass(PaymentIntentsController::class)]
#[CoversClass(MolliePaymentController::class)]
#[CoversClass(PaymentsController::class)]
#[CoversClass(OrdersController::class)]
class PaymentStorageTest extends TestCase
{
    private Form $form;
    private GeneralSettings $general;
    private CheckboxField $consent;
    private IntegrationLoggerProvider $loggers;
    private ActivityService $activity;
    private PaymentStorageService $storage;

    protected function setUp(): void
    {
        $this->general = new GeneralSettings();
        $this->general->allowUsersToOptIn = true;
        $this->general->optInCheckbox = 'consent';
        $settings = $this->createStub(Settings::class);
        $settings->method('getGeneral')->willReturn($this->general);
        $layout = new FormLayout();
        $this->form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()
            ->onlyMethods(['getId', 'getHandle', 'getSettings', 'getLayout', 'get'])->getMock()
        ;
        $this->form->method('getId')->willReturn(11);
        $this->form->method('getHandle')->willReturn('checkout');
        $this->form->method('getSettings')->willReturn($settings);
        $this->form->method('getLayout')->willReturn($layout);
        $this->consent = new CheckboxField($this->form);
        (new \ReflectionProperty($this->consent, 'handle'))->setValue($this->consent, 'consent');
        $this->form->method('get')->willReturnCallback(fn ($id) => 'consent' === $id ? $this->consent : null);
        $layout->getFields()->add($this->consent);
        $this->loggers = $this->createMock(IntegrationLoggerProvider::class);
        $this->activity = $this->createMock(ActivityService::class);
        $this->storage = $this->getMockBuilder(PaymentStorageService::class)
            ->setConstructorArgs([$this->loggers])->onlyMethods(['getActivity'])->getMock()
        ;
        $this->storage->method('getActivity')->willReturn($this->activity);
    }

    #[DataProvider('stripeConfirmationStorage')]
    public function testStripeConfirmationRechecksStorageAndConsent(string $paymentType, bool $storeData, bool $consent, bool $lookup, string $action, bool $blocked): void
    {
        $this->general->storeData = $storeData;
        $this->consent->setValue($consent ? 'yes' : '');
        $integration = $this->createMock(Stripe::class);
        $integration->method('getId')->willReturn(22);
        $integration->expects($this->never())->method('getStripeClient');
        $field = new StripeField($this->form);
        (new \ReflectionProperty($field, 'integration'))->setValue($field, $integration);
        (new \ReflectionProperty($field, 'paymentType'))->setValue($field, $paymentType);
        $field->setValue('pi_existing');
        $this->form->getLayout()->getFields()->add($field);
        $provider = $this->createStub(FormIntegrationsProvider::class);
        $provider->method('getFirstForForm')->willReturn($integration);
        $rules = $this->createStub(RuleValidator::class);
        $rules->method('isFieldHidden')->willReturn(false);
        $listener = $this->getMockBuilder(RegisterField::class)->disableOriginalConstructor()->onlyMethods([])->getMock();
        $this->inject($listener, 'integrationsProvider', $provider);
        $this->inject($listener, 'storageService', $this->storage);
        $this->inject($listener, 'ruleValidator', $rules);
        $request = $this->createStub(Request::class);
        $request->method('getBodyParam')->with('action')->willReturn($action);
        $event = new HandleRequestEvent($this->form, $request, $lookup);
        $this->activity->expects($blocked ? $this->once() : $this->never())->method('record');
        if ($blocked) {
            $this->loggers->method('getLogger')->willReturn($this->createStub(LoggerInterface::class));
        }
        $listener->validatePaymentStorage($event);
        self::assertSame(!$blocked, $event->isValid);
        self::assertSame($blocked, $this->form->hasErrors());
        self::assertSame($blocked, $field->hasErrors());
    }

    public static function stripeConfirmationStorage(): iterable
    {
        foreach ([StripeField::PAYMENT_TYPE_SINGLE, StripeField::PAYMENT_TYPE_SUBSCRIPTION] as $type) {
            yield [$type, false, true, false, 'freeform/submit/quick-save', true];

            yield [$type, true, false, false, 'freeform/submit/quick-save', true];

            yield [$type, true, true, false, 'freeform/submit/quick-save', false];

            yield [$type, false, false, true, 'freeform/submit/quick-save', false];

            yield [$type, false, false, false, 'freeform/stripe-callback/callback', false];
        }
    }

    #[DataProvider('blockedPayments')]
    public function testIncompatibleStorageIsRejectedBeforeGatewaySideEffects(string $gateway, string $action, string $paymentType, bool $storeData, string $consent): void
    {
        $this->general->storeData = $storeData;
        $this->consent->setValue($consent);
        [$controller, $integration] = $this->controller($gateway, $paymentType, ['consent' => $consent]);
        $reason = $storeData ? ActivityContext::PAYMENT_STORAGE_OPT_IN_REQUIRED : ActivityContext::PAYMENT_STORAGE_DISABLED;
        $this->activity->expects($this->once())->method('record')->with('integration-error', 11, null, ['integrationId' => 22, 'reasonCode' => $reason]);
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->once())->method('error')->with(
            $gateway.' payment blocked: '.ActivityContext::REASONS[$reason][1],
            ['activityRecorded' => true, 'formId' => 11, 'formHandle' => 'checkout', 'integrationId' => 22],
        );
        $this->loggers->expects($this->once())->method('getLogger')->with($integration)->willReturn($logger);
        $response = $this->createStub(Response::class);
        $controller->expects($this->once())->method('asSerializedJson')
            ->with(['errors' => [$gateway.' payments require stored submissions.']], 400)->willReturn($response)
        ;
        self::assertSame($response, $controller->{$action}('pi_existing'));
    }

    public static function blockedPayments(): iterable
    {
        foreach ([
            ['Stripe', 'actionCreate', StripeField::PAYMENT_TYPE_SINGLE],
            ['Stripe', 'actionCreate', StripeField::PAYMENT_TYPE_SUBSCRIPTION],
            ['Stripe', 'actionUpdateAmount', StripeField::PAYMENT_TYPE_SINGLE],
            ['Stripe', 'actionUpdateAmount', StripeField::PAYMENT_TYPE_SUBSCRIPTION],
            ['Mollie', 'actionIndex', ''],
            ['Square', 'actionCreate', ''],
            ['PayPal', 'actionCreate', ''],
        ] as [$gateway, $action, $paymentType]) {
            foreach ([[false, 'yes'], [false, ''], [true, '']] as [$storeData, $consent]) {
                yield $gateway.' '.$action.' '.$paymentType.' '.(int) $storeData.' '.$consent => [$gateway, $action, $paymentType, $storeData, $consent];
            }
        }
    }

    #[DataProvider('allowedStorage')]
    public function testStorageOptInRemainsOptionalAndCheckedOptInIsAccepted(bool $configureCheckbox): void
    {
        $this->general->storeData = true;
        $this->general->allowUsersToOptIn = $configureCheckbox;
        $this->general->optInCheckbox = $configureCheckbox ? 'consent' : null;
        $this->consent->setValue($configureCheckbox ? 'yes' : '');
        $this->loggers->expects($this->never())->method('getLogger');
        $this->activity->expects($this->never())->method('record');
        $this->storage->assertCanStore($this->form, $this->createStub(Stripe::class), 'Stripe');
        self::assertTrue($this->form->hasOptInPermission());
    }

    public static function allowedStorage(): iterable
    {
        yield 'no opt in configured' => [false];

        yield 'configured opt in checked' => [true];
    }

    #[DataProvider('postedConsent')]
    public function testGateUsesLatestPostedConsentBeforeContactingGateway(string $gateway): void
    {
        $this->general->storeData = true;
        $this->consent->setValue('yes'); // Previously checked; the payment request clears it.
        [$controller] = $this->controller($gateway, '', ['consent' => '']);
        $response = $this->createStub(Response::class);
        $controller->expects($this->once())->method('asSerializedJson')
            ->with(['errors' => [$gateway.' payments require stored submissions.']], 400)->willReturn($response)
        ;
        $action = 'Mollie' === $gateway ? 'actionIndex' : 'actionCreate';
        self::assertSame($response, $controller->{$action}());
        self::assertFalse($this->form->hasOptInPermission());
    }

    public static function postedConsent(): iterable
    {
        yield ['Mollie'];

        yield ['Square'];

        yield ['PayPal'];
    }

    #[DataProvider('allowedStorage')]
    public function testAllowedStorageCanCreateASquarePayment(bool $configureCheckbox): void
    {
        $this->general->optInCheckbox = $configureCheckbox ? 'consent' : null;
        $this->consent->setValue('');
        $this->activity->expects($this->never())->method('record');
        $this->loggers->expects($this->never())->method('getLogger');
        $controller = $this->getMockBuilder(PaymentsController::class)->disableOriginalConstructor()
            ->onlyMethods(['getRequestItems', 'asSerializedJson'])->getMock()
        ;
        $integration = $this->createStub(Square::class);
        $field = new SquareField($this->form);
        (new \ReflectionProperty($field, 'amount'))->setValue($field, 25.0);
        $controller->method('getRequestItems')->willReturn([$this->form, $integration, $field]);
        $request = $this->createStub(Request::class);
        $request->method('getRawBody')->willReturn(json_encode(['nonce' => 'test-nonce', 'values' => ['consent' => 'yes']]));
        $controller->request = $request;
        $payment = ['id' => 'square_test', 'status' => 'COMPLETED'];
        $client = new Client(['handler' => HandlerStack::create(new MockHandler([new GatewayResponse(201, [], json_encode(['payment' => $payment]))])), 'base_uri' => 'https://square.test']);
        $provider = $this->createMock(IntegrationClientProvider::class);
        $provider->expects($this->once())->method('getAuthorizedClient')->with($integration)->willReturn($client);
        $this->inject($controller, 'clientProvider', $provider);
        $this->inject($controller, 'storageService', $this->storage);
        $response = $this->createStub(Response::class);
        $controller->expects($this->once())->method('asSerializedJson')
            ->with(['success' => true, 'payment' => $payment, 'submissionId' => null], 201)->willReturn($response)
        ;
        self::assertSame($response, $controller->actionCreate());
    }

    #[DataProvider('allowedStorage')]
    public function testAllowedStorageCanUpdateAStripePayment(bool $configureCheckbox): void
    {
        $this->general->optInCheckbox = $configureCheckbox ? 'consent' : null;
        $this->consent->setValue($configureCheckbox ? 'yes' : '');
        $this->activity->expects($this->never())->method('record');
        $this->loggers->expects($this->never())->method('getLogger');
        $controller = $this->getMockBuilder(PaymentIntentsController::class)->disableOriginalConstructor()
            ->onlyMethods(['getRequestItems', 'asSerializedJson'])->getMock()
        ;
        $field = $this->createStub(StripeField::class);
        $integration = $this->createMock(Stripe::class);
        $stripe = $this->createMock(StripeClient::class);
        $intents = $this->createMock(PaymentIntentService::class);
        $intent = PaymentIntent::constructFrom(['id' => 'pi_existing', 'invoice' => null]);
        $intents->expects($this->once())->method('retrieve')->with('pi_existing', ['expand' => ['invoice.subscription']])->willReturn($intent);
        $intents->expects($this->once())->method('update')->with('pi_existing', ['amount' => 2500])->willReturn($intent);
        $stripe->method('__get')->with('paymentIntents')->willReturn($intents);
        $integration->expects($this->once())->method('getStripeClient')->willReturn($stripe);
        $controller->method('getRequestItems')->willReturn([$this->form, $integration, $field]);
        $prices = $this->createMock(StripePriceService::class);
        $prices->expects($this->once())->method('getAmount')->with($this->form, $field)->willReturn(2500);
        $this->inject($controller, 'amountService', $prices);
        $this->inject($controller, 'storageService', $this->storage);
        $response = $this->createStub(Response::class);
        $controller->expects($this->once())->method('asSerializedJson')->with(['amount' => 2500])->willReturn($response);
        self::assertSame($response, $controller->actionUpdateAmount('pi_existing'));
    }

    public function testLoggingFailuresCannotBypassTheStorageCheck(): void
    {
        $this->general->storeData = false;
        $this->activity->method('record')->willThrowException(new \RuntimeException('Activity unavailable'));
        $this->loggers->method('getLogger')->willThrowException(new \RuntimeException('Log file unavailable'));
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Stripe payments require stored submissions.');
        $this->storage->assertCanStore($this->form, $this->createStub(Stripe::class), 'Stripe');
    }

    private function controller(string $gateway, string $paymentType, array $values): array
    {
        [$class, $integrationClass, $fieldClass] = match ($gateway) {
            'Stripe' => [PaymentIntentsController::class, Stripe::class, StripeField::class],
            'Mollie' => [MolliePaymentController::class, Mollie::class, MollieField::class],
            'Square' => [PaymentsController::class, Square::class, SquareField::class],
            'PayPal' => [OrdersController::class, PayPal::class, PayPalField::class],
        };
        $controller = $this->getMockBuilder($class)->disableOriginalConstructor()
            ->onlyMethods(['getRequestItems', 'asSerializedJson'])->getMock()
        ;
        $integration = $this->createMock($integrationClass);
        $integration->method('getId')->willReturn(22);
        $field = $this->createMock($fieldClass);
        $controller->method('getRequestItems')->willReturn([$this->form, $integration, $field, 'hash', null]);
        $request = $this->createStub(Request::class);
        $request->method('getRawBody')->willReturn(json_encode(['values' => $values]));
        $request->method('getBodyParams')->willReturn([]);
        $controller->request = $request;
        $this->inject($controller, 'storageService', $this->storage);
        if ('Stripe' === $gateway) {
            $field->method('getPaymentType')->willReturn($paymentType);
            $integration->expects($this->never())->method('getStripeClient');
            $prices = $this->createMock(StripePriceService::class);
            $prices->expects($this->never())->method('getAmount');
            $this->inject($controller, 'amountService', $prices);
            $customer = $this->createMock(StripeCustomerService::class);
            $customer->expects($this->never())->method('getOrCreateCustomer');
            $this->inject($controller, 'customerService', $customer);
        } elseif ('PayPal' === $gateway) {
            $integration->method('getClientId')->willReturn('test-client');
            $integration->method('getClientSecret')->willReturn('test-secret');
            $orders = $this->createMock(PayPalOrderService::class);
            $orders->expects($this->never())->method('createOrder');
            $this->inject($controller, 'orderService', $orders);
            $this->inject($controller, 'isolatedTwig', $this->createStub(IsolatedTwig::class));
        } else {
            $provider = $this->createMock(IntegrationClientProvider::class);
            $provider->expects($this->never())->method('getAuthorizedClient');
            $this->inject($controller, 'clientProvider', $provider);
            if ('Mollie' === $gateway) {
                $integration->expects($this->never())->method('getMollieClient');
            }
        }

        return [$controller, $integration];
    }

    private function inject(object $object, string $name, object $value): void
    {
        (new \ReflectionProperty(get_parent_class($object), $name))->setValue($object, $value);
    }
}
