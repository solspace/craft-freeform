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

use craft\helpers\Assets;
use craft\helpers\UrlHelper;
use craft\web\Controller;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Composer;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Helpers\PermissionsHelper;
use Solspace\Freeform\Library\Logging\CraftLogger;
use Solspace\Freeform\Library\Session\CraftRequest;
use Solspace\Freeform\Library\Session\CraftSession;
use Solspace\Freeform\Library\Translations\CraftTranslator;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Resources\Bundles\ComposerBuilderBundle;
use Solspace\Freeform\Resources\Bundles\FormIndexBundle;
use Solspace\Freeform\Services\CrmService;
use Solspace\Freeform\Services\FieldsService;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\MailingListsService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\StatusesService;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\InvalidConfigException;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class FormsController extends BaseController
{
    /**
     * @return void
     */
    public function actionIndex()
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FORMS_ACCESS);

        $formService            = $this->getFormService();
        $forms                  = $formService->getAllForms();
        $totalSubmissionsByForm = $this->getSubmissionsService()->getSubmissionCountByForm();

        $this->view->registerAssetBundle(FormIndexBundle::class);

        $this->renderTemplate(
            'freeform/forms',
            [
                'forms'                  => $forms,
                'totalSubmissionsByForm' => $totalSubmissionsByForm,
            ]
        );
    }

    /**
     * @return Response
     */
    public function actionCreate(): Response
    {
        $model = FormModel::create();
        $title = Freeform::t('Create a new form');

        return $this->renderEditForm($title, $model);
    }

    /**
     * @param int|null $id
     *
     * @return Response
     * @throws FreeformException
     */
    public function actionEdit(int $id = null): Response
    {
        $model = $this->getFormService()->getFormById($id);

        if (!$model) {
            throw new FreeformException(
                Freeform::t('Form with ID {id} not found', ['id' => $id])
            );
        }

        return $this->renderEditForm($model->name, $model);
    }

    /**
     * @return Response
     * @throws FreeformException
     */
    public function actionSave(): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FORMS_MANAGE);

        $post = \Craft::$app->request->post();
        if (!isset($post['formId'])) {
            throw new FreeformException('No form ID specified');
        }

        if (!isset($post['composerState'])) {
            throw new FreeformException('No composer data present');
        }

        $formId        = $post['formId'];
        $form          = $this->getNewOrExistingForm($formId);
        $composerState = json_decode($post['composerState'], true);

        if (\Craft::$app->request->post('duplicate', false)) {
            $oldHandle = $composerState['composer']['properties']['form']['handle'];

            if (preg_match('/^([a-zA-Z0-9]*[a-zA-Z]+)(\d+)$/', $oldHandle, $matches)) {
                list($string, $mainPart, $iterator) = $matches;

                $newHandle = $mainPart . ((int) $iterator + 1);
            } else {
                $newHandle = $oldHandle . '1';
            }

            $composerState['composer']['properties']['form']['handle'] = $newHandle;
        }

        try {
            $freeform = Freeform::getInstance();

            $formAttributes = new FormAttributes($formId, new CraftSession(), new CraftRequest());
            $composer       = new Composer(
                $composerState,
                $formAttributes,
                $freeform->forms,
                $freeform->submissions,
                $freeform->mailer,
                $freeform->files,
                $freeform->mailingLists,
                $freeform->crm,
                $freeform->statuses,
                new CraftTranslator(),
                new CraftLogger()
            );
        } catch (ComposerException $exception) {
            return $this->asJson(
                [
                    'success' => false,
                    'errors'  => [$exception->getMessage()],
                ]
            );
        }

        $form->setLayout($composer);

        if ($this->getFormService()->save($form)) {
            return $this->asJson(
                [
                    'success' => true,
                    'id'      => $form->id,
                    'handle'  => $form->handle,
                ]
            );
        }

        $errors = array_values($form->getErrors());

        return $this->asJson(['success' => false, 'errors' => $errors]);
    }

    /**
     * Deletes a form
     *
     * @return Response
     */
    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FORMS_MANAGE);

        $formId = \Craft::$app->request->post('id');
        $this->getFormService()->deleteById($formId);

        return $this->asJson(['success' => true]);
    }

    /**
     * Resets the spam counter for a specific form
     *
     * @return bool|Response
     */
    public function actionResetSpamCounter(): Response
    {
        $this->requirePostRequest();
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FORMS_MANAGE);

        $formId = (int) \Craft::$app->request->post('formId');

        if (!$formId) {
            return $this->asErrorJson(Freeform::t('No form ID specified'));
        }

        try {
            \Craft::$app
                ->getDb()
                ->createCommand()
                ->update(
                    FormRecord::TABLE,
                    ['spamBlockCount' => 0],
                    ['id' => $formId]
                )
                ->execute();
        } catch (\Exception $e) {
            return $this->asErrorJson($e->getMessage());
        }

        return $this->asJson(['success' => true]);
    }

    /**
     * @return FormsService
     */
    private function getFormService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    /**
     * @param int $formId
     *
     * @return FormModel
     * @throws FreeformException
     */
    private function getNewOrExistingForm($formId): FormModel
    {
        if ($formId) {
            $form = $this->getFormService()->getFormById($formId);

            if (!$form) {
                throw new FreeformException(
                    Freeform::t('Form with ID {id} not found', ['id' => $formId])
                );
            }

            return $form;
        }

        return FormModel::create();
    }

    /**
     * @param string    $title
     * @param FormModel $model
     *
     * @return Response
     */
    private function renderEditForm(string $title, FormModel $model): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FORMS_MANAGE);

        $this->view->registerAssetBundle(ComposerBuilderBundle::class);

        $notifications           = $this->getNotificationsService()->getAllNotifications(true);
        $mailingListIntegrations = $this->getMailingListsService()->getAllIntegrationObjects();
        $crmIntegrations         = $this->getCrmService()->getAllIntegrationObjects();

        $templateVariables = [
            'form'                     => $model,
            'title'                    => $title,
            'continueEditingUrl'       => 'freeform/forms/{id}',
            'fileKinds'                => $this->getEncodedJson(Assets::getFileKinds()),
            'fieldTypeList'            => $this->getEncodedJson($this->getFieldsService()->getFieldTypes()),
            'notificationList'         => $this->getEncodedJson($notifications),
            'mailingList'              => $this->getEncodedJson($mailingListIntegrations),
            'crmIntegrations'          => $this->getEncodedJson($crmIntegrations),
            'fieldList'                => $this->getEncodedJson($this->getFieldsService()->getAllFields(false)),
            'statuses'                 => $this->getEncodedJson($this->getStatusesService()->getAllStatuses(false)),
            'solspaceFormTemplates'    => $this->getEncodedJson(
                $this->getSettingsService()->getSolspaceFormTemplates()
            ),
            'formTemplates'            => $this->getEncodedJson($this->getSettingsService()->getCustomFormTemplates()),
            'assetSources'             => $this->getEncodedJson($this->getFilesService()->getAssetSources()),
            'showTutorial'             => $this->getSettingsService()->getSettingsModel()->showTutorial,
            'defaultTemplates'         => $this->getSettingsService()->getSettingsModel()->defaultTemplates,
            'canManageFields'          => PermissionsHelper::checkPermission(
                PermissionsHelper::PERMISSION_FIELDS_MANAGE
            ),
            'canManageNotifications'   => PermissionsHelper::checkPermission(
                PermissionsHelper::PERMISSION_NOTIFICATIONS_MANAGE
            ),
            'canManageSettings'        => PermissionsHelper::checkPermission(
                PermissionsHelper::PERMISSION_SETTINGS_ACCESS
            ),
            'isDbEmailTemplateStorage' => $this->getSettingsService()->isDbEmailTemplateStorage(),
            'isWidgetsInstalled'       => Freeform::getInstance()->isPro(),
        ];

        return $this->renderTemplate('freeform/forms/edit', $templateVariables);
    }

    /**
     * @param mixed $data
     *
     * @return string
     */
    private function getEncodedJson($data): string
    {
        return json_encode($data, JSON_OBJECT_AS_ARRAY);
    }
}
