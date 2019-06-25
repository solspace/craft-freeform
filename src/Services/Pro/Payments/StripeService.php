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
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Page;
use Solspace\Freeform\Library\Composer\Components\Properties\PaymentProperties;

class StripeService extends Component
{
    const FIELD_GROUP_TYPES = [FieldInterface::TYPE_CHECKBOX_GROUP, FieldInterface::TYPE_RADIO_GROUP];

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
        $integration   = Freeform::getInstance()->paymentGateways->getIntegrationById($integrationId);

        $values         = $this->getPaymentFieldJSValues($form);
        $props          = $form->getPaymentProperties();
        $isSubscription = $props->getPaymentType() !== PaymentProperties::PAYMENT_TYPE_SINGLE;

        if (count($paymentFields) === 0) {
            return [];
        }

        $paymentField = $paymentFields[0];

        return [
            'zeroDecimalCurrencies' => Stripe::ZERO_DECIMAL_CURRENCIES,
            'id'                    => $paymentField->getIdAttribute(),
            'formAnchor'            => $form->getAnchor(),
            'currencySelector'      => $values['currencySelector'],
            'currencyFixed'         => $values['currencyFixed'],
            'usage'                 => $isSubscription ? 'reusable' : 'single_use',
            'amountSelector'        => $values['amountSelector'],
            'amountFixed'           => $values['amountFixed'],
            'publicKey'             => $integration->getIntegrationObject()->getPublicKey(),
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
            'amountSelector'   => $elementAmount ?? $dynamicAmount ?? null,
            'amountFixed'      => $elementAmount || $dynamicAmount ? null : $staticAmount,
            'currencySelector' => $elementCurrency ?? $dynamicCurrency ?? $staticCurrency,
            'currencyFixed'    => $elementCurrency || $dynamicCurrency ? null : $staticCurrency,
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
}
