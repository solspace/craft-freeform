<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services\Pro\Payments;

use craft\base\Component;
use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Fields\Pro\Payments\CreditCardDetailsField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Actions\Stripe\SinglePaymentAction;
use Solspace\Freeform\Integrations\PaymentGateways\Actions\Stripe\SubscriptionPaymentIntentAction;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Page;
use Solspace\Freeform\Library\Composer\Components\Properties\PaymentProperties;
use Solspace\Freeform\Library\DataObjects\CustomerDetails;
use Solspace\Freeform\Library\DataObjects\PlanDetails;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Models\IntegrationModel;
use Stripe\Customer;
use Stripe\Error\Card;
use Stripe\Invoice;
use Stripe\PaymentIntent;
use Stripe\Plan;
use Stripe\Subscription;

class StripeService extends Component
{
    const FIELD_GROUP_TYPES = [FieldInterface::TYPE_CHECKBOX_GROUP, FieldInterface::TYPE_RADIO_GROUP];

    /**
     * @param FormValidateEvent $event
     */
    public function preProcessPayment(FormValidateEvent $event)
    {
        $form        = $event->getForm();
        $properties  = $form->getPaymentProperties();
        $paymentType = $properties->getPaymentType();

        if ($paymentType !== PaymentProperties::PAYMENT_TYPE_SINGLE || !$form->isValid()) {
            return;
        }

        $paymentField  = $this->getPaymentField($form);
        $dynamicValues = $this->getDynamicFieldValues($form, $properties);
        $integration   = $this->getIntegrationObjectById($properties);

        $token = $paymentField->getValue();
        if (!$token) {
            return;
        }

        $integration->prepareApi();
        if (strpos($token, 'pm_') === 0) {
            $currency = $dynamicValues[PaymentProperties::FIELD_CURRENCY] ?? $properties->getCurrency();
            $amount   = $dynamicValues[PaymentProperties::FIELD_AMOUNT] ?? $properties->getAmount();
            $amount   = Stripe::toStripeAmount($amount, $currency);

            try {
                $paymentIntent = PaymentIntent::create([
                    'payment_method'      => $token,
                    'amount'              => $amount,
                    'currency'            => $currency,
                    'confirmation_method' => 'manual',
                    'confirm'             => true,
                ]);
            } catch (\Exception $e) {
                $paymentField->setValue('declined');
                return;
            }
        } else {
            $paymentIntent = PaymentIntent::retrieve($token);
        }

        if ($paymentIntent->status === PaymentIntent::STATUS_REQUIRES_ACTION) {
            $form->addAction(new SinglePaymentAction($paymentIntent));
        }

        $paymentField->setValue($paymentIntent->id);
    }

    /**
     * @param FormValidateEvent $event
     *
     * @return bool|void
     */
    public function preProcessSubscription(FormValidateEvent $event)
    {
        $form        = $event->getForm();
        $properties  = $form->getPaymentProperties();
        $paymentType = $properties->getPaymentType();

        $subscriptionTypes = [
            PaymentProperties::PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION,
            PaymentProperties::PAYMENT_TYPE_PREDEFINED_SUBSCRIPTION,
        ];

        if (!in_array($paymentType, $subscriptionTypes, true) || !$form->isValid()) {
            return;
        }

        $paymentField  = $this->getPaymentField($form);
        $dynamicValues = $this->getDynamicFieldValues($form, $properties);
        $integration   = $this->getIntegrationObjectById($properties);

        $token = $paymentField->getValue();
        if (!$token) {
            return;
        }

        $integration->prepareApi();
        $plan  = $this->getPlan($form, $integration, $properties, $dynamicValues);
        if (!$plan) {
            $form->addError('Could not create plan');

            return;
        }

        $subscription = $this->getSubscription($token, $plan, $dynamicValues);
        if ($subscription) {
            $invoice = $this->getInvoice($subscription);

            if ($subscription->status === Subscription::STATUS_INCOMPLETE && $invoice->status === Invoice::STATUS_OPEN) {
                $paymentIntent = $this->getPaymentIntent($invoice);
                if ($paymentIntent->status === PaymentIntent::STATUS_REQUIRES_ACTION) {
                    $form->addAction(new SubscriptionPaymentIntentAction($subscription, $paymentIntent));
                }
            }

            $paymentField->setValue($subscription->id);
        }
    }

