<?php

namespace Solspace\Freeform\controllers;

use craft\db\Query;
use craft\elements\Asset;
use Solspace\Freeform\Bundles\Form\Context\Request\EditSubmissionContext;
use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Bundles\Form\Security\FormSecret;
use Solspace\Freeform\Fields\Pro\FileDragAndDropField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Records\UnfinalizedFileRecord;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class FileUploadController extends BaseController
{
    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = true;

    public function actionGet(): Response
    {
        $this->requirePostRequest();

        $request = \Craft::$app->request;
        $handle = $request->post('handle');

        $form = $this->getVerifiedForm();
        $field = $form->get($handle);

        if (!$field instanceof FileDragAndDropField) {
            return $this->createErrorResponse(['Invalid field type']);
        }

        $payload = [];
        foreach ($field->getAssets()->all() as $asset) {
            $payload[] = [
                'id' => $asset->uid,
                'name' => $asset->getFilename(),
                'extension' => $asset->getExtension(),
                'size' => $asset->getFormattedSize(1),
                'url' => $asset->getUrl(['width' => 150, 'height' => 150]),
            ];
        }

        return $this->asJson($payload);
    }

    public function actionPost(): Response
    {
        $this->requirePostRequest();
        $request = \Craft::$app->request;
        $handle = $request->post('handle');

        $form = $this->getVerifiedForm();
        $field = $form->get($handle);

        $token = FormSecret::get($form);

        if (!$field instanceof FileDragAndDropField) {
            return $this->createErrorResponse(['Invalid file upload field used']);
        }

        $totalUploaded = (int) (new Query())
            ->select('id')
            ->from(UnfinalizedFileRecord::TABLE)->where([
                'fieldHandle' => $handle,
                'formToken' => $token,
            ])
            ->count()
        ;

        if ($totalUploaded >= $field->getFileCount()) {
            return $this->createErrorResponse(['Too many files uploaded']);
        }

        if (!$field->isValid()) {
            return $this->createErrorResponse($field->getErrors());
        }

        $asset = $this->getFilesService()->uploadDragAndDropFile($field, $form);
        if (!$asset) {
            return $this->createErrorResponse($field->getErrors());
        }

        return $this->asJson(['id' => $asset->uid]);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();

        $form = $this->getVerifiedForm();
        $token = FormSecret::get($form);
        $handle = \Craft::$app->request->post('handle');
        $uid = \Craft::$app->request->post('id');

        $asset = Asset::find()->uid($uid)->one();
        if (!$asset) {
            return $this->createErrorResponse(['File doesn\'t exist.']);
        }

        $uploadedFileExists = false;
        $editToken = EditSubmissionContext::getToken($form);
        if ($editToken) {
            $submission = Freeform::getInstance()
                ->submissions
                ->getSubmissionByToken($editToken)
            ;

            if ($submission) {
                try {
                    $field = $submission->{$handle};
                    if ($field instanceof FileDragAndDropField) {
                        $uploadedAssets = $field->getValue();
                        $uploadedFileExists = \in_array($asset->id, $uploadedAssets, false);

                        if ($uploadedFileExists && $uploadedAssets) {
                            $index = array_search($asset->id, $uploadedAssets, false);
                            unset($uploadedAssets[$index]);
                            $submission->setFormFieldValues([$handle => array_values($uploadedAssets)], false);
                            \Craft::$app->elements->saveElement($submission);
                        }
                    }
                } catch (\Exception $e) {
                }
            }
        }

        if (!$uploadedFileExists) {
            $uploadedFileExists = (bool) (new Query())
                ->select('id')
                ->from(UnfinalizedFileRecord::TABLE)->where([
                    'assetId' => $asset->id,
                    'formToken' => $token,
                ])
                ->count()
            ;
        }

        if ($uploadedFileExists && $asset) {
            if (\Craft::$app->elements->deleteElement($asset)) {
                \Craft::$app->db
                    ->createCommand()
                    ->delete(UnfinalizedFileRecord::TABLE, ['assetId' => $asset->id])
                    ->execute()
                ;
            }

            return $this->asJson(['success' => true]);
        }

        return $this->createErrorResponse(['File doesn\'t exist.']);
    }

    private function getVerifiedForm(): Form
    {
        $request = \Craft::$app->request;

        $formId = SessionContext::getPostedFormId();
        $formModel = $this->getFormsService()->getFormById($formId);
        if (!$formModel) {
            throw new FreeformException(
                \Craft::t('freeform', 'Form with ID {id} not found', ['id' => $formId])
            );
        }

        $form = $formModel->getForm();
        $form->handleRequest($request);

        if ($form->isFormPosted()) {
            return $form;
        }

        throw new BadRequestHttpException('Invalid form used');
    }

    private function createErrorResponse($messages = [], $statusCode = 400): Response
    {
        $response = $this->asJson([
            'type' => 'field-error',
            'messages' => $messages,
        ]);

        $response->setStatusCode($statusCode);

        return $response;
    }
}
