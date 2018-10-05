<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Assets\RegisterEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\TextareaField;
use Solspace\Freeform\Library\DataExport\ExportDataCSV;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Resources\Bundles\SubmissionEditBundle;
use Solspace\Freeform\Resources\Bundles\SubmissionIndexBundle;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\Response;

class SubmissionsController extends BaseController
{
    const TEMPLATE_BASE_PATH          = 'freeform/submissions';
    const EVENT_REGISTER_INDEX_ASSETS = 'registerIndexAssets';
    const EVENT_REGISTER_EDIT_ASSETS  = 'registerEditAssets';

    /**
     * Returns base path for view templates, so it could be overridden
     *
     * @return string
     */
    protected function getTemplateBasePath(): string
    {
        return self::TEMPLATE_BASE_PATH;
    }

    /**
     * @param string|null $formHandle
     *
     * @return Response
     * @throws ForbiddenHttpException
     * @throws \yii\base\InvalidConfigException
     */
    public function actionIndex(string $formHandle = null): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);

        \Craft::$app->view->registerAssetBundle(SubmissionIndexBundle::class);

        $exportButtonBundleClass = 'Solspace\FreeformPro\Bundles\ExportButtonBundle';

        $registerAssetsEvent = new RegisterEvent(\Craft::$app->view);
        $this->trigger(self::EVENT_REGISTER_INDEX_ASSETS, $registerAssetsEvent);

        if (Freeform::getInstance()->isPro() && class_exists($exportButtonBundleClass)) {
            \Craft::$app->view->registerAssetBundle($exportButtonBundleClass);
        }

        $forms = $this->getFormsService()->getAllForms();

        return $this->renderTemplate(
            $this->getTemplateBasePath(),
            [
                'forms'      => $forms,
                'statuses'   => $this->getStatusesService()->getAllStatuses(),
                'formHandle' => $formHandle,
            ]
        );
    }

    /**
     * Exports submission data as CSV
     *
     * @throws BadRequestHttpException
     * @throws ForbiddenHttpException
     * @throws FreeformException
     * @throws ComposerException
     */
    public function actionExport()
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE);

        $isRemoveNewlines = Freeform::getInstance()->settings->isRemoveNewlines();

        $submissionIds = \Craft::$app->request->post('submissionIds');
        $submissionIds = explode(',', $submissionIds);

        $submissions = $this->getSubmissionsService()->getAsArray($submissionIds);

        $form = null;
        if ($submissions) {
            $formId = $submissions[0]['formId'];
            $form   = $this->getFormsService()->getFormById($formId);

            if (!$form) {
                throw new FreeformException(Freeform::t('Form with ID {id} not found', ['id' => $formId]));
            }
        } else {
            throw new FreeformException(Freeform::t('No submissions found'));
        }

        $csvData = [];
        $labels  = ['ID', 'Submission Date'];
        foreach ($submissions as $submission) {
            $rowData   = [];
            $rowData[] = $submission['id'];
            $rowData[] = $submission['dateCreated'];

            foreach ($form->getLayout()->getFields() as $field) {
                if ($field instanceof NoStorageInterface) {
                    continue;
                }

                if (empty($csvData)) {
                    $labels[] = $field->getLabel();
                }

                $columnName = Submission::getFieldColumnName($field->getId());

                $value = $submission[$columnName];
                if ($field instanceof MultipleValueInterface) {
                    $value = json_decode($value);
                    if (is_array($value)) {
                        $value = implode(', ', $value);
                    }
                }

                if ($isRemoveNewlines && $field instanceof TextareaField) {
                    $value = trim(preg_replace('/\s+/', ' ', $value));
                }

                $rowData[] = $value;
            }

            $csvData[] = $rowData;
        }
        unset($submissions);

        array_unshift($csvData, $labels);

        $fileName = sprintf('%s submissions %s.csv', $form->name, date('Y-m-d H:i', time()));

        $export = new ExportDataCSV('browser', $fileName);
        $export->initialize();

        foreach ($csvData as $csv) {
            $export->addRow($csv);
        }

        $export->finalize();
        exit();
    }

    /**
     * @param int $id
     *
     * @return Response
     * @throws HttpException
     */
    public function actionEdit(int $id): Response
    {
        $submission = $this->getSubmissionsService()->getSubmissionById($id);

        if (!$submission) {
            throw new HttpException(404, Freeform::t('Submission with ID {id} not found', ['id' => $id]));
        }

        $title = $submission->title;

        /** @var array|null $allowedFormIds */
        $allowedFormIds = Freeform::getInstance()->submissions->getAllowedSubmissionFormIds();
        if (null !== $allowedFormIds) {
            PermissionHelper::requirePermission(
                PermissionHelper::prepareNestedPermission(
                    Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                    $submission->formId
                )
            );
        }

        \Craft::$app->view->registerAssetBundle(SubmissionEditBundle::class);

        $registerAssetsEvent = new RegisterEvent(\Craft::$app->view);
        $this->trigger(self::EVENT_REGISTER_EDIT_ASSETS, $registerAssetsEvent);

        $layout = $submission->getForm()->getLayout();

        $statuses        = [];
        $statusModelList = Freeform::getInstance()->statuses->getAllStatuses();
        foreach ($statusModelList as $statusId => $status) {
            $statuses[$statusId] = $status;
        }

        $variables = [
            'submission'         => $submission,
            'layout'             => $layout,
            'title'              => $title,
            'statuses'           => $statuses,
            'continueEditingUrl' => 'freeform/submissions/{id}',
        ];
        $paymentDetails = $this->getSubmissionPaymentDetails($submission);
        if ($paymentDetails) {
            $variables['payments'] = $paymentDetails;
        }

        $paymentDetails = $this->getSubmissionPaymentDetails($submission);
        if ($paymentDetails) {
            $variables['payments'] = $paymentDetails;
        }

        return $this->renderTemplate(
            $this->getTemplateBasePath() . '/edit',
            $variables
        );
    }

    /**
     * @throws \yii\web\ForbiddenHttpException
     * @throws \Exception
     * @throws BadRequestHttpException
     */
    public function actionSave()
    {
        $post = \Craft::$app->request->post();

        $submissionId = $post['submissionId'] ?? null;
        $model        = $this->getSubmissionsService()->getSubmissionById($submissionId);

        if (!$model) {
            throw new FreeformException(Freeform::t('Submission not found'));
        }


        /** @var array|null $allowedFormIds */
        $allowedFormIds = Freeform::getInstance()->submissions->getAllowedSubmissionFormIds();
        if (null !== $allowedFormIds) {
            PermissionHelper::requirePermission(
                PermissionHelper::prepareNestedPermission(
                    Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                    $model->formId
                )
            );
        }

        $model->title    = \Craft::$app->request->post('title', $model->title);
        $model->statusId = $post['statusId'];
        $model->setFormFieldValues($post);

        if (\Craft::$app->getElements()->saveElement($model)) {
            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Submission updated'));
            \Craft::$app->session->setFlash(Freeform::t('Submission updated'), true);

            return $this->redirectToPostedUrl($model);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Submission could not be updated'));

        // Send the event back to the template
        \Craft::$app->urlManager->setRouteParams(
            [
                'submission' => $model,
                'errors'     => $model->getErrors(),
            ]
        );
    }

    private function getSubmissionPaymentDetails($submission)
    {
        $form          = $submission->getForm();
        $paymentFields = $form->getLayout()->getPaymentFields();

        if (count($paymentFields) > 0) {
            $paymentField      = $paymentFields[0];
            $paymentProperties = $form->getPaymentProperties();
            $integrationId     = $paymentProperties->getIntegrationId();
            $integrationModel  = $this->getPaymentGatewaysService()->getIntegrationById($integrationId);
            $integration       = $integrationModel->getIntegrationObject();
            $token             = $submission->{$paymentField->getHandle()}->getValue();
            $details           = $integration->getPaymentDetails($submission->getId(), $token);

            return $details !== false ? $details : null;
        }

        return null;
    }
}
