<?php

namespace Solspace\Freeform\Tests\Integrations\PaymentGateways;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripeCallbackService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Records\SavedFormRecord;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use Stripe\PaymentIntent;
use Stripe\Service\PaymentIntentService;
use Stripe\StripeClient;
use yii\base\Event;
use yii\base\Security;
use yii\db\Connection;
use yii\mutex\Mutex;

#[CoversClass(StripeCallbackService::class)]
class StripeCallbackServiceTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousApp;
    private mixed $previousYiiApp;
    private Connection $db;
    private Mutex $mutex;
    private StripeCallbackService $service;
    private Stripe $integration;
    private StripeField $field;
    private PaymentIntent $intent;
    private PaymentIntentService $intents;
    private SubmissionsService $submissions;
    private IsolatedTwig $twig;
    private LoggerInterface $logger;
    private int $submissionCount = 0;
    private bool $locked = false;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->db = new Connection([
            'dsn' => 'sqlite::memory:',
            'schemaCache' => null,
            'enableSchemaCache' => false,
        ]);
        $this->db->createCommand()->createTable(SavedFormRecord::TABLE, [
            'id' => 'pk', 'formId' => 'integer', 'token' => 'string', 'payload' => 'text',
        ])->execute();
        $this->db->createCommand()->createTable(PaymentRecord::TABLE, [
            'id' => 'pk', 'integrationId' => 'integer', 'fieldId' => 'integer', 'submissionId' => 'integer',
            'resourceId' => 'string', 'type' => 'string', 'currency' => 'string', 'amount' => 'integer',
            'status' => 'string', 'link' => 'string', 'metadata' => 'text',
        ])->execute();
        $this->db->createCommand()->createIndex('payment_resource', PaymentRecord::TABLE, ['integrationId', 'resourceId'], true)->execute();
        $this->db->createCommand()->insert(SavedFormRecord::TABLE, [
            'id' => 1, 'formId' => 7, 'token' => 'pi_test', 'payload' => base64_encode('encrypted'),
        ])->execute();

        $this->mutex = $this->createMock(Mutex::class);
        $this->mutex->method('acquire')->willReturnCallback(function (): bool {
            if ($this->locked) {
                \Fiber::suspend('waiting for payment');
            }
            $this->locked = true;

            return true;
        });
        $this->mutex->method('release')->willReturnCallback(function (): bool {
            $this->locked = false;

            return true;
        });
        $security = $this->createStub(Security::class);
        $security->method('decryptByKey')->willReturn('{"fields":{"name":"Test"}}');
        $this->configureApp($security);

        $this->intent = PaymentIntent::constructFrom([
            'id' => 'pi_test', 'client_secret' => 'secret', 'status' => 'succeeded',
            'amount' => 2500, 'currency' => 'usd', 'invoice' => null, 'metadata' => [],
            'last_payment_error' => null, 'payment_method' => null,
        ]);
        $this->intents = $this->createMock(PaymentIntentService::class);
        $client = $this->createMock(StripeClient::class);
        $client->method('__get')->with('paymentIntents')->willReturn($this->intents);
        $this->integration = $this->createMock(Stripe::class);
        $this->integration->method('getId')->willReturn(2);
        $this->integration->method('getPublicKey')->willReturn('pk_test_example');
        $this->integration->method('getStripeClient')->willReturn($client);
        $this->field = $this->createMock(StripeField::class);
        $this->field->method('getId')->willReturn(3);
        $logger = $this->createStub(IntegrationLoggerProvider::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $logger->method('getLogger')->willReturn($this->logger);
        $this->submissions = $this->createMock(SubmissionsService::class);
        $this->submissions->method('handleSubmission')->willReturnCallback(function (Form $form): void {
            $form->getSubmission()->id = ++$this->submissionCount;
        });
        $this->twig = $this->createMock(IsolatedTwig::class);
        $this->service = new StripeCallbackService($this->submissions, $logger, $this->twig);
    }

    protected function tearDown(): void
    {
        Event::off(PaymentRecord::class, PaymentRecord::EVENT_BEFORE_INSERT);
        $this->db->close();
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    #[TestWith(['callback', 'webhook'])]
    #[TestWith(['webhook', 'callback'])]
    public function testOverlappingRequestsCreateOnlyOneSubmission(string $first, string $second): void
    {
        // Both controllers read the row before either starts processing the payment.
        $savedForms = [SavedFormRecord::findOne(1), SavedFormRecord::findOne(1)];
        $forms = [$this->form(), $this->form()];
        $retrievals = 0;
        $this->intents->expects(self::once())->method('retrieve')->willReturnCallback(function () use (&$retrievals): PaymentIntent {
            if (0 === $retrievals++) {
                \Fiber::suspend('retrieving payment');
            }

            return $this->intent;
        });
        // Stop after the local payment is saved, without needing a running Craft URL service.
        // This also verifies that a metadata failure releases the lock for the waiting request.
        $this->twig->expects(self::once())->method('render')->willThrowException(new StripeMetadataTestException());
        $requests = [];
        foreach ([$first, $second] as $index => $entryPoint) {
            $requests[$entryPoint] = new \Fiber(function () use ($forms, $savedForms, $index): bool {
                try {
                    return $this->handle($forms[$index], $savedForms[$index]);
                } catch (StripeMetadataTestException) {
                    return true;
                }
            });
        }

        self::assertSame('retrieving payment', $requests[$first]->start());
        self::assertSame('waiting for payment', $requests[$second]->start());
        $requests[$first]->resume();
        $requests[$second]->resume();

        self::assertTrue($requests[$first]->getReturn());
        self::assertTrue($requests[$second]->getReturn());
        self::assertSame(1, $this->submissionCount);
        self::assertSame(1, (int) PaymentRecord::find()->count());
        self::assertSame(1, (int) PaymentRecord::findOne(['resourceId' => 'pi_test'])->submissionId);
        self::assertNull(SavedFormRecord::findOne(1));
        self::assertFalse($this->locked);
    }

    public function testAStaleSavedFormCannotCreateAnotherSubmissionEvenWithoutAPaymentRecord(): void
    {
        $savedForm = SavedFormRecord::findOne(1);
        SavedFormRecord::deleteAll(['id' => 1]);
        $this->submissions->expects(self::never())->method('handleSubmission');
        $this->intents->expects(self::never())->method('retrieve');

        self::assertFalse($this->handle($this->form(), $savedForm));
        self::assertFalse($this->locked);
    }

    public function testAnExistingPaymentCanUpdateItsStatusWithoutResubmitting(): void
    {
        $this->db->createCommand()->insert(PaymentRecord::TABLE, [
            'integrationId' => 2, 'fieldId' => 3, 'resourceId' => 'pi_test',
            'submissionId' => 42, 'status' => 'processing',
        ])->execute();
        $this->submissions->expects(self::never())->method('handleSubmission');
        $this->twig->expects(self::never())->method('render');

        self::assertTrue($this->handle($this->form(), SavedFormRecord::findOne(1)));
        self::assertSame('succeeded', PaymentRecord::findOne(['resourceId' => 'pi_test'])->status);
        self::assertSame(42, (int) PaymentRecord::findOne(['resourceId' => 'pi_test'])->submissionId);
    }

    public function testAMissingSavedFormAndPaymentDoNothing(): void
    {
        $this->submissions->expects(self::never())->method('handleSubmission');

        self::assertFalse($this->handle($this->form(), null));
        self::assertFalse($this->locked);
    }

    public function testALockTimeoutLeavesTheSavedFormUntouchedAndRaisesARetryableError(): void
    {
        $this->logger->expects(self::once())->method('error')->with('Timed out waiting to handle Stripe payment');
        $this->mutex = $this->createMock(Mutex::class);
        $this->mutex->expects(self::once())->method('acquire')->with('freeform-stripe-payment-2-pi_test', 30)->willReturn(false);
        $this->mutex->expects(self::never())->method('release');
        $this->configureApp($this->createStub(Security::class));
        $this->submissions->expects(self::never())->method('handleSubmission');

        try {
            $this->handle($this->form(), SavedFormRecord::findOne(1));
            self::fail('A lock timeout must not acknowledge a webhook as processed.');
        } catch (FreeformException) {
            self::assertNotNull(SavedFormRecord::findOne(1));
        }
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testAFailedPaymentSaveRaisesAnErrorAndReleasesTheLock(bool $throws): void
    {
        $this->logger->expects(self::once())->method('error')->with('Failed to save Stripe payment record');
        $this->intents->method('retrieve')->willReturn($this->intent);
        Event::on(PaymentRecord::class, PaymentRecord::EVENT_BEFORE_INSERT, static function ($event) use ($throws): void {
            if ($throws) {
                throw new \RuntimeException('Payment storage failed.');
            }

            $event->isValid = false;
        });
        $this->twig->expects(self::never())->method('render');

        try {
            $this->handle($this->form(), SavedFormRecord::findOne(1));
            self::fail('A failed payment save must not report success.');
        } catch (FreeformException|\RuntimeException $exception) {
            self::assertSame($throws ? 'Payment storage failed.' : 'Failed to save Stripe payment record.', $exception->getMessage());
            self::assertFalse($this->locked);
        }
    }

    private function handle(Form $form, ?SavedFormRecord $savedForm): bool
    {
        return $this->service->handleSavedForm($form, $this->integration, $this->field, $this->intent, $savedForm);
    }

    private function form(): Form
    {
        $form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()
            ->onlyMethods(['getId', 'getHandle', 'quickLoad', 'setFinished'])->getMock()
        ;
        $form->method('getId')->willReturn(7);
        $form->method('getHandle')->willReturn('payment');
        $form->setSubmission($this->createStub(Submission::class));

        return $form;
    }

    private function configureApp(Security $security): void
    {
        \Craft::$app = \Yii::$app = new class($this->db, $this->mutex, $security) {
            public function __construct(public Connection $db, private Mutex $mutex, public Security $security) {}

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getMutex(): Mutex
            {
                return $this->mutex;
            }
        };
    }
}

class StripeMetadataTestException extends \RuntimeException {}
