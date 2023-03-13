<?php

namespace Solspace\Freeform\Bundles\Integrations\Payments;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Fields\Implementations\Pro\Payments\CreditCardDetailsField;
use Solspace\Freeform\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Properties\PaymentProperties;
use Solspace\Freeform\Library\DataObjects\CustomerDetails;
use Solspace\Freeform\Library\DataObjects\PaymentDetails;
use Solspace\Freeform\Library\DataObjects\SubscriptionDetails;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\AbstractPaymentGatewayIntegration;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegrationInterface;
use yii\base\Event;

class PaymentsBundle extends FeatureBundle
{
    public function __construct()
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'handlePayments']
        );
    }

    public static function getPriority(): int
    {
        return 900;
    }

    public function handlePayments(ProcessSubmissionEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $submission = $event->getSubmission();

        if (!$this->processPayments($submission)) {
            $event->isValid = false;
        }
    }

    /**
     * Makes all payment related processing of the submission, like making payments, creating subscriptions etc.
     *
     * @param Submission $submission saved submission
     */
    private function processPayments(Submission $submission): bool
    {
        $form = $submission->getForm();
        $paymentFields = $form->getLayout()->getFields(PaymentInterface::class);
        if (!$paymentFields || 0 === \count($paymentFields) || $form->getSuppressors()->isPayments()) {
            return true; // no payment fields, so no processing needed
        }

        // atm we support only single payment field

        if (!$submission->getId()) {
            // TODO: add to string constants? translate?
            $submission->addError($submission->getFieldColumnName($paymentFields[0]->getId()), 'Can\'t process payments for unsaved submission!');
            $paymentFields[0]->addError('Can\'t process payments for unsaved submission!');

            return false;
        }

        $paymentGatewayHandler = Freeform::getInstance()->paymentGateways;
        $properties = $form->getPaymentProperties();

        foreach ($paymentFields as $field) {
            /** @var PaymentGatewayIntegrationInterface $integration */
            $integration = $paymentGatewayHandler->getIntegrationObjectById($properties->getIntegrationId());

            /** @var CreditCardDetailsField $field */
            $field = $submission->{$field->getHandle()};

            $paymentType = $properties->getPaymentType();
            $paymentFieldMapping = $properties->getPaymentFieldMapping();
            $customerFieldMapping = $properties->getCustomerFieldMapping();
            $dynamicValues = [];

            if (\is_array($paymentFieldMapping)) {
                foreach ($paymentFieldMapping as $key => $handle) {
                    $value = $submission->{$handle}->getValue();
                    if ($value) {
                        $dynamicValues[$key] = $value;
                    }
                }
            }

            if (\is_array($customerFieldMapping)) {
                foreach ($customerFieldMapping as $key => $handle) {
                    $value = $submission->{$handle}->getValue();
                    if ($value) {
                        $dynamicValues[$key] = $value;
                    }
                }
            }

            $token = $field->getValue();

            $result = false;

            switch ($paymentType) {
                case PaymentProperties::PAYMENT_TYPE_SINGLE:
                    $customer = CustomerDetails::fromArray($dynamicValues);
                    $paymentDetails = new PaymentDetails($token, $submission, $customer);
                    $result = $integration->processPayment($paymentDetails, $properties);

                    break;

                case PaymentProperties::PAYMENT_TYPE_PREDEFINED_SUBSCRIPTION:
                case PaymentProperties::PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION:
                    $subscriptionDetails = new SubscriptionDetails($token, $submission);
                    $result = $integration->processSubscription($subscriptionDetails, $properties);

                    break;
            }

            if (false === $result) {
                $this->applyPaymentErrors($submission, $integration);

                return false;
            }
        }

        return true;
    }

    /**
     * Gets last error from integration and adds it to submission element.
     *
     * @param Submission $submission
     */
    private function applyPaymentErrors($submission, AbstractPaymentGatewayIntegration $integration)
    {
        $error = $integration->getLastError();
        $submission->addError($error->getMessage());

        $suppress = $integration->isSuppressOnFail();

        if ((bool) $suppress) {
            $submission->getForm()->enableSuppression();
        }
    }
}
