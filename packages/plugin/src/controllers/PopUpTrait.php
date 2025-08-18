<?php

namespace Solspace\Freeform\controllers;

use craft\web\View;
use yii\web\Response;

trait PopUpTrait
{
    protected function closePopUpWindowResponse(): Response
    {
        $this->response->format = Response::FORMAT_HTML;
        $this->response->statusCode = 200;
        $this->response->content = <<<'HTML'
                <script>
                  window.opener && window.opener.postMessage({ type: 'oauth2' }, window.location.origin);
                  window.close();
                </script>
            HTML;

        return $this->response;
    }

    protected function renderPopUpError(array|string $messages): Response
    {
        if (!\is_array($messages)) {
            $messages = [$messages];
        }

        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);

        return $this->renderTemplate(
            'freeform/settings/integrations/callback-error',
            ['messages' => $messages],
        );
    }
}
