<?php

namespace Solspace\Freeform\Integrations\Other\Supabase\Controllers;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Other\Supabase\Supabase;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class SupabaseController extends BaseApiController
{
    public function actionTables(): Response
    {
        $integration = $this->getIntegration();
        $client = \Craft::$container->get(IntegrationClientProvider::class)->getAuthorizedClient($integration);
        $options = new OptionCollection();
        foreach ($integration->fetchTables($client) as $table) {
            $options->add($table, $table);
        }

        return $this->asSerializedJson($options);
    }

    public function actionFields(): Response
    {
        $integration = $this->getIntegration();
        $table = $this->request->get('table');
        if (!\is_string($table) || '' === $table) {
            return $this->asSerializedJson([]);
        }
        $fields = $this->getCrmService()->getFields(
            $integration,
            $integration->getFieldCategory($table),
            filter_var($this->request->get('refresh', false), \FILTER_VALIDATE_BOOLEAN),
        );

        $payload = [];
        foreach ($fields as $field) {
            $payload[] = [
                'id' => $field->getHandle(),
                'label' => $field->getLabel(),
                'type' => $field->getType(),
                'required' => $field->isRequired(),
                'options' => $field->getOptions(),
            ];
        }

        return $this->asSerializedJson($payload);
    }

    private function getIntegration(): Supabase
    {
        $this->requireCpRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        $formId = filter_var($this->request->get('formId'), \FILTER_VALIDATE_INT);
        if ($formId && $formId > 0) {
            if (!PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE)
                && !PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_FORMS_MANAGE, $formId))
            ) {
                throw new ForbiddenHttpException('User is not permitted to manage this form.');
            }
            if (!$this->getFormsService()->getFormById($formId)) {
                throw new NotFoundHttpException('Form not found.');
            }
        } else {
            // New forms do not yet have a persisted numeric ID.
            PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_CREATE);
        }

        $id = filter_var($this->request->get('integrationId'), \FILTER_VALIDATE_INT);
        $integration = $id && $id > 0 ? $this->getIntegrationsService()->getIntegrationObjectById($id) : null;
        if (!$integration instanceof Supabase) {
            throw new NotFoundHttpException('Supabase integration not found.');
        }

        return $integration;
    }
}
