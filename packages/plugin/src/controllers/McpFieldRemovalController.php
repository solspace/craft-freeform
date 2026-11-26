<?php

namespace Solspace\Freeform\controllers;

use craft\helpers\UrlHelper;
use Mcp\Exception\ToolCallException;
use Solspace\Freeform\Bundles\Mcp\FieldRemoval;
use Solspace\Freeform\Freeform;
use yii\web\Response;

class McpFieldRemovalController extends BaseController
{
    public function actionReview(): Response
    {
        $this->requireCpRequest();
        $this->requireLogin();

        $confirm = $this->request->getIsPost();
        $token = $confirm ? $this->request->getRequiredBodyParam('review') : $this->request->getRequiredQueryParam('review');
        $headers = \Craft::$app->getResponse()->getHeaders();
        $headers->set('Cache-Control', 'no-store, private');
        $headers->set('Referrer-Policy', 'no-referrer');

        try {
            if (!\is_string($token) || ($confirm && '1' !== $this->request->getBodyParam('confirmRemoval'))) {
                throw new ToolCallException('Confirm that you understand the consequences before removing the field.');
            }
            $impact = FieldRemoval::review($token, $confirm);
        } catch (ToolCallException $exception) {
            return $this->renderTemplate('freeform/forms/mcp-field-removal', ['error' => $exception->getMessage()]);
        }

        if ($confirm) {
            \Craft::$app->getSession()->setNotice(Freeform::t('Field removed. Its existing submission values are retained in the database.'));

            return $this->redirect(UrlHelper::cpUrl('freeform/forms/'.$impact['formId']));
        }

        return $this->renderTemplate('freeform/forms/mcp-field-removal', compact('impact', 'token'));
    }
}
