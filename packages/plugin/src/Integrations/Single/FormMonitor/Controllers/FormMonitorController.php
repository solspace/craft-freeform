<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\Controllers;

use craft\db\Query;
use craft\helpers\App;
use craft\mail\transportadapters\Sendmail;
use GuzzleHttp\Exception\BadResponseException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\ServerException;
use Solspace\Freeform\Bundles\Form\Submissions\FakeDataProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\MailerService;
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
        private MailerService $mailerService,
        private NotificationTemplateProvider $notificationTemplateProvider,
        private NotificationLoggerProvider $notificationLoggerProvider,
        private FakeDataProvider $fakeDataProvider,
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
            $settingsService = Freeform::getInstance()->get('settings');

            if ($settingsService->isManagedPingerEnabled()) {
                $settingsService->disablePinging();
            }
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
            $settingsService = Freeform::getInstance()->get('settings');

            if ($settingsService->isManagedPingerEnabled()) {
                $settingsService->disablePinging();
            }
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

    public function actionSendTestEmail(): Response
    {
        $formId = (int) $this->request->post('formId');
        if (!$formId) {
            return $this->asJson(['error' => 'Form ID is required'], 400);
        }

        $form = $this->formsService->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        // For test emails we only need any enabled Form Monitor integration (customer-level),
        // not necessarily one attached/enabled for this specific form.
        $record = IntegrationRecord::find()
            ->where(['class' => FormMonitor::class, 'enabled' => true])
            ->one()
        ;

        if (!$record) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $formMonitorModel = $this->integrationsService->getById($record->id);
        if (!$formMonitorModel) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $formMonitor = $formMonitorModel->getIntegrationObject();
        if (!$formMonitor instanceof FormMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($formMonitor);

        try {
            // Call Form Monitor API to register test email and get token (customer-level)
            $result = $formMonitor->sendTestEmail($client);

            if (!isset($result['testToken'])) {
                return $this->asJson(['error' => 'Failed to get test token from Form Monitor'], 500);
            }

            $testToken = $result['testToken'];

            // Generate fake submission data
            $fakeData = $this->fakeDataProvider->generate($form, $this->request->getPreferredLanguage());
            $form->setFieldValues($fakeData);

            $submission = new Submission([
                'id' => 123456,
                'incrementalId' => 123,
                'uid' => '12345678-1234-1234-1234-123456789012',
                'token' => 'test-token-'.sha1(uniqid()),
                'formId' => $form->getId(),
                'userId' => \Craft::$app->getUser()->getId(),
                'ip' => '127.0.0.1',
                'dateCreated' => new \DateTime(),
                'statusId' => $form->getSettings()->getGeneral()->defaultStatus,
            ]);
            $submission->title = Submission::generateTitle($submission, $form);
            $submission->setFormFieldValues($fakeData, true);
            $form->setSubmission($submission);

            // Build a simple dummy notification template for the test email
            $notificationTemplate = new NotificationTemplate();
            $notificationTemplate->id = 'form-monitor-test';
            $notificationTemplate->uid = 'form-monitor-test';
            $notificationTemplate->formId = $form->getId();
            $notificationTemplate->handle = 'form-monitor-test';
            $notificationTemplate->name = 'Form Monitor Test Email';
            $notificationTemplate->description = 'Simple test email used by Form Monitor.';

            // Use Freeform email defaults (same as NotificationTemplateRecord::create())
            $settingsModel = Freeform::getInstance()->settings->getSettingsModel();
            $notificationTemplate->fromEmail = $settingsModel->defaultFromEmail ?: '{{ general.systemEmail }}';
            $notificationTemplate->fromName = $settingsModel->defaultFromName ?: '{{ general.systemName }}';
            $notificationTemplate->subject = 'Form Monitor Test Email';
            $notificationTemplate->body = 'This is a test email sent by Form Monitor for the form \"'.$form->getName().'\".';
            $notificationTemplate->textBody = $notificationTemplate->body;
            $notificationTemplate->autoText = false;
            $notificationTemplate->includeAttachments = false;
            $notificationTemplate->presetAssets = [];

            $logger = $this->notificationLoggerProvider->getLogger($notificationTemplate, $form);

            // Send email with test token header
            $headers = [
                'X-Form-Monitor' => 'true',
                'X-Form-Monitor-Form-Id' => (string) $form->getId(),
                'X-Form-Monitor-Submission-Id' => (string) $submission->getId(),
                'X-Form-Monitor-Request-Id' => 'test-'.uniqid(),
                'X-Form-Monitor-Notification-Type' => 'email',
                'X-Form-Monitor-Test-Email-Token' => $testToken,
            ];

            $isSent = $this->mailerService->sendEmail(
                $form,
                RecipientCollection::fromArray(['inbound@test.formmonitor.com']),
                $notificationTemplate,
                $submission,
                $headers,
                logger: $logger,
            );

            if (!$isSent) {
                return $this->asJson(['error' => 'Failed to send test email'], 500);
            }

            return $this->asJson([
                'success' => true,
                'testToken' => $testToken,
            ]);
        } catch (BadResponseException $exception) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error((string) $exception->getResponse()->getBody())
            ;

            return $this->asJson([
                'error' => [
                    'message' => 'Failed to send test email',
                    'details' => (string) $exception->getResponse()->getBody(),
                ],
            ], $exception->getResponse()->getStatusCode());
        } catch (\Exception $e) {
            $this->loggerService
                ->getLogger('Form Monitor')
                ->error($e->getMessage())
            ;

            return $this->asJson([
                'error' => [
                    'message' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function actionTestEmailHistory(): Response
    {
        // Get any Form Monitor integration to use for API calls (customer-level)
        $record = IntegrationRecord::find()
            ->where(['class' => FormMonitor::class, 'enabled' => true])
            ->one()
        ;

        if (!$record) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $formMonitorModel = $this->integrationsService->getById($record->id);
        if (!$formMonitorModel) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $integration = $formMonitorModel->getIntegrationObject();
        if (!$integration instanceof FormMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($integration);

        $request = \Craft::$app->getRequest();
        $limit = (int) $request->getQueryParam('limit', 5);
        $offset = (int) $request->getQueryParam('offset', 0);

        try {
            $history = $integration->getTestEmailHistory($client, [
                'limit' => $limit,
                'offset' => $offset,
            ]);

            return $this->asJson($history);
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
    }

    public function actionTestEmailStatus(): Response
    {
        $testToken = $this->request->getQueryParam('token');
        if (!$testToken) {
            return $this->asJson(['error' => 'Test token is required'], 400);
        }

        // Get any Form Monitor integration to use for API calls
        $record = IntegrationRecord::find()
            ->where(['class' => FormMonitor::class, 'enabled' => true])
            ->one()
        ;

        if (!$record) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $formMonitor = $this->integrationsService->getById($record->id);
        if (!$formMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $integration = $formMonitor->getIntegrationObject();
        if (!$integration instanceof FormMonitor) {
            throw new NotFoundHttpException('Form Monitor integration not found');
        }

        $client = $this->clientProvider->getAuthorizedClient($integration);

        try {
            $status = $integration->getTestEmailStatus($client, $testToken);

            return $this->asJson($status);
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
    }

    public function actionMailerInfo(): Response
    {
        $transportType = App::mailSettings()->transportType;
        $isSendmail = Sendmail::class === $transportType;

        return $this->asJson([
            'transportType' => $transportType,
            'isSendmail' => $isSendmail,
        ]);
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
