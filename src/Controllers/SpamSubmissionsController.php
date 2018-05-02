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
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Services\SubmissionsService;

class SpamSubmissionsController extends SubmissionsController
{
    const SPAM_TEMPLATE_BASE_PATH = 'freeform/spam';

    /**
     * @inheritdoc
     */
    protected function getTemplateBasePath(): string
    {
        return self::SPAM_TEMPLATE_BASE_PATH;
    }

    /**
     * @return SubmissionsService
     */
    public function getSubmissionsService(): SubmissionsService
    {
        return $this->getSpamSubmissionsService();
    }

    /**
     * @return \yii\web\Response
     * @throws FreeformException
     * @throws \yii\web\BadRequestHttpException
     * @throws \yii\web\ForbiddenHttpException
     */
    public function actionWhitelist()
    {
        $post = \Craft::$app->request->post();

        $submissionId = $post['submissionId'] ?? null;
        $model        = $this->getSpamSubmissionsService()->getSubmissionById($submissionId);

        if (!$model) {
            throw new FreeformException(Freeform::t('Submission not found'));
        }

        PermissionHelper::requirePermission(
            PermissionHelper::prepareNestedPermission(
                Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                $model->formId
            )
        );

        $model->setFormFieldValues($post);

        if ($this->getSpamSubmissionsService()->whitelistSpamSubmission($model)) {
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
}
