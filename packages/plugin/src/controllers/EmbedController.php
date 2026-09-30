<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Library\Helpers\SitesHelper;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class EmbedController extends BaseController
{
    protected array|bool|int $allowAnonymous = ['form'];

    public function actionForm(string $handle): Response
    {
        if (!$this->request->getIsGet()) {
            throw new HttpException(405, 'GET required');
        }

        $form = $this->getFormsService()->getFormByHandle($handle, SitesHelper::getFrontendSiteHandle());
        if (!$form || $form->getDateArchived() || !$form->getSettings()->getGeneral()->allowHtmlEmbeds) {
            throw new NotFoundHttpException('Form not found');
        }

        // The frame has its own Craft page and session. AJAX keeps validation and
        // success messages in the frame, including forms configured for page reloads.
        $form->getSettings()->getBehavior()->ajax = true;

        $response = $this->renderTemplate('freeform-embed/form', [
            'form' => $form,
            'formattingTemplate' => $form->getSettings()->getGeneral()->formattingTemplate,
        ]);

        $headers = $response->getHeaders();
        $headers->set('Cache-Control', 'no-store, private');
        $headers->set('X-Frame-Options', 'SAMEORIGIN');
        // A separate policy is enforced alongside any CSP registered by the
        // site's forms or payment integrations.
        $headers->add('Content-Security-Policy', "frame-ancestors 'self'");

        return $response;
    }
}
