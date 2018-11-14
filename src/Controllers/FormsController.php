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

use craft\base\Field;
use craft\elements\User;
use craft\helpers\Assets;
use craft\helpers\Json;
use craft\records\Volume;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Composer;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Session\CraftRequest;
use Solspace\Freeform\Library\Session\CraftSession;
use Solspace\Freeform\Library\Translations\CraftTranslator;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Resources\Bundles\ComposerBuilderBundle;
use Solspace\Freeform\Resources\Bundles\FormIndexBundle;
use Solspace\Freeform\Services\FormsService;
use yii\db\Query;
use yii\web\Response;

class FormsController extends BaseController
{
    /**
     * @return void
     */
    public function actionIndex()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $formService            = $this->getFormService();
        $forms                  = $formService->getAllForms();
        $totalSubmissionsByForm = $this->getSubmissionsService()->getSubmissionCountByForm();

        $this->view->registerAssetBundle(FormIndexBundle::class);

        $this->renderTemplate(
            'freeform/forms',
            [
                'forms'                  => $forms,
                'totalSubmissionsByForm' => $totalSubmissionsByForm,
                'isSpamFolderEnabled'    => $this->getSettingsService()->isSpamFolderEnabled(),
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
    public function actionDuplicate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);
        $this->requirePostRequest();

        $id    = \Craft::$app->request->post('id');
        $model = $this->getFormService()->getFormById($id);

        if (!$model) {
            throw new FreeformException(
                Freeform::t('Form with ID {id} not found', ['id' => $id])
            );
        }

        $model->id = null;
        $layout    = Json::decode($model->layoutJson, true);
        $oldHandle = $model->handle;

        if (preg_match('/^([a-zA-Z0-9]*[a-zA-Z]+)(\d+)$/', $oldHandle, $matches)) {
            list($string, $mainPart, $iterator) = $matches;

            $newHandle = $mainPart . ((int) $iterator + 1);
        } else {
            $newHandle = $oldHandle . '1';
        }

        $layout['composer']['properties']['form']['handle'] = $newHandle;

        $model->handle     = $newHandle;
        $model->layoutJson = Json::encode($layout);

        $this->getFormsService()->save($model);

        if ($model->getErrors()) {
            $string = '';
            foreach ($model->getErrors() as $errors) {
                $string .= implode(', ', $errors);
            }

            \Craft::$app->session->setError($string);
        }

        return $this->redirect('freeform/forms');
    }

