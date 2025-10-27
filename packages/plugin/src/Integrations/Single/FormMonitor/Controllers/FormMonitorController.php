<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\Controllers;

use craft\db\Query;
use GuzzleHttp\Exception\BadResponseException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\ServerException;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use Solspace\Freeform\Services\LoggerService;
use yii\db\Exception;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class FormMonitorController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FormsService $formsService,
        private FormIntegrationsProvider $formIntegrationsProvider,
        private IntegrationClientProvider $clientProvider,
        private LoggerService $loggerService,
        private IntegrationsService $integrationsService,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionAvailableForms(): Response
    {
        $formIds = (new Query())
            ->select('fi.[[formId]]')
            ->from(FormIntegrationRecord::TABLE.' fi')
            ->innerJoin(IntegrationRecord::TABLE.' i', 'fi.[[integrationId]] = i.[[id]]')
            ->where([
                'i.[[class]]' => FormMonitor::class,
                'fi.[[enabled]]' => true,
            ])
            ->column()
        ;

        return $this->asJson($formIds);
    }

    public function actionTests(?int $id = null): Response
    {
        $form = $this->formsService->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $formMonitor = $this->formIntegrationsProvider->getFirstForForm($form, FormMonitor::class);
        if (!$formMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($formMonitor);

        $request = \Craft::$app->getRequest();
        $limit = (int) $request->getQueryParam('limit', 100);
        $offset = (int) $request->getQueryParam('offset', 0);
        $sort = $request->getQueryParam('sort', 'desc');

        try {
            $tests = $formMonitor->fetchTests($client, $form, [
                'limit' => $limit,
                'offset' => $offset,
                'sort' => $sort,
            ]);
        } catch (\Exception $e) {
            $message = ($e instanceof ConnectException || $e instanceof ServerException)
                ? 'Cannot connect to the Form Monitor service at this time. Please try again later.'
                : $e->getMessage();

            $this
                ->loggerService
                ->getLogger('Form Monitor')
                ->error($message)
            ;

            return $this->asJson([
                'error' => [
                    'message' => $message,
                    'exception' => $e::class,
                ],
            ]);
        }

        return $this->asJson($tests);
    }

    public function actionDeleteTest(?int $id = null, ?int $testId = null): Response
    {
        $form = $this->formsService->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $formMonitor = $this->formIntegrationsProvider->getFirstForForm($form, FormMonitor::class);
        if (!$formMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($formMonitor);

        try {
            $formMonitor->deleteTest($client, $form, $testId);

            return $this->asJson(['success' => true]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            throw $exception;
        }
    }

    public function actionStats(?int $id = null): Response
    {
        $form = $this->formsService->getFormById($id);
        $integration = $this->formIntegrationsProvider->getFirstForForm($form, FormMonitor::class);

        $isEnabled = $integration && $integration->isEnabled();

        if ($isEnabled) {
            try {
                $client = $this->clientProvider->getAuthorizedClient($integration);
                $stats = $integration->fetchStats($client, $form);

                return $this->asJson($stats);
            } catch (\Exception $e) {
                $isConnectException = $e instanceof ConnectException || $e instanceof ServerException;
                $message = 'Error';

                if ($isConnectException) {
                    $message = 'Cannot connect';
                }

                $this->loggerService
                    ->getLogger('Form Monitor')
                    ->error($isConnectException ? 'Cannot connect to the Form Monitor service at this time. Please try again later.' : $e->getMessage())
                ;

                return $this->asJson([
                    'enable' => true,
                    'error' => [
                        'message' => $message,
                        'exception' => $e::class,
                    ],
                ]);
            }
        }

        return $this->asJson([
            'enabled' => false,
        ]);
    }

    public function actionEnable(?int $id = null): Response
    {
        $form = $this->formsService->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $formMonitor = $this->formIntegrationsProvider->getFirstForForm($form, FormMonitor::class);
        if (!$formMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($formMonitor);

        try {
            $formMonitor->enableMonitoring($client, $form);

            return $this->asJson(['success' => true]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            throw $exception;
        }
    }

    public function actionDisable(?int $id = null): Response
    {
        $form = $this->formsService->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $formMonitor = $this->formIntegrationsProvider->getFirstForForm($form, FormMonitor::class);
        if (!$formMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($formMonitor);

        try {
            $formMonitor->disableManifest($client, $form);

            return $this->asJson(['success' => true]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            throw $exception;
        }
    }

    public function actionDisableAndClear(?int $id = null): Response
    {
        $form = $this->formsService->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $formMonitor = $this->formIntegrationsProvider->getFirstForForm($form, FormMonitor::class);
        if (!$formMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($formMonitor);

        try {
            $record = FormIntegrationRecord::find()
                ->where([
                    'formId' => $form->getId(),
                    'integrationId' => $formMonitor->getId(),
                ])
                ->one()
            ;

            if ($record) {
                $record->enabled = false;
                $record->save();
            }

            $formMonitor->deleteManifest($client, $form);

            return $this->asJson(['success' => true]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            throw $exception;
        }
    }

    public function actionClearAllTests(?int $id = null): Response
    {
        $form = $this->formsService->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $formMonitor = $this->formIntegrationsProvider->getFirstForForm($form, FormMonitor::class);
        if (!$formMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($formMonitor);

        try {
            $formMonitor->clearAllTests($client, $form);

            return $this->asJson(['success' => true]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            throw $exception;
        }
    }

    public function actionDisableMe(): Response
    {
        try {
            $formMonitor = $this->getFormMonitor();
            $client = $this->clientProvider->getAuthorizedClient($formMonitor);
            $formMonitor->disableMe($client);

            return $this->asJson(['success' => true]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            throw $exception;
        }
    }

    public function actionDeleteMe(): Response
    {
        try {
            $formMonitor = $this->getFormMonitor();
            $client = $this->clientProvider->getAuthorizedClient($formMonitor);
            $formMonitor->deleteMe($client);

            if (method_exists($formMonitor, 'getId')) {
                $this->integrationsService->delete($formMonitor->getId());
            }

            return $this->asJson(['success' => true]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            throw $exception;
        }
    }

    /**
     * @throws IntegrationNotFoundException
     * @throws Exception
     * @throws NotFoundHttpException
     */
    private function getFormMonitor(): IntegrationInterface
    {
        $record = IntegrationRecord::find()
            ->where(['class' => FormMonitor::class])
            ->one()
        ;

        if (!$record) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $record->enabled = false;
        $record->save();

        $model = $this->integrationsService->getById($record->id);
        if (!$model) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        return $model->getIntegrationObject();
    }
}