    /**
     * Adds honeypot javascript to forms
     *
     * @param FormRenderEvent $event
     */
    public function addFormJavascript(FormRenderEvent $event)
    {
        $form = $event->getForm();

        if ($this->hasPaymentFieldDisplayed($form)) {
            $ffPaymentsPath = \Yii::getAlias('@freeform');

            $variables = $this->getStripeVariables($form);
            $variables = \GuzzleHttp\json_encode($variables);

            $stripeJs = file_get_contents($ffPaymentsPath . '/Resources/js/other/payments/form/stripe-submit.js');
            $stripeJs = preg_replace('/[\'"]#VARIABLES#[\'"]/', $variables, $stripeJs);

            $event->appendJsToOutput($stripeJs);
        }
    }

    /**
     * @param Form $form
     *
     * @return string
     */
    public function getStripeVariables(Form $form): array
    {
        $paymentFields = $form->getLayout()->getPaymentFields();
        $integrationId = $form->getPaymentProperties()->getIntegrationId();

        /** @var IntegrationModel $integration */
        $integration = Freeform::getInstance()->paymentGateways->getIntegrationById($integrationId);

        /** @var Stripe $integrationObject */
        $integrationObject = $integration->getIntegrationObject();

        $values         = $this->getPaymentFieldJSValues($form);
        $props          = $form->getPaymentProperties();
        $isSubscription = $props->getPaymentType() !== PaymentProperties::PAYMENT_TYPE_SINGLE;

        if (count($paymentFields) === 0) {
            return [];
        }

        $paymentField = $paymentFields[0];

        return [
            'id'               => $paymentField->getIdAttribute(),
            'formAnchor'       => $form->getAnchor(),
            'currencySelector' => $values['currencySelector'],
            'currencyFixed'    => $values['currencyFixed'],
            'amountSelector'   => $values['amountSelector'],
            'amountFixed'      => $values['amountFixed'],
            'usage'            => $isSubscription ? 'reusable' : 'single_use',
            'publicKey'        => $integrationObject->getPublicKey(),
        ];
    }

    /**
     * @param Form $form
     *
     * @return array
     */
    private function getPaymentFieldJSValues($form)
    {
        $props          = $form->getPaymentProperties();
        $staticAmount   = $props->getAmount();
        $staticCurrency = $props->getCurrency();
        $mapping        = $props->getPaymentFieldMapping();

        if (!isset($mapping['amount']) && !isset($mapping['currency'])) {
            return [
                'amountSelector'   => null,
                'amountFixed'      => $staticAmount,
                'currencySelector' => null,
                'currencyFixed'    => $staticCurrency,
            ];
        }

        $elementAmount = $elementCurrency = $dynamicAmount = $dynamicCurrency = null;
        //process 3 cases, fixed value, value on same page, value on different page
        $pageFields = $form->getCurrentPage()->getFields();
        foreach ($pageFields as $pageField) {
            if (in_array($pageField->getType(), self::FIELD_GROUP_TYPES, true)) {
                $selector = "[name={$pageField->getHandle()}]:checked";
            } else {
                $selector = "#{$pageField->getIdAttribute()}";
            }

            if (isset($mapping['amount']) && $mapping['amount'] == $pageField->getHandle()) {
                $elementAmount = $selector;
            }

            if (isset($mapping['currency']) && $mapping['currency'] == $pageField->getHandle()) {
                $elementCurrency = $selector;
            }
        }

        if (isset($mapping['amount'])) {
            $dynamicAmount = $form->get($mapping['amount'])->getValue();
        }

        if (isset($mapping['currency'])) {
            $dynamicCurrency = $form->get($mapping['currency'])->getValue();
        }

        return [
            'amountSelector'   => $elementAmount,
            'amountFixed'      => $dynamicAmount ?? $staticAmount,
            'currencySelector' => $elementCurrency,
            'currencyFixed'    => $dynamicCurrency ?? $staticCurrency,
        ];
    }

    /**
     * @param Form $form
     *
     * @return bool
     * @throws \Solspace\Freeform\Library\Exceptions\FreeformException
     */
    private function hasPaymentFieldDisplayed(Form $form): bool
    {
        $paymentFields    = $form->getLayout()->getPaymentFields();
        $hasPaymentFields = count($paymentFields) > 0;

        if (!$hasPaymentFields) {
            return false;
        }

        $paymentField = $paymentFields[0];

        return $this->isFieldOnPage($paymentField, $form->getCurrentPage());
    }

