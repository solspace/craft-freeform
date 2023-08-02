<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Bundles\Persistence\Duplication\FormDuplicator;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class FormsController extends BaseApiController
{
    public const EVENT_UPSERT_FORM = 'upsert-form';
    public const EVENT_CREATE_FORM = 'create-form';
    public const EVENT_UPDATE_FORM = 'update-form';

    public function __construct(
        $id,
        $module,
        $config = [],
        private FormTransformer $formTransformer,
        private FormDuplicator $formDuplicator,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionClone(int $id): Response
    {
        $this->requireFormPermission($id);

        if (!$this->formDuplicator->clone($id)) {
            throw new FreeformException('Could not duplicate form');
        }

        $this->response->statusCode = 204;
        $this->response->format = Response::FORMAT_RAW;
        $this->response->content = '';

        return $this->response;
    }

    protected function get(): array
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        return $this->formTransformer->transformList(
            array_values(
                $this->getFormsService()->getAllForms()
            )
        );
    }

    protected function getOne($id): array|object|null
    {
        $this->requireFormPermission($id, Freeform::PERMISSION_FORMS_ACCESS);

        $form = $this->getFormsService()->getFormById($id);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$id} not found");
        }

        return $this->formTransformer->transform($form);
    }

    protected function post(int|string $id = null): array|object|null
    {
        $this->requireFormPermission($id);

        $data = json_decode($this->request->getRawBody(), false);

        $event = new PersistFormEvent($data);
        $this->trigger(self::EVENT_CREATE_FORM, $event);
        $this->trigger(self::EVENT_UPSERT_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 201;

        return $event->getResponseData();
    }

    protected function put(int|string $id = null): array|object|null
    {
        $this->requireFormPermission($id);

        $data = json_decode($this->request->getRawBody(), false);

        $event = new PersistFormEvent($data, $id);
        $this->trigger(self::EVENT_UPDATE_FORM, $event);
        $this->trigger(self::EVENT_UPSERT_FORM, $event);

        $this->response->statusCode = $event->getStatus() ?? 204;

        return $event->getResponseData();
    }

    protected function delete(int $id): bool|null
    {
        $this->requireFormPermission($id, Freeform::PERMISSION_FORMS_DELETE);

        $this->getFormsService()->deleteById($id);

        $this->response->statusCode = 204;

        return null;
    }

    private function requireFormPermission(int $id, string $permission = Freeform::PERMISSION_FORMS_MANAGE): void
    {
        $nestedPermission = PermissionHelper::prepareNestedPermission($permission, $id);

        $canManageAll = PermissionHelper::checkPermission($permission);
        $canManageCurrent = PermissionHelper::checkPermission($nestedPermission);

        if (!$canManageAll && !$canManageCurrent) {
            throw new ForbiddenHttpException('User is not permitted to perform this action');
        }
    }
}
