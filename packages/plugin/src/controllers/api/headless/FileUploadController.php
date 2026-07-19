<?php

namespace Solspace\Freeform\controllers\api\headless;

use craft\db\Query;
use craft\elements\Asset;
use craft\web\Response;
use Solspace\Freeform\Bundles\Form\Security\FormSecret;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Records\UnfinalizedFileRecord;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;

class FileUploadController extends BaseHeadlessController
{
    public function actionUpload(string $handle, string $fieldHandle): Response
    {
        $this->requirePostRequest();
        $this->getHeadlessAccessService()->requireEnabled();

        $form = $this->getFormsService()->getFormByHandle($handle);
        if (!$form) {
            throw new NotFoundHttpException(\sprintf('Form "%s" not found.', $handle));
        }

        $this->getHeadlessAccessService()->requireSubmitAccess($form);
        $this->validateCsrf();

        $field = $form->get($fieldHandle);
        if (!$field instanceof FileDragAndDropField) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'Invalid file upload field.',
            ], 400);
        }

        $uploadToken = $this->resolveUploadToken();
        $form->getProperties()->set(FormSecret::KEY, $uploadToken);

        if (!$field->getAssetSourceId()) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'File upload field has no asset source configured.',
            ], 400);
        }

        $totalUploaded = (int) (new Query())
            ->select('id')
            ->from(UnfinalizedFileRecord::TABLE)
            ->where([
                'fieldHandle' => $fieldHandle,
                'formToken' => $uploadToken,
            ])
            ->count()
        ;

        if ($totalUploaded >= $field->getFileCount()) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'Too many files uploaded.',
            ], 400);
        }

        if (!$field->isValid()) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'File validation failed.',
                'errors' => $field->getErrors(),
            ], 400);
        }

        $asset = $this->getFilesService()->uploadDragAndDropFile($field, $form);
        if (!$asset) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'Upload failed.',
                'errors' => $field->getErrors(),
            ], 400);
        }

        $response = $this->asHeadlessJson([
            'success' => true,
            'data' => [
                'id' => $asset->uid,
                'name' => $asset->getFilename(),
                'extension' => $asset->getExtension(),
                'size' => $asset->size,
                'url' => $asset->getUrl(['width' => 150, 'height' => 150]),
            ],
            'meta' => [
                'uploadToken' => $uploadToken,
            ],
        ]);
        $this->getResponseHelper()->applyNoStore($response);

        return $response;
    }

    public function actionDelete(string $handle, string $fieldHandle): Response
    {
        $this->requirePostRequest();
        $this->getHeadlessAccessService()->requireEnabled();

        $form = $this->getFormsService()->getFormByHandle($handle);
        if (!$form) {
            throw new NotFoundHttpException(\sprintf('Form "%s" not found.', $handle));
        }

        $this->getHeadlessAccessService()->requireSubmitAccess($form);
        $this->validateCsrf();

        $field = $form->get($fieldHandle);
        if (!$field instanceof FileDragAndDropField) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'Invalid file upload field.',
            ], 400);
        }

        $uploadToken = $this->resolveUploadToken();
        $uid = (string) \Craft::$app->getRequest()->getBodyParam('id', '');
        if ('' === $uid) {
            throw new BadRequestHttpException('Missing file id.');
        }

        $asset = Asset::find()->uid($uid)->one();
        if (!$asset) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'File does not exist.',
            ], 404);
        }

        $uploadedFileExists = (bool) (new Query())
            ->select('id')
            ->from(UnfinalizedFileRecord::TABLE)
            ->where([
                'assetId' => $asset->id,
                'formToken' => $uploadToken,
                'fieldHandle' => $fieldHandle,
            ])
            ->count()
        ;

        if (!$uploadedFileExists) {
            return $this->asHeadlessJson([
                'success' => false,
                'message' => 'File does not exist.',
            ], 404);
        }

        if (\Craft::$app->elements->deleteElement($asset)) {
            \Craft::$app->db
                ->createCommand()
                ->delete(UnfinalizedFileRecord::TABLE, ['assetId' => $asset->id])
                ->execute()
            ;
        }

        $response = $this->asHeadlessJson(['success' => true]);
        $this->getResponseHelper()->applyNoStore($response);

        return $response;
    }

    private function resolveUploadToken(): string
    {
        $request = \Craft::$app->getRequest();
        $token = $request->getHeaders()->get('X-Freeform-Upload-Token')
            ?: $request->getBodyParam('uploadToken');

        if (\is_string($token) && '' !== trim($token)) {
            return trim($token);
        }

        return CryptoHelper::getUniqueToken(20);
    }

    private function validateCsrf(): void
    {
        $request = \Craft::$app->getRequest();
        if (!$request->enableCsrfValidation) {
            return;
        }

        $submitted = $request->getHeaders()->get('X-CSRF-Token')
            ?: $request->getBodyParam($request->csrfParam);

        if (!$submitted || !$request->validateCsrfToken($submitted)) {
            throw new BadRequestHttpException('Invalid CSRF token.');
        }
    }
}
