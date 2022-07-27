<?php

namespace Solspace\Freeform\controllers;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\PaymentGateways\AbstractPaymentGatewayIntegration;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Resources\Bundles\IntegrationsBundle;
use Solspace\Freeform\Resources\Bundles\MailingListsBundle;
use yii\web\HttpException;
use yii\web\Response;

class PaymentGatewaysController extends BaseController
{
    public function init(): void
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }

        parent::init();
    }

    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $integrations = $this->getPaymentGatewaysService()->getAllIntegrations();
        $providers = $this->getPaymentGatewaysService()->getAllPaymentGatewayServiceProviders();

        \Craft::$app->view->registerAssetBundle(MailingListsBundle::class);

        return $this->renderTemplate(
            'freeform/settings/_payment_gateways',
            [
                'integrations' => $integrations,
                'providers' => $providers,
            ]
        );
    }

    public function actionCreate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $model = IntegrationModel::create(IntegrationRecord::TYPE_PAYMENT_GATEWAY);

        return $this->renderEditForm($model, 'Create new payment gateway');
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $id = \Craft::$app->request->post('id');
        $this->getPaymentGatewaysService()->delete($id);

        return $this->asJson(['success' => true]);
    }

    public function actionEdit(int $id = null, IntegrationModel $model = null): Response
    {
        if (null === $model) {
            $model = $this->getPaymentGatewaysService()->getIntegrationById($id);
        }

        if (!$model) {
            throw new HttpException(
                404,
                Freeform::t(
                    "CRM integration with handle '{ID}' not found",
                    ['ID' => $id]
                )
            );
        }

        return $this->renderEditForm($model, $model->name);
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $post = \Craft::$app->request->post();

        $handle = $post['handle'] ?? null;
        $model = $this->getNewOrExistingPaymentGatewayIntegrationModel($handle);

        $isNewIntegration = !$model->id;

        $postedClass = $post['class'];
        $model->class = $postedClass;

        $postedClassSettings = $post['settings'][$postedClass] ?? [];
        unset($post['settings']);

        $settingBlueprints = $this->getPaymentGatewaysService()->getPaymentGatewaySettingBlueprints($postedClass);

        foreach ($postedClassSettings as $key => $value) {
            $isValueValid = false;

            foreach ($settingBlueprints as $blueprint) {
                if ($blueprint->getHandle() === $key) {
                    $isValueValid = true;

                    break;
                }
            }

            if (!$isValueValid) {
                unset($postedClassSettings[$key]);
            }
        }

        // Adding hidden stored settings to the list
        foreach ($model->getIntegrationObject()->getSettings() as $key => $value) {
            if (!isset($postedClassSettings[$key])) {
                $postedClassSettings[$key] = $value;
            }
        }

        $post['settings'] = $postedClassSettings ?: null;

        $model->setAttributes($post);

        try {
            $model->getIntegrationObject()->onBeforeSave($model);
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        if (!$model->getErrors() && $this->getPaymentGatewaysService()->save($model)) {
            // If it's a new integration - we make the user complete OAuth2 authentication
            if ($isNewIntegration) {
                $model->getIntegrationObject()->initiateAuthentication();
            }

            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Payment Gateway Integration saved'));
            \Craft::$app->session->setFlash('Payment Gateway Integration saved');

            return $this->redirectToPostedUrl($model);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Payment Gateway Integration not saved'));

        return $this->renderEditForm($model, $model->name);
    }

    public function actionCheckIntegrationConnection(): Response
    {
        $id = \Craft::$app->request->post('id');

        /** @var AbstractPaymentGatewayIntegration $integration */
        $integration = $this->getPaymentGatewaysService()->getIntegrationObjectById((int) $id);

        try {
            if ($integration->checkConnection()) {
                return $this->asJson(['success' => true]);
            }

            return $this->asJson(['success' => false]);
        } catch (\Exception $e) {
            return $this->asJson(['success' => false, 'errors' => [$e->getMessage()]]);
        }
    }

    private function renderEditForm(IntegrationModel $model, string $title): Response
    {
        $this->view->registerAssetBundle(IntegrationsBundle::class);

        if (\Craft::$app->request->getParam('code')) {
            $response = $this->handleAuthorization($model);

            if (null !== $response) {
                return $response;
            }
        }

        $serviceProviderTypes = $this->getPaymentGatewaysService()->getAllPaymentGatewayServiceProviders();
        $settingBlueprints = $this->getPaymentGatewaysService()->getAllPaymentGatewaySettingBlueprints();

        $variables = [
            'integration' => $model,
            'blockTitle' => $title,
            'serviceProviderTypes' => $serviceProviderTypes,
            'continueEditingUrl' => 'freeform/settings/payment-gateways/{handle}',
            'settings' => $settingBlueprints,
            'webhookUrl' => $model->id ? $model->getIntegrationObject()->getWebhookUrl() : '',
        ];

        return $this->renderTemplate('freeform/settings/_payment_gateway_edit', $variables);
    }

    private function getNewOrExistingPaymentGatewayIntegrationModel(string $handle): IntegrationModel
    {
        $paymentGateway = $this->getPaymentGatewaysService()->getIntegrationByHandle($handle);

        if (!$paymentGateway) {
            $paymentGateway = IntegrationModel::create(IntegrationRecord::TYPE_PAYMENT_GATEWAY);
        }

        return $paymentGateway;
    }
}
