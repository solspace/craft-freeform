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
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\PermissionsHelper;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Resources\Bundles\FieldEditorBundle;
use Solspace\Freeform\Services\FieldsService;
use Solspace\Freeform\Services\FilesService;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class FieldsController extends Controller
{
    /**
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     */
    public function actionIndex(): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FIELDS_ACCESS);

        $fieldsService = $this->getFieldsService();
        $fields        = $fieldsService->getAllFields();

        return $this->renderTemplate(
            'freeform/fields',
            [
                'fields'     => $fields,
                'fieldTypes' => AbstractField::getFieldTypes(),
            ]
        );
    }

    /**
     * @return Response
     * @throws \yii\base\InvalidParamException
     * @throws \yii\web\ForbiddenHttpException
     */
    public function actionCreate(): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FIELDS_MANAGE);

        $model = FieldModel::create();

        return $this->renderEditForm($model, 'Create new field');
    }

    /**
     * @param int $id
     *
     * @return Response
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     * @throws \HttpException
     */
    public function actionEdit(int $id): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FIELDS_MANAGE);

        $model = $this->getFieldsService()->getFieldById($id);

        if (!$model) {
            throw new \HttpException(404, Freeform::t('Field with ID {id} not found', ['id' => $id]));
        }

        return $this->renderEditForm($model, $model->label);
    }

    /**
     * @throws ForbiddenHttpException
     * @throws FreeformException
     * @throws BadRequestHttpException
     * @throws \Exception
     */
    public function actionSave()
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FIELDS_MANAGE);

        $post = \Craft::$app->request->post();

        $fieldId = $post['fieldId'] ?? null;
        $field   = $this->getNewOrExistingField($fieldId);

        if ($field->id && isset($post['type'])) {
            unset($post['type']);
        }

        $field->setAttributes($post);

        $fieldHasOptions = \in_array(
            $field->type,
            [
                FieldInterface::TYPE_RADIO_GROUP,
                FieldInterface::TYPE_CHECKBOX_GROUP,
                FieldInterface::TYPE_SELECT,
                FieldInterface::TYPE_DYNAMIC_RECIPIENTS,
            ],
            true
        );

        if (isset($post['types'][$field->type])) {
            $fieldSpecificPost = $post['types'][$field->type];
            $field->addMetaProperties($fieldSpecificPost);

            $hasValues         = isset($fieldSpecificPost['values']) && is_array($fieldSpecificPost['values']);
            $forceLabelOnValue = isset($fieldSpecificPost['customValues']) && $fieldSpecificPost['customValues'] !== '1';

            if ($fieldHasOptions && $hasValues) {
                $field->setPostValues($fieldSpecificPost, $forceLabelOnValue);
            } else {
                $field->setMetaProperty('values', null);
            }
        }

        if ($this->getFieldsService()->save($field)) {
            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Field saved'));
            \Craft::$app->session->setFlash('Field saved', true);

            return $this->redirectToPostedUrl($field);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Field not saved'));

        // Send the event back to the template
        \Craft::$app->urlManager->setRouteParams(['field' => $field, 'errors' => $field->getErrors()]);
    }

    /**
     * Deletes a field
     *
     * @return Response
     * @throws BadRequestHttpException
     * @throws ForbiddenHttpException
     * @throws \Exception
     */
    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_FIELDS_MANAGE);

        $fieldId = \Craft::$app->request->post('id');

        $this->getFieldsService()->deleteById((int) $fieldId);

        return $this->asJson(['success' => true]);
    }

    /**
     * @param FieldModel $model
     * @param string     $title
     *
     * @return Response
     * @throws InvalidParamException
     */
    private function renderEditForm(FieldModel $model, string $title): Response
    {
        $this->view->registerAssetBundle(FieldEditorBundle::class);

        $variables = [
            'field'              => $model,
            'title'              => $title,
            'fieldTypes'         => AbstractField::getFieldTypes(),
            'fileKinds'          => Assets::getFileKinds(),
            'assetSources'       => $this->getFilesService()->getAssetSourceList(),
            'continueEditingUrl' => 'freeform/fields/{id}',
        ];

        return $this->renderTemplate('freeform/fields/edit', $variables);
    }

    /**
     * @return FieldsService
     */
    private function getFieldsService(): FieldsService
    {
        return Freeform::getInstance()->fields;
    }

    /**
     * @return FilesService
     */
    private function getFilesService(): FilesService
    {
        return Freeform::getInstance()->files;
    }

    /**
     * @param int $fieldId
     *
     * @return FieldModel
     * @throws FreeformException
     */
    private function getNewOrExistingField($fieldId): FieldModel
    {
        if ($fieldId) {
            $field = $this->getFieldsService()->getFieldById($fieldId);

            if (!$field) {
                throw new FreeformException(Freeform::t('Field with ID {id} not found', ['id' => $fieldId]));
            }
        } else {
            $field = FieldModel::create();
        }

        return $field;
    }
}
