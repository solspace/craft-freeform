<?php

namespace Solspace\Freeform\controllers\api\templates;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Codepack\TemplateReplacer;

class DemoController extends BaseApiController
{
    protected function post(int|string|null $id = null): array|object|null
    {
        $settings = $this->getSettingsService();
        $fileName = $this->request->post('template');

        $replacer = new TemplateReplacer(
            $fileName,
            $settings->getSolspaceFormTemplateDirectory(),
            $settings->getFormTemplateDirectory(),
        );

        $replacer->replace();

        $this->response->setStatusCode(201);

        return null;
    }
}
