<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use craft\db\Query;
use craft\db\Table;
use craft\helpers\ChartHelper;
use craft\helpers\DateTimeHelper;
use craft\helpers\Db;
use craft\helpers\FileHelper;
use craft\helpers\StringHelper;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\PlanDetails;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Integrations\PaymentGateways\AbstractPaymentGatewayIntegration;
use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Records\NotificationRecord;
use yii\base\Exception;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class ApiController extends BaseController
{
    /** @var bool */
    protected $allowAnonymous = true;

    /**
     * @throws FreeformException
     *
     * @return null|Response
     */
    public function actionForm()
    {
        $this->requirePostRequest();

        $hash = \Craft::$app->request->post(FormValueContext::FORM_HASH_KEY);
        $formId = FormValueContext::getFormIdFromHash($hash);

        $formModel = $this->getFormsService()->getFormById($formId);

        if (!$formModel) {
            throw new FreeformException(
                \Craft::t('freeform', 'Form with ID {id} not found', ['id' => $formId])
            );
        }

        $form = $formModel->getForm();
        $isAjaxRequest = \Craft::$app->request->getIsAjax();

        if ($form->isValid()) {
            $submission = $form->submit();

            if (false !== $submission && $submission->getErrors()) {
                $form->addErrors(array_keys($submission->getErrors()));
            }

            if (!$form->getErrors() && !$form->getActions() && $form->isFinished()) {
                //TODO: check if it required payment and payment succeeded
                //TODO: if payment failed than display error message

                $postedReturnUrl = \Craft::$app->request->post(Form::RETURN_URI_KEY);
                if ($postedReturnUrl) {
                    $returnUrl = \Craft::$app->security->validateData($postedReturnUrl);
                    if (false === $returnUrl) {
                        $returnUrl = $form->getReturnUrl();
                    }
                } else {
                    $returnUrl = $form->getReturnUrl();
                }

                $returnUrl = \Craft::$app->view->renderString(
                    $returnUrl,
                    [
                        'form' => $form,
                        'submission' => $submission,
                    ]
                );

                if (false === $submission) {
                    $submission = null;
                }

                $returnUrl = Freeform::getInstance()->forms->onAfterGenerateReturnUrl($form, $submission, $returnUrl);
                if (!$returnUrl) {
                    $returnUrl = \Craft::$app->request->getUrl();
                }

                $form->reset();

                return $isAjaxRequest ? $this->toAjaxResponse($form, $submission, $returnUrl) : $this->redirect($returnUrl);
            }
        }

        if ($form->isMarkedAsSpam() && $this->getSettingsService()->isSpamBehaviourReloadForm()) {
            return $this->redirect(\Craft::$app->request->getUrl());
        }

        if ($isAjaxRequest) {
            return $this->toAjaxResponse($form);
        }
    }

    /**
     * GET fields.
     *
     * @throws ForbiddenHttpException
     */
    public function actionFields(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        return $this->asJson($this->getFieldsService()->getAllFields(false));
    }

    /**
     * GET notifications.
     *
     * @throws ForbiddenHttpException
     */
    public function actionNotifications(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        return $this->asJson($this->getNotificationsService()->getAllNotifications(false));
    }

    /**
     * GET mailing lists.
     *
     * @throws ForbiddenHttpException
     */
    public function actionMailingLists(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $mailingLists = $this->getMailingListsService()->getAllIntegrationObjects();
        foreach ($mailingLists as $integration) {
            $integration->setForceUpdate(true);
        }

        return $this->asJson($mailingLists);
    }

    /**
     * GET integrations.
     *
     * @throws ForbiddenHttpException
     */
    public function actionCrmIntegrations(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $crmIntegrations = $this->getCrmService()->getAllIntegrationObjects();
        foreach ($crmIntegrations as $integration) {
            $integration->setForceUpdate(true);

            try {
                $integration->getFields();
            } catch (\Exception $e) {
                return $this->asErrorJson($e->getMessage());
            }
        }

        return $this->asJson($crmIntegrations);
    }

    /**
     * GET payment gateways.
     *
     * @throws ForbiddenHttpException
     */
    public function actionPaymentGateways(): Response
    {
        //TODO: add separate function to query single gateway?
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $paymentGateways = $this->getPaymentGatewaysService()->getAllIntegrationObjects();
        foreach ($paymentGateways as $integration) {
            $integration->setForceUpdate(true);
        }

        return $this->asJson($paymentGateways);
    }

    /**
     * POST payment plans.
     *
     * @throws ForbiddenHttpException
     */
    public function actionPaymentPlans(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $request = \Craft::$app->request;
        $errors = [];

        $integrationId = $request->post('integrationId');
        $name = $request->post('name');
        $amount = $request->post('amount');
        $currency = $request->post('currency');
        $interval = $request->post('interval');

        if (!$integrationId) {
            $errors[] = Freeform::t('IntegrationId is required');
        }

        if (!$name) {
            $errors[] = Freeform::t('Label is required');
        }

        if (!$amount) {
            $errors[] = Freeform::t('Amount is required');
        }

        /** @var AbstractPaymentGatewayIntegration $integration */
        $integration = $this->getPaymentGatewaysService()->getIntegrationObjectById($integrationId);

        if (empty($errors)) {
            $planDetails = new PlanDetails($name, $amount, $currency, $interval);
            $result = $integration->createPlan($planDetails);

            if ($result) {
                $integration->setForceUpdate(true);

                return $this->asJson(['success' => true, 'id' => $result]);
            }

            $error = $integration->getLastError();
            if ($error) {
                $error = $error->getPrevious();
                $errors[] = $error->getMessage();
            }
        }

        return $this->asJson(['success' => false, 'errors' => $errors]);
    }

    /**
     * GET fields.
     *
     * @throws ForbiddenHttpException
     */
    public function actionFormTemplates(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        return $this->asJson($this->getSettingsService()->getCustomFormTemplates());
    }

    /**
     * POST a field, and save it to the database.
     *
     * @throws \Exception
     * @throws BadRequestHttpException
     */
    public function actionQuickCreateField(): Response
    {
        $this->requirePostRequest();

        $request = \Craft::$app->request;
        $errors = [];

        $label = $request->post('label');
        $handle = $request->post('handle');
        $type = $request->post('type');

        if (!$label) {
            $errors[] = Freeform::t('Label is required');
        }

        if (!$handle) {
            $errors[] = Freeform::t('Handle is required');
        }

        $allowedFieldTypes = array_keys(AbstractField::getFieldTypes());
        if (!$type || !\in_array($type, $allowedFieldTypes, true)) {
            $errors[] = Freeform::t(
                'Type {type} is not allowed. Allowed types are ({allowedTypes})',
                [
                    'type' => $type,
                    'allowedTypes' => implode(', ', $allowedFieldTypes),
                ]
            );
        }

        $field = FieldModel::create();
        $field->label = $label;
        $field->handle = $handle;
        $field->type = $type;

        if (empty($errors) && $this->getFieldsService()->save($field)) {
            return $this->asJson(['success' => true]);
        }

        $fieldErrors = $field->getErrors();
        $errors = [];
        array_walk_recursive(
            $fieldErrors,
            function ($array) use (&$errors) {
                $errors[] = $array;
            }
        );

        return $this->asJson(['success' => false, 'errors' => $errors]);
    }

    /**
     * POST a field, and save it to the database.
     *
     * @throws \yii\base\InvalidParamException
     * @throws \yii\base\ErrorException
     * @throws BadRequestHttpException
     */
    public function actionQuickCreateNotification(): Response
    {
        $this->requirePostRequest();

        $isDbStorage = $this->getSettingsService()->isDbEmailTemplateStorage();

        $request = \Craft::$app->request;
        $errors = [];

        $name = $request->post('name');
        $handle = $request->post('handle');

        if (!$name) {
            $errors[] = Freeform::t('Name is required');
        }

        if (!$handle && $isDbStorage) {
            $errors[] = Freeform::t('Handle is required');
        }

        if ($isDbStorage) {
            $notification = NotificationRecord::create();
            $notification->name = $name;
            $notification->handle = $handle;

            if (empty($errors) && $this->getNotificationsService()->save($notification)) {
                return $this->asJson(['success' => true, 'id' => $notification->id]);
            }

            $errors = $notification->getErrors();
            $errors = array_values($errors);

            return $this->asJson(['success' => false, 'errors' => $errors]);
        }

        $settings = $this->getSettingsService()->getSettingsModel();

        $templateDirectory = $settings->getAbsoluteEmailTemplateDirectory();
        $templateName = StringHelper::toSnakeCase($name);
        $extension = '.html';

        $templatePath = $templateDirectory.'/'.$templateName.$extension;
        if (file_exists($templatePath)) {
            $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName.$extension]);
        } else {
            try {
                FileHelper::writeToFile($templatePath, $settings->getEmailTemplateContent());
            } catch (FreeformException $exception) {
                $errors[] = $exception->getMessage();
            }
        }

        if (empty($errors)) {
            return $this->asJson(['success' => true, 'id' => $templateName.$extension]);
        }

        return $this->asJson(['success' => false, 'errors' => $errors]);
    }

    /**
     * Returns the data needed to display a Submissions chart.
     *
     * @throws Exception
     * @throws ForbiddenHttpException
     */
    public function actionGetSubmissionData(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);

        // Required for Dashboard widget, unnecessary for Entries Index view
        $source = \Craft::$app->request->post('source');
        $formId = null;
        if ($source && 0 === strpos($source, 'form:')) {
            $formId = (int) substr($source, 5);
        } elseif ('*' === $source) {
            $isAdmin = PermissionHelper::isAdmin();
            $manageAll = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE);

            if (!$isAdmin && !$manageAll) {
                $formId = Freeform::getInstance()->submissions->getAllowedSubmissionFormIds();
            }
        }

        $isSpam = \Craft::$app->request->post('isSpam');
        $startDateParam = \Craft::$app->request->post('startDate');
        $endDateParam = \Craft::$app->request->post('endDate');

        $startDate = DateTimeHelper::toDateTime($startDateParam, true);
        $endDate = DateTimeHelper::toDateTime($endDateParam, true);

        if (false === $startDate || false === $endDate) {
            throw new Exception('There was a problem calculating the start and end dates');
        }

        $endDate->modify('+1 day');
        $intervalUnit = ChartHelper::getRunChartIntervalUnit($startDate, $endDate);
        $submissions = Submission::TABLE;

        // Prep the query
        $query = (new Query())
            ->select(["COUNT({$submissions}.[[id]]) as [[value]]"])
            ->from($submissions)
        ;

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Table::ELEMENTS;
            $query->innerJoin(
                $elements,
                "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
            );
        }

        if ($formId) {
            $query->andWhere(["{$submissions}.[[formId]]" => $formId]);
        }
        if (null !== $isSpam) {
            $query->andWhere(["{$submissions}.[[isSpam]]" => $isSpam]);
        }

        // Get the chart data table
        $dataTable = $this->getRunChartDataFromQuery(
            $query,
            $startDate,
            $endDate,
            "{$submissions}.[[dateCreated]]",
            [
                'intervalUnit' => $intervalUnit,
                'valueLabel' => Freeform::t('Submissions'),
                'valueType' => 'number',
            ]
        );

        // Get the total submissions
        $total = 0;

        foreach ($dataTable['rows'] as $row) {
            $total += $row[1];
        }

        $formats = ChartHelper::formats();
        $formats['numberFormat'] = ',.0f';

        return $this->asJson(
            [
                'dataTable' => $dataTable,
                'total' => $total,
                'totalHtml' => $total,

                'formats' => $formats,
                'orientation' => \Craft::$app->locale->getOrientation(),
                'scale' => $intervalUnit,
            ]
        );
    }

    /**
     * Mark the tutorial as finished.
     */
    public function actionFinishTutorial(): Response
    {
        return $this->asJson(['success' => $this->getSettingsService()->finishTutorial()]);
    }

    /**
     * @throws BadRequestHttpException
     * @throws ForbiddenHttpException
     */
    public function actionOptionsFromSource(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);
        $this->requirePostRequest();
        $request = \Craft::$app->request;

        $source = $request->post('source');
        $target = $request->post('target');
        $configuration = $request->post('configuration');

        if (!\is_array($configuration)) {
            $configuration = [];
        }

        $options = $this->getFieldsService()->getOptionsFromSource($source, $target, $configuration);

        return $this->asJson(['data' => $options]);
    }

    /**
     * @param string $returnUrl
     */
    private function toAjaxResponse(Form $form, Submission $submission = null, string $returnUrl = null): Response
    {
        $honeypot = Freeform::getInstance()->honeypot->getHoneypot($form);
        $fieldErrors = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->hasErrors()) {
                $fieldErrors[$field->getHandle()] = $field->getErrors();
            }
        }

        $success = !$form->hasErrors() && !$form->getActions();

        return $this->asJson(
            [
                'success' => $success,
                'multipage' => $form->isMultiPage(),
                'finished' => $form->isFinished(),
                'submissionId' => $submission ? $submission->id : null,
                'submissionToken' => $submission ? $submission->token : null,
                'actions' => $form->getActions(),
                'errors' => $fieldErrors,
                'formErrors' => $form->getErrors(),
                'returnUrl' => $returnUrl,
                'honeypot' => [
                    'name' => $honeypot->getName(),
                    'hash' => $honeypot->getHash(),
                ],
                'html' => $form->render(),
            ]
        );
    }

    /**
     * @throws Exception
     */
    private function getRunChartDataFromQuery(
        Query $query,
        \DateTime $startDate,
        \DateTime $endDate,
        string $dateColumn,
        array $options = []
    ): array {
        // Setup
        $options = array_merge(
            [
                'intervalUnit' => null,
                'categoryLabel' => Freeform::t('Date'),
                'valueLabel' => Freeform::t('Value'),
                'valueType' => 'number',
            ],
            $options
        );

        $isMysql = \Craft::$app->getDb()->getIsMysql();

        if ($options['intervalUnit'] && \in_array($options['intervalUnit'], ['year', 'month', 'day', 'hour'], true)) {
            $intervalUnit = $options['intervalUnit'];
        } else {
            $intervalUnit = ChartHelper::getRunChartIntervalUnit($startDate, $endDate);
        }

        // Prepare the query
        switch ($intervalUnit) {
            case 'year':
                $phpDateFormat = 'Y-01-01';

                break;

            case 'month':
                $phpDateFormat = 'Y-m-01';

                break;

            case 'day':
                $phpDateFormat = 'Y-m-d';

                break;

            case 'hour':
                $phpDateFormat = 'Y-m-d H:00:00';

                break;

            default:
                throw new Exception('Invalid interval unit: '.$intervalUnit);
        }

        $sqlGroup[] = '[[date]]';

        // Assemble the data
        $rows = [];

        $cursorDate = clone $startDate;
        $endTimestamp = $endDate->getTimestamp();

        while ($cursorDate->getTimestamp() < $endTimestamp) {
            $cursorEndDate = clone $cursorDate;
            $cursorEndDate->modify('+1 '.$intervalUnit);
            $totalQuery = clone $query;
            $total = (float) $totalQuery
                ->andWhere(['>=', $dateColumn, Db::prepareDateForDb($cursorDate)])
                ->andWhere(['<', $dateColumn, Db::prepareDateForDb($cursorEndDate)])
                ->count('*')
            ;
            $rows[] = [$cursorDate->format($phpDateFormat), $total];
            $cursorDate = $cursorEndDate;
        }

        return [
            'columns' => [
                [
                    'type' => 'hour' === $intervalUnit ? 'datetime' : 'date',
                    'label' => $options['categoryLabel'],
                ],
                [
                    'type' => $options['valueType'],
                    'label' => $options['valueLabel'],
                ],
            ],
            'rows' => $rows,
        ];
    }
}