    /**
     * @return Response
     * @throws FreeformException
     */
    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);

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
                $freeform->fields,
                $freeform->submissions,
                $freeform->spamSubmissions,
                $freeform->files,
                $freeform->statuses,
                new CraftTranslator(),
                FreeformLogger::getInstance(FreeformLogger::FORM)
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
        //flattening error map
        if ($errors) {
            $errors = array_merge(...$errors);
        }

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
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);

        $formId = \Craft::$app->request->post('id');

        return $this->asJson(
            [
                'success' => $this->getFormService()->deleteById($formId),
            ]
        );
    }

    /**
     * Resets the spam counter for a specific form
     *
     * @return bool|Response
     */
    public function actionResetSpamCounter(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);

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
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);

        $translationCategories = include __DIR__ . '/../Resources/composer-translations.php';

        $this->view->registerAssetBundle(ComposerBuilderBundle::class);
        $this->view->registerTranslations(Freeform::TRANSLATION_CATEGORY, $translationCategories);

        $notifications           = $this->getNotificationsService()->getAllNotifications(true);
        $mailingListIntegrations = $this->getMailingListsService()->getAllIntegrationObjects();
        $crmIntegrations         = $this->getCrmService()->getAllIntegrationObjects();
        $paymentGateways         = $this->getPaymentGatewaysService()->getAllIntegrationObjects();
        $settings                = $this->getSettingsService()->getSettingsModel();

        $sites = [];
        foreach (\Craft::$app->sites->getAllSites() as $site) {
            $sites[] = [
                'id'     => (int) $site->id,
                'handle' => $site->handle,
                'name'   => $site->name,
            ];
        }

        $templateVariables = [
            'form'                     => $model,
            'title'                    => $title,
            'continueEditingUrl'       => 'freeform/forms/{id}',
            'fileKinds'                => $this->getEncodedJson(Assets::getFileKinds()),
            'fieldTypeList'            => $this->getEncodedJson($this->getFieldsService()->getFieldTypes()),
            'notificationList'         => $this->getEncodedJson($notifications),
            'mailingList'              => $this->getEncodedJson($mailingListIntegrations),
            'crmIntegrations'          => $this->getEncodedJson($crmIntegrations),
            'paymentGatewayList'       => $this->getEncodedJson($paymentGateways),
            'fieldList'                => $this->getEncodedJson($this->getFieldsService()->getAllFields(false)),
            'statuses'                 => $this->getEncodedJson($this->getStatusesService()->getAllStatuses(false)),
            'solspaceFormTemplates'    => $this->getEncodedJson(
                $this->getSettingsService()->getSolspaceFormTemplates()
            ),
            'formTemplates'            => $this->getEncodedJson($this->getSettingsService()->getCustomFormTemplates()),
            'assetSources'             => $this->getEncodedJson($this->getFilesService()->getAssetSources()),
            'showTutorial'             => $settings->showTutorial,
            'defaultTemplates'         => $settings->defaultTemplates,
            'canManageFields'          => PermissionHelper::checkPermission(Freeform::PERMISSION_FIELDS_MANAGE),
            'canManageNotifications'   => PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE),
            'canManageSettings'        => PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS),
            'isDbEmailTemplateStorage' => $this->getSettingsService()->isDbEmailTemplateStorage(),
            'isWidgetsInstalled'       => Freeform::getInstance()->isPro(),
            'isRulesEnabled'           => Freeform::getInstance()->isPro(),
            'isRecaptchaEnabled'       => Freeform::getInstance()->isPro() && $settings->recaptchaEnabled,
            'isPaymentEnabled'         => \Craft::$app->plugins->isPluginEnabled('freeform-payments'),
            'sourceTargets'            => $this->getEncodedJson($this->getSourceTargetsList()),
            'craftFields'              => $this->getEncodedJson($this->getCraftFields()),
            'customFields'             => $this->getEncodedJson($this->getAllCustomFieldList()),
            'generatedOptions'         => $this->getEncodedJson($this->getGeneratedOptionsList($model->getForm())),
            'currentSiteId'            => (int) \Craft::$app->getSites()->currentSite->id,
            'sites'                    => $this->getEncodedJson($sites),
            'renderFormHtmlInCpViews'  => $settings->renderFormHtmlInCpViews,
        ];

        return $this->renderTemplate('freeform/forms/edit', $templateVariables);
    }

    /**
     * @return array
     */
    private function getAllCustomFieldList(): array
    {
        $fieldList = [
            ['key' => 'id', 'value' => 'ID'],
            ['key' => 'title', 'value' => \Craft::t('app', 'Title')],
            ['key' => 'slug', 'value' => \Craft::t('app', 'Slug')],
            ['key' => 'uri', 'value' => \Craft::t('app', 'URI')],
            ['key' => 'username', 'value' => \Craft::t('app', 'Username')],
            ['key' => 'email', 'value' => \Craft::t('app', 'Email')],
            ['key' => 'firstName', 'value' => \Craft::t('app', 'First Name')],
            ['key' => 'lastName', 'value' => \Craft::t('app', 'Last Name')],
            ['key' => 'fullName', 'value' => \Craft::t('app', 'Full Name')],
            ['key' => 'filename', 'value' => \Craft::t('app', 'Filename')],
        ];

        /** @var Field[] $fields */
        $fields = \Craft::$app->fields->getAllFields();
        foreach ($fields as $field) {
            $fieldList[] = ['key' => $field->handle, 'value' => $field->name];
        }

        return $fieldList;
    }

    /**
     * @param Form $form
     *
     * @return array|\stdClass
     */
    private function getGeneratedOptionsList(Form $form)
    {
        $options = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof ExternalOptionsInterface) {
                if ($field->getOptionSource() !== ExternalOptionsInterface::SOURCE_CUSTOM) {
                    $options[$field->getHash()] = $this->getFieldsService()->getOptionsFromSource(
                        $field->getOptionSource(),
                        $field->getOptionTarget(),
                        $field->getOptionConfiguration()
                    );
                }
            }
        }

        if (empty($options)) {
            return new \stdClass();
        }

        return $options;
    }

    /**
     * @return array
     */
    private function getSourceTargetsList(): array
    {
        $entryTypes = (new Query())
            ->select(['id', 'sectionId', 'name', 'hasTitleField', 'titleLabel', 'fieldLayoutId'])
            ->from('{{%entrytypes}}')
            ->orderBy(['sectionId' => SORT_ASC, 'sortOrder' => SORT_ASC])
            ->all();

        $fieldLayoutFields = (new Query())
            ->select(['fieldId', 'layoutId'])
            ->from('{{%fieldlayoutfields}}')
            ->orderBy(['sortOrder' => SORT_ASC])
            ->all();

        $fieldByLayoutGroupId = [];
        foreach ($fieldLayoutFields as $field) {
            $layoutId = $field['layoutId'];

            if (!isset($fieldByLayoutGroupId[$layoutId])) {
                $fieldByLayoutGroupId[$layoutId] = [];
            }

            $fieldByLayoutGroupId[$layoutId][] = (int) $field['fieldId'];
        }

        $entryTypesBySectionId = [];
        foreach ($entryTypes as $entryType) {
            $fieldLayoutId = $entryType['fieldLayoutId'];
            $fieldIds      = [];
            if (isset($fieldByLayoutGroupId[$fieldLayoutId])) {
                $fieldIds = $fieldByLayoutGroupId[$fieldLayoutId];
            }

            $entryTypesBySectionId[$entryType['sectionId']][] = [
                'key'                 => $entryType['id'],
                'value'               => $entryType['name'],
                'hasTitleField'       => (bool) $entryType['hasTitleField'],
                'titleLabel'          => $entryType['titleLabel'],
                'fieldLayoutFieldIds' => $fieldIds,
            ];
        }
        $sections    = \Craft::$app->sections->getAllSections();
        $sectionList = [0 => ['key' => '', 'value' => Freeform::t('All Sections')]];

        foreach ($sections as $group) {
            $sectionList[] = [
                'key'        => $group->id,
                'value'      => $group->name,
                'entryTypes' => $entryTypesBySectionId[$group->id] ?? [],
                'sites'      => array_keys($group->siteSettings),
            ];
        }

        $categories   = \Craft::$app->categories->getAllGroups();
        $categoryList = [0 => ['key' => '', 'value' => Freeform::t('All Category Groups')]];
        foreach ($categories as $group) {
            $categoryList[] = [
                'key'   => $group->id,
                'value' => $group->name,
                'sites' => array_keys($group->siteSettings),
            ];
        }

        $tags    = \Craft::$app->tags->getAllTagGroups();
        $tagList = [0 => ['key' => '', 'value' => Freeform::t('All Tag Groups')]];
        foreach ($tags as $group) {
            $tagList[] = [
                'key'   => $group->id,
                'value' => $group->name,
            ];
        }

        $userList = [0 => ['key' => '', 'value' => Freeform::t('All User Groups')]];
        if (\Craft::$app->getEdition() === \Craft::Pro) {
            $groupsWithAdminPermissions = (new Query())
                ->select('groupId')
                ->from('{{%userpermissions_usergroups}} ug')
                ->innerJoin('{{%userpermissions}} u', '[[u.id]] = [[ug.permissionId]]')
                ->where(['[[u.name]]' => 'accesscp'])
                ->column();

            $userFieldLayoutId = (int) (new Query())
                ->select('id')
                ->from('{{%fieldlayouts}}')
                ->where(['type' => User::class])
                ->scalar();

            $userGroups = \Craft::$app->userGroups->getAllGroups();
            foreach ($userGroups as $group) {
                $fieldIds = [];
                if (isset($fieldByLayoutGroupId[$userFieldLayoutId])) {
                    $fieldIds = $fieldByLayoutGroupId[$userFieldLayoutId];
                }

                $userList[] = [
                    'key'                 => $group->id,
                    'value'               => $group->name,
                    'fieldLayoutFieldIds' => $fieldIds,
                    'canAccessCp'         => \in_array($group->id, $groupsWithAdminPermissions, false),
                ];
            }
        }

        /** @var Volume[] $volumes */
        $volumes    = \Craft::$app->volumes->getAllVolumes();
        $volumeList = [0 => ['key' => '', 'value' => Freeform::t('All Assets')]];
        foreach ($volumes as $volume) {
            $volumeList[] = [
                'key'   => $volume->id,
                'value' => $volume->name,
            ];
        }

        return [
            ExternalOptionsInterface::SOURCE_ENTRIES    => $sectionList,
            ExternalOptionsInterface::SOURCE_CATEGORIES => $categoryList,
            ExternalOptionsInterface::SOURCE_TAGS       => $tagList,
            ExternalOptionsInterface::SOURCE_USERS      => $userList,
            ExternalOptionsInterface::SOURCE_ASSETS     => $volumeList,
        ];
    }

    /**
     * @return array
     */
    private function getCraftFields(): array
    {
        $fields = [];
        /** @var Field $field */
        foreach (\Craft::$app->fields->getAllFields() as $field) {
            $fields[] = [
                'id'     => (int) $field->id,
                'name'   => $field->name,
                'handle' => $field->handle,
                'type'   => \get_class($field),
            ];
        }

        return $fields;
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
