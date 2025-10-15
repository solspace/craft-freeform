<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Controllers;

use Psr\Log\LoggerInterface;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePaymentService;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use yii\web\Response;

class MollieWebhookController extends BaseMollieController
{
    private const SUPPORTED_STATUSES = [
        'paid',
        'failed',
        'canceled',
        'expired',
    ];

    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = ['index'];
    private LoggerInterface $logger;

    public function __construct(
        $id,
        $module,
        $config,
        IntegrationLoggerProvider $loggerProvider,
        private IntegrationClientProvider $clientProvider,
    ) {
        parent::__construct($id, $module, $config);
        $this->logger = $loggerProvider->getLogger(Mollie::class);
    }

    public function actionIndex($id = null): Response
    {
        $this->requirePostRequest();

        $request = \Craft::$app->getRequest();
        $rawBody = $request->getRawBody();
        $signature = $request->getHeaders()->get('X-Mollie-Signature');
        $signatureValue = $signature ? preg_replace('/^sha256=/', '', (string) $signature) : null;

        if (empty($rawBody)) {
            return $this->asEmptyResponse(400);
        }

        try {
            $paymentId = $this->extractPaymentId($request, $rawBody);
            if (!$paymentId) {
                return $this->asEmptyResponse(400);
            }

            $record = PaymentRecord::findOne(['resourceId' => $paymentId]);
            if (!$record || !$record->integrationId) {
                return $this->asEmptyResponse(400);
            }

            $integration = Freeform::getInstance()->integrations->getIntegrationObjectById((int) $record->integrationId);
            if (!$integration instanceof Mollie) {
                return $this->asEmptyResponse(400);
            }

            // Ensure the integration is authorized before making SDK calls
            $this->clientProvider->getAuthorizedClient($integration);
            $paymentService = new MolliePaymentService($integration);

            if (!$this->verifyWebhookSignature($paymentService, $signatureValue, $rawBody)) {
                return $this->asEmptyResponse(401);
            }

            $payment = $paymentService->getPayment($paymentId);
            $status = $payment['status'] ?? 'unknown';

            if (!\in_array($status, self::SUPPORTED_STATUSES, true)) {
                return $this->asEmptyResponse();
            }

            return $this->processPaymentStatus($payment, $status);
        } catch (IntegrationException $e) {
            $this->logger->error('Mollie webhook processing error', [
                'error' => $e->getMessage(),
                'payload' => $rawBody,
            ]);

            return $this->asSerializedJson(['error' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            $this->logger->error('Unexpected webhook error', [
                'error' => $e->getMessage(),
                'payload' => $rawBody,
            ]);

            return $this->asSerializedJson(['error' => 'Internal server error'], 500);
        }
    }

    private function verifyWebhookSignature(MolliePaymentService $paymentService, ?string $signatureValue, string $rawBody): bool
    {
        if (!$signatureValue) {
            return true; // Skip verification if no signature provided
        }

        if (!$paymentService->verifyWebhookSignature($rawBody, $signatureValue)) {
            $this->logger->error('Invalid webhook signature received');

            return false;
        }

        return true;
    }

    private function extractPaymentId($request, string $rawBody): ?string
    {
        $paymentId = $request->getBodyParam('id');
        if (!$paymentId) {
            $webhookData = json_decode($rawBody, true);
            $paymentId = \is_array($webhookData) ? ($webhookData['id'] ?? null) : null;
        }

        return $paymentId;
    }

    private function processPaymentStatus(array $payment, string $status): Response
    {
        $paymentId = $payment['id'] ?? null;
        if (!$paymentId) {
            return $this->asEmptyResponse(400);
        }

        try {
            if ('paid' === $status) {
                $this->processPaidPayment($payment);
            } else {
                $this->updatePaymentStatus($paymentId, $status);
            }

            return $this->asEmptyResponse();
        } catch (\Exception $e) {
            $this->logger->error("Failed to process {$status} payment", [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return $this->asSerializedJson(['error' => 'Payment processing failed'], 500);
        }
    }

    private function processPaidPayment(array $payment): void
    {
        $paymentId = $payment['id'] ?? null;
        if (!$paymentId) {
            throw new \Exception('Payment missing ID');
        }

        $submission = $this->findSubmissionByPaymentId($paymentId);
        if (!$submission) {
            throw new \Exception('Submission not found for payment');
        }

        $form = Freeform::getInstance()->forms->getFormById($submission->formId);
        if (!$form) {
            throw new \Exception('Form not found for submission');
        }

        $this->updatePaymentRecord($payment, $submission, $form);
        $form->setSubmission($submission);
        $this->updatePaymentFieldValue($form, $submission, $paymentId);

        $submissionsService = Freeform::getInstance()->submissions;
        $submissionsService->storeSubmission($form, $submission);
        $submissionsService->postProcessSubmission($form, $submission);
    }

    private function findSubmissionByPaymentId(string $paymentId): ?Submission
    {
        $paymentRecord = PaymentRecord::findOne(['resourceId' => $paymentId]);
        if (!$paymentRecord || !$paymentRecord->submissionId) {
            return null;
        }

        return Freeform::getInstance()->submissions->getSubmissionById((int) $paymentRecord->submissionId);
    }

    private function updatePaymentRecord(array $payment, $submission, $form): void
    {
        $paymentId = $payment['id'] ?? '';
        $amountValue = (string) ($payment['amount']['value'] ?? '0');
        $currency = (string) ($payment['amount']['currency'] ?? 'EUR');
        $amount = (float) $amountValue; // store as major units, consistent with FinalizePayment

        $record = PaymentRecord::findOne(['resourceId' => $paymentId]) ?? new PaymentRecord();

        $record->submissionId = $submission->id;
        $record->resourceId = $paymentId;
        $record->type = 'payment';
        $record->currency = strtoupper($currency);
        $record->amount = $amount;
        $record->status = (string) ($payment['status'] ?? 'paid');
        $record->metadata = json_encode([
            'type' => ($payment['method'] ?? 'card'),
            'details' => ($payment['details'] ?? null),
            'method' => ($payment['method'] ?? null),
        ]);

        // Set field and integration IDs if not already set
        if (!$record->fieldId) {
            $field = $form->getLayout()->getFields()->getByType(MollieField::class)[0] ?? null;
            if ($field) {
                $record->fieldId = $field->getId();
            }
        }

        if (!$record->integrationId) {
            $integration = Freeform::getInstance()->integrations->getFirstForForm($form, Mollie::class);
            if ($integration) {
                $record->integrationId = $integration->getId();
            }
        }

        $record->save(false);
    }

    private function updatePaymentFieldValue($form, $submission, string $paymentId): void
    {
        try {
            $paymentField = $form->getLayout()->getFields()->getByType(MollieField::class)[0] ?? null;
            if ($paymentField) {
                $submission->setFormFieldValue($paymentField, $paymentId);
            }
        } catch (\Throwable $e) {
            $this->logger->warning('Failed to update payment field value', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function updatePaymentStatus(string $paymentId, string $paymentStatus): void
    {
        $this->updateRecordStatus($paymentId, $paymentStatus);
        $this->updateSubmissionStatusByPaymentId($paymentId, 'failed');
    }

    private function updateRecordStatus(string $paymentId, string $status): void
    {
        if (!$paymentId) {
            return;
        }

        $record = PaymentRecord::findOne(['resourceId' => $paymentId]);
        if ($record) {
            $record->status = $status;
            $record->save(false);
        }
    }

    private function updateSubmissionStatusByPaymentId(string $paymentId, string $statusHandle): void
    {
        if (!$paymentId) {
            return;
        }

        $record = PaymentRecord::findOne(['resourceId' => $paymentId]);
        if (!$record || !$record->submissionId) {
            return;
        }

        $submission = Freeform::getInstance()->submissions->getSubmissionById((int) $record->submissionId);
        if (!$submission) {
            return;
        }

        $status = Freeform::getInstance()->statuses->getStatusByHandle($statusHandle);
        if ($status) {
            $submission->statusId = $status->id;
            \Craft::$app->getElements()->saveElement($submission, false);
        }
    }
}
