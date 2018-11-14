<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace: Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https:   //solspace.com/craft/freeform
 * @license       https:   //solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\base\Component;
use craft\db\Query;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\MailingListField;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Library\DataObjects\PaymentDetails;
use Solspace\Freeform\Library\DataObjects\PlanDetails;
use Solspace\Freeform\Library\DataObjects\SubscriptionDetails;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\PaymentGateways\AbstractPaymentGatewayIntegration;
use Solspace\Freeform\Library\Integrations\PaymentGateways\PaymentGatewayIntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Models\IntegrationsQueueModel;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Records\IntegrationsQueueRecord;
use Solspace\FreeformPayments\Fields\CreditCardDetailsField;
use Solspace\Freeform\Library\Composer\Components\Properties\PaymentProperties;
use Solspace\Freeform\Library\DataObjects\CustomerDetails;

class IntegrationsService extends BaseService
{
    /**
     * @return IntegrationModel[]
     * @throws \Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException
     */
    public function getAllIntegrations(): array
    {
        $results = $this->getQuery()->all();

        $models = [];
        foreach ($results as $result) {
            $model = $this->createIntegrationModel($result);

            try {
                $model->getIntegrationObject();
                $models[] = $model;
            } catch (IntegrationNotFoundException $e) {
            }
        }

        return $models;
    }

    /**
     * Pushes all emails to their respective mailing lists, if applicable
     * Does nothing otherwise
     *
     * @param Submission $submission
     * @param AbstractField[] $fields
     */
    public function pushToMailingLists(Submission $submission, array $fields)
    {
        $form = $submission->getForm();
        $mailingListHandler = Freeform::getInstance()->mailingLists;

        foreach ($fields as $field) {
            try {
                $emailField = $form->getLayout()->getFieldByHash($field->getEmailFieldHash());

                // TODO: Log any errors that happen
                $integration = $mailingListHandler->getIntegrationObjectById($field->getIntegrationId());
                $mailingList = $mailingListHandler->getListById($integration, $field->getResourceId());

                /** @var FieldObject[] $mailingListFieldsByHandle */
                $mailingListFieldsByHandle = [];
                foreach ($mailingList->getFields() as $mailingListField) {
                    $mailingListFieldsByHandle[$mailingListField->getHandle()] = $mailingListField;
                }

                $emailList = $submission->{$emailField->getHandle()}->getValue();
                if ($emailList) {
                    $mappedValues = [];
                    if ($field->getMapping()) {
                        foreach ($field->getMapping() as $key => $handle) {
                            if (!isset($mailingListFieldsByHandle[$key])) {
                                continue;
                            }

                            $mailingListField = $mailingListFieldsByHandle[$key];

                            $convertedValue = $integration->convertCustomFieldValue(
                                $mailingListField,
                                $submission->{$handle}->getValue()
                            );

                            $mappedValues[$key] = $convertedValue;
                        }
                    }

                    $mailingList->pushEmailsToList($emailList, $mappedValues);
                    $mailingListHandler->flagIntegrationForUpdating($integration);
                }
            } catch (FreeformException $exception) {
                continue;
            }
        }
    }

    /**
     * Send out any email notifications
     *
     * @param Submission $submission
     */
    public function sendOutEmailNotifications(Submission $submission = null)
    {
        $mailer = Freeform::getInstance()->mailer;
        $form = $submission->getForm();
        $fields = $form->getLayout()->getFields();
        $adminNotifications = $form->getAdminNotificationProperties();

        if ($adminNotifications->getNotificationId()) {
            $mailer->sendEmail(
                $form,
                $adminNotifications->getRecipientArray(),
                $adminNotifications->getNotificationId(),
                $fields,
                $submission
            );
        }

        $recipientFields = $form->getLayout()->getRecipientFields();

        foreach ($recipientFields as $field) {
            $mailer->sendEmail(
                $form,
                $submission->{$field->getHandle()}->getRecipients(),
                $field->getNotificationId(),
                $fields,
                $submission
            );
        }

        $dynamicRecipients = $form->getDynamicNotificationData();
        if ($dynamicRecipients && $dynamicRecipients->getRecipients()) {
            $mailer->sendEmail(
                $form,
                $dynamicRecipients->getRecipients(),
                $dynamicRecipients->getTemplate(),
                $fields,
                $submission
            );
        }
    }

    /**
     * Push the submitted data to the mapped fields of a CRM integration
     *
     * @param Submission $submission
     */
    public function pushToCRM(Submission $submission)
    {
        Freeform::getInstance()->crm->pushObject($submission);
    }

