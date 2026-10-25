<?php

namespace Solspace\Freeform\controllers\api\templates;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Codepack\BuilderSampleTemplate;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\ServerErrorHttpException;

class BuilderSampleController extends BaseApiController
{
    protected function post(int|string|null $id = null): array
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        if (!Freeform::getInstance()->isPro() || !$this->getSettingsService()->isAllowAdminEdit()) {
            throw new ForbiddenHttpException('Builder templates cannot be changed.');
        }

        $directory = $this->getSettingsService()->getSettingsModel()->getAbsoluteBuilderTemplateDirectory();
        if (!$directory) {
            throw new BadRequestHttpException('Choose an existing Builder Templates directory first.');
        }

        $sample = (string) $this->request->post('sample', '');

        try {
            $name = BuilderSampleTemplate::createIn($directory, $sample);
        } catch (\InvalidArgumentException $exception) {
            throw new BadRequestHttpException($exception->getMessage(), 0, $exception);
        } catch (\RuntimeException $exception) {
            throw new ServerErrorHttpException($exception->getMessage(), 0, $exception);
        }

        $this->response->setStatusCode(201);

        return ['fileName' => $name];
    }
}
