<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Library\Helpers\SitesHelper;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class EmbedController extends BaseController
{
    protected array|bool|int $allowAnonymous = ['form'];

    public function actionForm(string $handle): Response
    {
        $this->requireGetRequest();

        $form = $this->getFormsService()->getFormByHandle($handle, SitesHelper::getFrontendSiteHandle());
        if (!$form || $form->getDateArchived()) {
            throw new NotFoundHttpException('Form not found');
        }

        // The frame has its own Craft page and session. AJAX keeps validation and
        // success messages in the frame, including forms configured for page reloads.
        $form->getSettings()->getBehavior()->ajax = true;

        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');
        $this->response->getHeaders()->set('X-Frame-Options', 'SAMEORIGIN');

        return $this->renderTemplate('freeform-embed/form', [
            'form' => $form,
            'formattingTemplate' => $form->getSettings()->getGeneral()->formattingTemplate,
        ]);
    }
}