    /**
     * Makes all payment related processing of the submission, like making payments, creating subscriptions etc.
     *
     * @param Submission $submission saved submission
     * @return bool
     */
    public function processPayments(Submission $submission)
    {
        $form = $submission->getForm();
        $paymentFields = $form->getLayout()->getPaymentFields();
        if (!$paymentFields || \count($paymentFields) === 0) {
            return true; //no payment fields, so no processing needed
        }

        //atm we support only single payment field

        if (!$submission->getId()) {
            //TODO: add to string constants? translate?
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

            $paymentType          = $properties->getPaymentType();
            $paymentFieldMapping  = $properties->getPaymentFieldMapping();
            $customerFieldMapping = $properties->getCustomerFieldMapping();
            $dynamicValues = array();

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
            $customer = CustomerDetails::fromArray($dynamicValues);
            $token    = $field->getValue();

            $result = false;
            switch ($paymentType) {
                case PaymentProperties::PAYMENT_TYPE_SINGLE:
                    $currency       = $dynamicValues[PaymentProperties::FIELD_CURRENCY] ?? $properties->getCurrency();
                    $amount         = (float) ($dynamicValues[PaymentProperties::FIELD_AMOUNT] ?? $properties->getAmount());
                    $paymentDetails = new PaymentDetails($token, $amount, $currency, $submission->getId(), $customer);
                    $result         = $integration->processPayment($paymentDetails, $properties);

                    break;

                case PaymentProperties::PAYMENT_TYPE_PREDEFINED_SUBSCRIPTION:
                    $planId              = $dynamicValues[PaymentProperties::FIELD_PLAN] ?? $properties->getPlan();
                    $subscriptionDetails = new SubscriptionDetails($token, $planId, $submission->getId(), $customer);
                    $result = $integration->processSubscription($subscriptionDetails, $properties);

                    break;

                case PaymentProperties::PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION:
                    $currency    = $dynamicValues[PaymentProperties::FIELD_CURRENCY] ?? $properties->getCurrency();
                    $amount      = (float) ($dynamicValues[PaymentProperties::FIELD_AMOUNT] ?? $properties->getAmount());
                    $interval    = $dynamicValues[PaymentProperties::FIELD_INTERVAL] ?? $properties->getInterval();
                    $planDetails = new PlanDetails(
                        null,
                        $amount,
                        $currency,
                        $interval,
                        $form->getName(),
                        $form->getHandle()
                    );

                    $planId = $planDetails->getId();
                    $plan = $integration->fetchPlan($planId);

                    if ($plan === false) {
                        $this->applyPaymentErrors($submission, $integration);

                        return false;
                    }

                    if (!$plan) {
                        $planId = $integration->createPlan($planDetails);
                    }

                    if ($planId === false) {
                        $this->applyPaymentErrors($submission, $integration);

                        return false;
                    }

                    $subscriptionDetails = new SubscriptionDetails($token, $planId, $submission->getId(), $customer);
                    $result              = $integration->processSubscription($subscriptionDetails, $properties);

                    break;
            }

            if ($result === false) {
                $this->applyPaymentErrors($submission, $integration);

                return false;
            }
        }

        return true;
    }

    /**
     * Gets last error from integration and adds it to submission element
     *
     * @param Submission $submission
     * @param AbstractPaymentGatewayIntegration $integration
     * @return void
     */
    protected function applyPaymentErrors($submission, $integration) {
        $error = $integration->getLastError();
        $submission->addError($error->getMessage());
    }

    /**
     * @return Query
     */
    protected function getQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'integration.id',
                    'integration.name',
                    'integration.handle',
                    'integration.type',
                    'integration.class',
                    'integration.accessToken',
                    'integration.settings',
                    'integration.forceUpdate',
                    'integration.lastUpdate',
                ]
            )
            ->from(IntegrationRecord::TABLE . ' integration')
            ->orderBy(['id' => SORT_ASC]);
    }

    /**
     * @param array $data
     *
     * @return IntegrationModel
     */
    protected function createIntegrationModel(array $data): IntegrationModel
    {
        $model = new IntegrationModel($data);

        $model->lastUpdate  = new \DateTime($model->lastUpdate);
        $model->forceUpdate = (bool) $model->forceUpdate;
        $model->settings    = $model->settings ? json_decode($model->settings, true) : [];

        return $model;
    }
}