    /**
     * @param AbstractField $field
     * @param Page          $page
     *
     * @return bool
     */
    private function isFieldOnPage(AbstractField $field, Page $page): bool
    {
        $pageFields  = $page->getFields();
        $fieldHandle = $field->getHandle();

        foreach ($pageFields as $pageField) {
            if ($fieldHandle == $pageField->getHandle()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param Form              $form
     * @param PaymentProperties $paymentProperties
     *
     * @return array
     */
    private function getDynamicFieldValues(Form $form, PaymentProperties $paymentProperties): array
    {
        $dynamicValues = [];

        $paymentFieldMapping  = $paymentProperties->getPaymentFieldMapping();
        $customerFieldMapping = $paymentProperties->getCustomerFieldMapping();

        if (\is_array($paymentFieldMapping)) {
            foreach ($paymentFieldMapping as $key => $handle) {
                $field = $form->get($handle);
                if (!$field) {
                    continue;
                }

                $value = $field->getValue();
                if ($value) {
                    $dynamicValues[$key] = $value;
                }
            }
        }

        if (\is_array($customerFieldMapping)) {
            foreach ($customerFieldMapping as $key => $handle) {
                $field = $form->get($handle);
                if (!$field) {
                    continue;
                }

                $value = $field->getValue();
                if ($value) {
                    $dynamicValues[$key] = $value;
                }
            }
        }

        return $dynamicValues;
    }

    /**
     * @param Form              $form
     * @param Stripe            $integration
     * @param PaymentProperties $properties
     * @param array             $dynamicValues
     *
     * @return Plan|null
     */
    private function getPlan(Form $form, Stripe $integration, PaymentProperties $properties, array $dynamicValues)
    {
        if ($properties->getPaymentType() === PaymentProperties::PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION) {
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
            $plan   = $integration->fetchPlan($planId);

            if ($plan === false) {
                return null;
            }

            if (!$plan) {
                $planId = $integration->createPlan($planDetails);
            }

            if ($planId === false) {
                return null;
            }
        } else {
            $planId = $dynamicValues[PaymentProperties::FIELD_PLAN] ?? $properties->getPlan();
        }

        if ($planId) {
            return Plan::retrieve($planId);
        }

        return null;
    }

    /**
     * @param string $token
     * @param Plan   $plan
     * @param array  $dynamicValues
     *
     * @return Subscription|null
     */
    private function getSubscription(string $token, Plan $plan, array $dynamicValues = [])
    {
        $subscription = $customer = null;

        // If we get a card token, we have to create the customer and subscription
        if (0 === strpos($token, 'tok_')) {
            $customerData           = CustomerDetails::fromArray($dynamicValues)->toStripeConstructArray();
            $customerData['source'] = $token;

            $customer = Customer::create($customerData);

            $subscription = Subscription::create([
                'customer' => $customer->id,
                'items'    => [['plan' => $plan->id]],
                'expand'   => ['latest_invoice.payment_intent'],
            ]);
        }

        // If it's a subscription
        if (0 === strpos($token, 'sub_')) {
            $subscription = Subscription::retrieve(
                $token,
                ['expand' => ['latest_invoice.payment_intent']]
            );
        }

        return $subscription;
    }

    /**
     * @param Subscription $subscription
     *
     * @return Invoice
     */
    private function getInvoice(Subscription $subscription): Invoice
    {
        $invoice = $subscription->latest_invoice;
        if (!$invoice instanceof Invoice) {
            $invoice = Invoice::retrieve($invoice, ['expand' => ['payment_intent']]);
        }

        return $invoice;
    }

    /**
     * @param Invoice $invoice
     *
     * @return PaymentIntent
     */
    private function getPaymentIntent(Invoice $invoice): PaymentIntent
    {
        $paymentIntent = $invoice->payment_intent;
        if (!$paymentIntent instanceof PaymentIntent) {
            $paymentIntent = PaymentIntent::retrieve($paymentIntent);
        }

        return $paymentIntent;
    }

    /**
     * @param PaymentProperties $properties
     *
     * @return Stripe
     * @throws IntegrationException
     */
    private function getIntegrationObjectById(PaymentProperties $properties): Stripe
    {
        $paymentGatewayHandler = Freeform::getInstance()->paymentGateways;

        $integration = $paymentGatewayHandler->getIntegrationObjectById($properties->getIntegrationId());
        if ($integration instanceof Stripe) {
            return $integration;
        }

        throw new IntegrationException('Could not get integration');
    }

    /**
     * @param Form $form
     *
     * @return PaymentInterface|CreditCardDetailsField
     * @throws IntegrationException
     */
    private function getPaymentField(Form $form): PaymentInterface
    {
        $paymentFields = $form->getLayout()->getPaymentFields();
        $paymentField  = reset($paymentFields);

        if (!$paymentField) {
            throw new IntegrationException('Could not find a payment field');
        }

        return $paymentField;
    }
}
