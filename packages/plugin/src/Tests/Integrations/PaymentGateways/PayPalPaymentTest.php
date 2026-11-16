<?php

namespace Solspace\Freeform\Tests\Integrations\PaymentGateways;

use craft\db\Connection;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Controllers\OrdersController;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners\FinalizePayment;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalOrderService;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalPaymentService;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalPriceService;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;
use yii\base\ModelEvent;
use yii\db\Exception;
use yii\mutex\Mutex;
use yii\web\Request;

#[CoversClass(PayPalPaymentService::class)]
#[CoversClass(FinalizePayment::class)]
#[CoversClass(OrdersController::class)]
class PayPalPaymentTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private Connection $db;
    private Form $form;
    private Submission $submission;
    private PayPalField $field;
    private PayPal $integration;
    private GeneralSettings $general;
    private MockHandler $http;
    private FinalizePayment $listener;
    private array $heldLocks = [];
    private bool $lockAvailable = true;
    private bool $hidden = false;
    private bool $enabled = true;
    private bool $optIn = true;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('acquire')->willReturnCallback(function ($key) {
            if (!$this->lockAvailable || isset($this->heldLocks[$key])) {
                return false;
            }
            $this->heldLocks[$key] = true;

            return true;
        });
        $mutex->method('release')->willReturnCallback(function ($key) {
            unset($this->heldLocks[$key]);

            return true;
        });
        \Craft::$app = \Yii::$app = new PayPalPaymentApp($this->db, $mutex);
        $this->db->createCommand('CREATE TABLE freeform_payments (
            id INTEGER PRIMARY KEY, integrationId INTEGER, fieldId INTEGER, submissionId INTEGER,
            resourceId TEXT, type TEXT, amount REAL, currency TEXT, status TEXT, metadata TEXT,
            dateCreated TEXT, dateUpdated TEXT, uid TEXT, UNIQUE(integrationId, resourceId)
        )')->execute();

        $this->general = new GeneralSettings();
        $this->general->storeData = true;
        $settings = $this->createStub(Settings::class);
        $settings->method('getGeneral')->willReturn($this->general);
        $layout = new FormLayout();
        $this->form = $this->createMock(Form::class);
        $this->form->method('getId')->willReturn(11);
        $this->form->method('getLayout')->willReturn($layout);
        $this->form->method('getActions')->willReturn([]);
        $this->form->method('getSettings')->willReturn($settings);
        $this->form->method('hasOptInPermission')->willReturnCallback(fn () => $this->optIn);
        $this->submission = $this->createMock(Submission::class);
        $this->form->method('getSubmission')->willReturn($this->submission);
        $this->integration = $this->createMock(PayPal::class);
        $this->integration->method('getId')->willReturn(22);
        $this->integration->method('getApiRootUrl')->willReturn('https://api-m.sandbox.paypal.com');
        $this->field = new PayPalField($this->form);
        foreach (['id' => 33, 'required' => true, 'amount' => 500.0, 'integration' => $this->integration] as $name => $value) {
            (new \ReflectionProperty($this->field, $name))->setValue($this->field, $value);
        }
        $this->field->setValue('ORDER123');
        $layout->getFields()->add($this->field);

        $this->http = new MockHandler();
        $client = new Client(['handler' => HandlerStack::create($this->http)]);
        $provider = $this->createMock(IntegrationClientProvider::class);
        $provider->method('getAuthorizedClient')->willReturn($client);
        $service = new PayPalPaymentService($provider, new PayPalPriceService());
        $integrations = $this->createMock(FormIntegrationsProvider::class);
        $integrations->method('getFirstForForm')->willReturnCallback(function ($form, $type, $enabled = true, $filter = null) {
            return $this->enabled && $filter($this->integration) ? $this->integration : null;
        });
        $rules = $this->createMock(RuleValidator::class);
        $rules->method('isFieldHidden')->willReturnCallback(fn () => $this->hidden);
        $this->listener = new FinalizePayment($integrations, $service, $rules);
    }

    protected function tearDown(): void
    {
        Event::off(Form::class, Form::EVENT_SUBMIT, [$this->listener, 'onSubmit']);
        Event::off(Submission::class, Submission::EVENT_AFTER_SAVE, [$this->listener, 'onSubmissionSaved']);
        Event::off(Form::class, Form::EVENT_AFTER_SUBMIT_ATTEMPT, [$this->listener, 'releaseLocks']);
        $this->db->close();
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testMatchingCompletedPaymentIsStoredWithinTheSubmissionTransaction(): void
    {
        $this->queueOrder();
        $event = $this->submit();
        self::assertTrue($event->isValid);
        self::assertCount(1, $this->heldLocks);
        self::assertSame(0, (int) PaymentRecord::find()->count());

        $transaction = $this->db->beginTransaction();
        $this->saved(101);
        $payment = PaymentRecord::findOne(['resourceId' => 'ORDER123']);
        self::assertSame(101, (int) $payment->submissionId);
        self::assertSame(33, (int) $payment->fieldId);
        self::assertSame(500.0, (float) $payment->amount);
        self::assertSame('USD', $payment->currency);
        self::assertSame('COMPLETED', $payment->status);
        self::assertSame('CAPTURE123', json_decode($payment->metadata)->captureId);
        $this->finish($event);
        self::assertCount(1, $this->heldLocks, 'Keep the order locked until an outer transaction commits.');
        $transaction->commit();
        self::assertSame([], $this->heldLocks);
    }

    #[DataProvider('invalidOrders')]
    public function testInvalidPaymentsAreRejectedBeforeSubmissionStorage(array $changes): void
    {
        $this->queueOrder($changes);
        $event = $this->submit();
        self::assertFalse($event->isValid);
        self::assertTrue($this->field->hasErrors());
        self::assertSame(0, (int) PaymentRecord::find()->count());
        self::assertSame([], $this->heldLocks);
    }

    public static function invalidOrders(): iterable
    {
        yield 'cheap payment for premium selection' => [['purchase_units.0.amount.value' => '10.00', 'purchase_units.0.payments.captures.0.amount.value' => '10.00']];

        yield 'wrong captured amount' => [['purchase_units.0.payments.captures.0.amount.value' => '10.00']];

        yield 'wrong order amount' => [['purchase_units.0.amount.value' => '10.00']];

        yield 'wrong currency' => [['purchase_units.0.payments.captures.0.amount.currency_code' => 'EUR']];

        yield 'wrong order currency' => [['purchase_units.0.amount.currency_code' => 'EUR']];

        yield 'different form integration or field' => [['purchase_units.0.custom_id' => 'OTHERFORM']];

        yield 'missing binding' => [['purchase_units.0.custom_id' => null]];

        yield 'approved but not captured' => [['status' => 'APPROVED']];

        yield 'pending capture' => [['purchase_units.0.payments.captures.0.status' => 'PENDING']];

        yield 'declined capture' => [['purchase_units.0.payments.captures.0.status' => 'DECLINED']];

        yield 'missing capture' => [['purchase_units.0.payments.captures' => []]];

        yield 'missing capture identifier' => [['purchase_units.0.payments.captures.0.id' => null]];

        yield 'wrong order identifier' => [['id' => 'OTHERORDER']];

        yield 'authorize intent' => [['intent' => 'AUTHORIZE']];

        yield 'extra purchase unit' => [['purchase_units.1' => []]];

        yield 'extra capture' => [['purchase_units.0.payments.captures.1' => []]];

        yield 'fractional cents must not be rounded' => [['purchase_units.0.payments.captures.0.amount.value' => '500.001']];

        yield 'scientific notation' => [['purchase_units.0.payments.captures.0.amount.value' => '5e2']];

        yield 'numeric JSON amount' => [['purchase_units.0.payments.captures.0.amount.value' => 500]];
    }

    #[DataProvider('failedLookups')]
    public function testLookupFailuresFailClosed(int $status, string $body): void
    {
        $this->http->append(new Response($status, [], $body));
        self::assertFalse($this->submit()->isValid);
        self::assertSame([], $this->heldLocks);
    }

    public static function failedLookups(): iterable
    {
        yield 'made up order' => [404, '{}'];

        yield 'gateway outage' => [503, '{}'];

        yield 'invalid JSON' => [200, '{'];

        yield 'empty JSON' => [200, 'null'];
    }

    #[DataProvider('invalidIds')]
    public function testMissingOrMalformedOrderIdsFailClosed(mixed $value): void
    {
        $this->field->setValue($value);
        self::assertFalse($this->submit()->isValid);
        self::assertSame(0, $this->http->count());
    }

    public static function invalidIds(): iterable
    {
        foreach (['', null, [], ['ORDER123'], '../orders/ORDER123', 'ORDER123?x=1', str_repeat('A', 51)] as $value) {
            yield [$value];
        }
    }

    public function testAnOrderCannotBeUsedForAnotherSubmission(): void
    {
        $this->queueOrder();
        $event = $this->submit();
        $this->saved(101);
        $this->finish($event);
        $this->submission->id = null;
        self::assertFalse($this->submit()->isValid);
        self::assertSame(1, (int) PaymentRecord::find()->count());
    }

    public function testDynamicAmountUsesTheFinalSubmittedValues(): void
    {
        $source = new TextField($this->form);
        $source->setValue('10');
        (new \ReflectionProperty($this->field, 'amountType'))->setValue($this->field, PayPalField::AMOUNT_TYPE_DYNAMIC);
        (new \ReflectionProperty($this->field, 'amountField'))->setValue($this->field, $source);
        $this->queueOrder([
            'purchase_units.0.amount.value' => '10.00',
            'purchase_units.0.payments.captures.0.amount.value' => '10.00',
        ]);
        $source->setValue('500'); // Changed after the order was created and captured.
        self::assertFalse($this->submit()->isValid);
        self::assertSame(0, (int) PaymentRecord::find()->count());
    }

    public function testAnExistingSubmissionCanKeepItsOwnPayment(): void
    {
        $this->queueOrder();
        $event = $this->submit();
        $this->saved(101);
        $this->finish($event);
        $this->queueOrder();
        $event = $this->submit();
        self::assertTrue($event->isValid);
        $this->saved(101);
        $this->finish($event);
        self::assertSame(1, (int) PaymentRecord::find()->count());
    }

    public function testConcurrentUseIsRejectedBeforeLookingUpOrStoringPayment(): void
    {
        $this->lockAvailable = false;
        self::assertFalse($this->submit()->isValid);
        self::assertSame(0, $this->http->count());
        self::assertSame([], $this->heldLocks);
    }

    public function testCancelledSubmissionReleasesTheOrderAndCanBeRetried(): void
    {
        $this->queueOrder();
        $event = $this->submit();
        $event->isValid = false; // Another submit listener cancels after payment verification.
        $this->finish($event);
        self::assertSame([], $this->heldLocks);
        $this->queueOrder();
        self::assertTrue($this->submit()->isValid);
    }

    public function testPaymentStorageFailureRollsBackTheSubmissionTransaction(): void
    {
        $this->queueOrder();
        $event = $this->submit();
        $this->db->getMasterPdo()->exec("CREATE TRIGGER fail_payment BEFORE INSERT ON freeform_payments BEGIN SELECT RAISE(ABORT, 'payment save failed'); END");
        $this->db->createCommand('CREATE TABLE test_submissions (id INTEGER PRIMARY KEY)')->execute();
        $transaction = $this->db->beginTransaction();

        try {
            $this->db->createCommand()->insert('test_submissions', ['id' => 101])->execute();
            $this->saved(101);
            self::fail('A failed payment save must interrupt submission storage.');
        } catch (Exception) {
            $transaction->rollBack();
        } finally {
            $this->finish($event);
        }
        self::assertSame(0, (int) $this->db->createCommand('SELECT COUNT(*) FROM test_submissions')->queryScalar());
        self::assertSame([], $this->heldLocks);
    }

    public function testInvalidPaymentNeverStoresOrPostProcessesASubmission(): void
    {
        $this->http->append(new Response(404, [], '{}'));
        $submissions = $this->getMockBuilder(SubmissionsService::class)->onlyMethods([
            'storeSubmission', 'postProcessSubmission', 'shouldDeferPostProcessForAsyncSpam',
        ])->getMock();
        $submissions->expects($this->never())->method('storeSubmission');
        $submissions->expects($this->never())->method('postProcessSubmission');
        $this->form->expects($this->once())->method('addError');
        $submissions->handleSubmission($this->form);
        self::assertSame([], $this->heldLocks);
    }

    public function testPaymentIsPersistedBeforeNotificationsAndOtherPostProcessing(): void
    {
        $this->queueOrder();
        $submissions = $this->getMockBuilder(SubmissionsService::class)->onlyMethods([
            'storeSubmission', 'postProcessSubmission', 'shouldDeferPostProcessForAsyncSpam',
        ])->getMock();
        $submissions->method('shouldDeferPostProcessForAsyncSpam')->willReturn(false);
        $submissions->expects($this->once())->method('storeSubmission')->willReturnCallback(function () {
            $transaction = $this->db->beginTransaction();
            $this->saved(101);
            $transaction->commit();

            return true;
        });
        $submissions->expects($this->once())->method('postProcessSubmission')->willReturnCallback(static function () {
            self::assertSame(1, (int) PaymentRecord::find()->count());
        });
        $submissions->handleSubmission($this->form);
        self::assertSame([], $this->heldLocks);
    }

    #[DataProvider('incompatibleStorage')]
    public function testOrderCreationRejectsIncompatibleStorageBeforePayment(bool $storeData, bool $optIn): void
    {
        $this->general->storeData = $storeData;
        $this->optIn = $optIn;
        $this->integration->method('getClientId')->willReturn('test-client');
        $this->integration->method('getClientSecret')->willReturn('test-secret');
        $controller = $this->getMockBuilder(OrdersController::class)->disableOriginalConstructor()
            ->onlyMethods(['getRequestItems', 'asSerializedJson'])->getMock()
        ;
        $controller->method('getRequestItems')->willReturn([$this->form, $this->integration, $this->field, 'hash']);
        $response = $this->createStub(\yii\web\Response::class);
        $controller->expects($this->once())->method('asSerializedJson')
            ->with(['errors' => ['PayPal payments require stored submissions.']], 400)->willReturn($response)
        ;
        $request = $this->createStub(Request::class);
        $request->method('getRawBody')->willReturn('{}');
        $controller->request = $request;
        $twig = $this->createStub(IsolatedTwig::class);
        $twig->method('render')->willReturn('Test payment');
        $orders = $this->createMock(PayPalOrderService::class);
        $orders->expects($this->never())->method('createOrder');
        $prices = new PayPalPriceService();
        foreach (['isolatedTwig' => $twig, 'orderService' => $orders, 'priceService' => $prices] as $name => $value) {
            (new \ReflectionProperty(OrdersController::class, $name))->setValue($controller, $value);
        }
        self::assertSame($response, $controller->actionCreate());
    }

    public static function incompatibleStorage(): iterable
    {
        yield 'storage disabled' => [false, true];

        yield 'storage opt out' => [true, false];
    }

    public function testNonStoringFormsAreRejected(): void
    {
        $this->general->storeData = false;
        self::assertFalse($this->submit()->isValid);
    }

    public function testStorageOptOutIsRejected(): void
    {
        $this->optIn = false;
        self::assertFalse($this->submit()->isValid);
    }

    public function testDisabledIntegrationCannotAcceptPayments(): void
    {
        $this->enabled = false;
        self::assertFalse($this->submit()->isValid);
    }

    public function testBlankOptionalPaymentRemainsOptional(): void
    {
        (new \ReflectionProperty($this->field, 'required'))->setValue($this->field, false);
        $this->field->setValue('');
        self::assertTrue($this->submit()->isValid);
        self::assertSame([], $this->heldLocks);
    }

    public function testHiddenPaymentIsNotRequired(): void
    {
        $this->hidden = true;
        $this->field->setValue('');
        self::assertTrue($this->submit()->isValid);
    }

    private function submit(): SubmitEvent
    {
        $event = new SubmitEvent($this->form);
        Event::trigger(Form::class, Form::EVENT_SUBMIT, $event);

        return $event;
    }

    private function saved(int $id): void
    {
        $this->submission->id = $id;
        Event::trigger($this->submission, Submission::EVENT_AFTER_SAVE, new ModelEvent());
    }

    private function finish(SubmitEvent $event): void
    {
        Event::trigger(Form::class, Form::EVENT_AFTER_SUBMIT_ATTEMPT, $event);
    }

    private function queueOrder(array $changes = []): void
    {
        $order = [
            'id' => 'ORDER123', 'status' => 'COMPLETED', 'intent' => 'CAPTURE',
            'purchase_units' => [[
                'custom_id' => HashHelper::hash([11, 22, 33]),
                'amount' => ['value' => '500.00', 'currency_code' => 'USD'],
                'payments' => ['captures' => [[
                    'id' => 'CAPTURE123', 'status' => 'COMPLETED',
                    'amount' => ['value' => '500.00', 'currency_code' => 'USD'],
                ]]],
            ]],
        ];
        foreach ($changes as $path => $value) {
            $target = &$order;
            foreach (explode('.', $path) as $part) {
                $target = &$target[$part];
            }
            $target = $value;
            unset($target);
        }
        $this->http->append(new Response(200, [], json_encode($order)));
    }
}

class PayPalPaymentApp
{
    public object $session;

    public function __construct(public Connection $db, public Mutex $mutex)
    {
        $this->session = new class {
            public function setFlash($key, $value): void {}
        };
    }

    public function getDb(): Connection
    {
        return $this->db;
    }

    public function getMutex(): Mutex
    {
        return $this->mutex;
    }

    public function getConfig(): self
    {
        return $this;
    }

    public function getGeneral(): object
    {
        return (object) ['securityKey' => 'paypal-payment-regression'];
    }
}
