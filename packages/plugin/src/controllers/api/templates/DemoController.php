<?php

namespace Solspace\Freeform\controllers\api\templates;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Codepack\TemplateReplacer;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;

class DemoController extends BaseApiController
{
    protected function post(int|string|null $id = null): array|object|null
    {
        $this->requireCpRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        $settings = $this->getSettingsService();
        if (!$settings->isAllowAdminEdit()) {
            throw new ForbiddenHttpException('Formatting templates cannot be changed.');
        }
        $directory = $settings->getFormTemplateDirectory();
        if (!$directory) {
            throw new BadRequestHttpException('Choose an existing Formatting Templates directory first.');
        }

        $fileName = $this->request->post('template');
        $name = trim((string) $this->request->post('name', ''));
        $sample = null;
        foreach ($settings->getSolspaceFormTemplates() as $candidate) {
            if ($candidate->getFileName() === $fileName) {
                $sample = $candidate;

                break;
            }
        }
        if (!$sample) {
            throw new BadRequestHttpException('Choose a valid sample formatting template.');
        }
        if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,79}$/D', $name)) {
            throw new BadRequestHttpException('Enter a name using letters, numbers, spaces, hyphens, or underscores.');
        }
        $slug = strtolower(trim((string) preg_replace('/[^a-zA-Z0-9]+/', '-', $name), '-'));

        $replacer = new TemplateReplacer(
            $sample->getFileName(),
            $settings->getSolspaceFormTemplateDirectory(),
            $directory,
            $slug,
        );

        try {
            $folder = $replacer->replace();
        } catch (\InvalidArgumentException $exception) {
            throw new BadRequestHttpException($exception->getMessage(), 0, $exception);
        }

        $this->response->setStatusCode(201);

        return ['folder' => $folder];
    }
}
