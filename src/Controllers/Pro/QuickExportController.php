<?php

namespace Solspace\Freeform\Controllers\Pro;

use craft\db\Query;
use craft\db\Table;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Pro\Payments\CreditCardDetailsField;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Export\AbstractExport;
use Solspace\Freeform\Records\Pro\ExportSettingRecord;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class QuickExportController extends BaseController
{
    /**
     * @return Response
     * @throws ComposerException
     */
    public function actionExportDialogue(): Response
    {
        $formId = \Craft::$app->request->getParam('formId');

        $allowedFormIds = $this->getSubmissionsService()->getAllowedSubmissionFormIds();

        /** @var Form[] $forms */
        $forms = [];

        $fields     = [];
        $formModels = $this->getFormsService()->getAllForms();
        foreach ($formModels as $form) {
            if (null !== $allowedFormIds) {
                if (!\in_array($form->id, $allowedFormIds, false)) {
                    continue;
                }
            }

            $forms[$form->id] = $form->getForm();
            foreach ($form->getForm()->getLayout()->getFields() as $field) {
                if ($field instanceof NoStorageInterface || $field instanceof SignatureField || !$field->getId()) {
                    continue;
                }

                $fields[$field->getId()] = $field;
            }
        }

        $firstForm     = reset($forms);
        $settingRecord = $this->getExportSettings();

        $setting = [];
        foreach ($forms as $form) {
            $storedFieldIds = $fieldSetting = [];
            if (!$settingRecord) {
                continue;
            }

            if (!$settingRecord->setting) {
                $settingRecord->setting = [];
            }

            $settingArray = is_array($settingRecord->setting) ? $settingRecord->setting : \GuzzleHttp\json_decode($settingRecord->setting, true);

            if ($settingRecord && isset($settingArray[$form->getId()])) {
                foreach ($settingArray[$form->getId()] as $fieldId => $item) {
                    $label     = $item['label'];
                    $isChecked = (bool) $item['checked'];

                    if (is_numeric($fieldId)) {
                        try {
                            $field = $form->getLayout()->getFieldById($fieldId);
                            $label = $field->getLabel();

                            $storedFieldIds[] = $field->getId();
                        } catch (FreeformException $e) {
                            continue;
                        }
                    }

                    $fieldSetting[$fieldId] = [
                        'label'   => $label,
                        'checked' => $isChecked,
                    ];
                }
            }

            if (empty($fieldSetting)) {
                $fieldSetting['id']          = [
                    'label'   => 'ID',
                    'checked' => true,
                ];
                $fieldSetting['title']       = [
                    'label'   => 'Title',
                    'checked' => true,
                ];
                $fieldSetting['ip']          = [
                    'label'   => 'IP',
                    'checked' => true,
                ];
                $fieldSetting['dateCreated'] = [
                    'label'   => 'Date Created',
                    'checked' => true,
                ];
            }

            foreach ($form->getLayout()->getFields() as $field) {
                if (
                    $field instanceof NoStorageInterface ||
                    $field instanceof CreditCardDetailsField ||
                    $field instanceof SignatureField ||
                    !$field->getId() ||
                    \in_array($field->getId(), $storedFieldIds, true)
                ) {
                    continue;
                }

                $fieldSetting[$field->getId()] = [
                    'label'   => $field->getLabel(),
                    'checked' => true,
                ];
            }

            $formSetting['form']   = $form;
            $formSetting['fields'] = $fieldSetting;

            $setting[] = $formSetting;
        }

        $selectedFormId = null;
        if ($formId && isset($forms[$formId])) {
            $selectedFormId = $formId;
        } else if ($firstForm) {
            $selectedFormId = $firstForm->getId();
        }

        return $this->renderTemplate(
            'freeform/_components/modals/export_csv',
            [
                'setting'        => $setting,
                'forms'          => $forms,
                'fields'         => $fields,
                'selectedFormId' => $selectedFormId,
            ]
        );
    }

    /**
     * @throws ComposerException
     * @throws BadRequestHttpException
     * @throws ForbiddenHttpException
     */
    public function actionIndex()
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);

        $settings = $this->getExportSettings();

        $formId       = \Craft::$app->request->post('form_id');
        $exportType   = \Craft::$app->request->post('export_type');
        $exportFields = \Craft::$app->request->post('export_fields');

        $formModel = $this->getFormsService()->getFormById($formId);
        if (!$formModel) {
            return;
        }

        $canManageAll = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
        if (!$canManageAll) {
            PermissionHelper::requirePermission(
                PermissionHelper::prepareNestedPermission(
                    Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                    $formId
                )
            );
        }

        $form      = $formModel->getForm();
        $fieldData = $exportFields[$form->getId()];

        $settings->setting = $exportFields;
        $settings->save();

        $searchableFields = [];
        foreach ($fieldData as $fieldId => $data) {
            $isChecked = $data['checked'];

            if (!(bool) $isChecked) {
                continue;
            }

            $fieldName = is_numeric($fieldId) ? Submission::getFieldColumnName($fieldId) : $fieldId;
            $fieldName = $fieldName === 'title' ? 'c.' . $fieldName : 's.' . $fieldName;

            $searchableFields[] = $fieldName;
        }

        $query = (new Query())
            ->select($searchableFields)
            ->from(Submission::TABLE . ' s')
            ->innerJoin('{{%content}} c', 'c.[[elementId]] = s.[[id]]')
            ->where(['s.[[formId]]' => $form->getId()]);

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Table::ELEMENTS;
            $query->innerJoin(
                $elements . ' e',
                'e.[[id]] = s.[[id]] AND e.[[dateDeleted]] IS NULL'
            );
        }

        $data = $query->all();

        $removeNewlines = Freeform::getInstance()->settings->isRemoveNewlines();
        $exporter       = AbstractExport::create($exportType, $form, $data, $removeNewlines);

        $this->getExportProfileService()->export($exporter, $form);
    }

    /**
     * @return ExportSettingRecord
     */
    private function getExportSettings(): ExportSettingRecord
    {
        $userId   = \Craft::$app->user->getId();
        $settings = ExportSettingRecord::findOne(
            [
                'userId' => $userId,
            ]
        );

        if (!$settings) {
            $settings = ExportSettingRecord::create($userId);
        }

        return $settings;
    }
}
