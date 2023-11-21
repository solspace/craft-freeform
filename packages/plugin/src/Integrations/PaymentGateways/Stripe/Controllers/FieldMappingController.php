<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use yii\web\NotFoundHttpException;

class FieldMappingController extends BaseApiController
{
    protected function getOne($category): array|object
    {
        $id = $this->request->get('id');

        /** @var Stripe $integration */
        $integration = Freeform::getInstance()->integrations->getIntegrationObjectById($id);
        if (!$integration) {
            throw new NotFoundHttpException('Integration not found');
        }

        $fields = $integration->fetchFields($category);

        $payload = [];
        foreach ($fields as $field) {
            $payload[] = [
                'id' => $field->getHandle(),
                'label' => $field->getLabel(),
                'required' => $field->isRequired(),
                'type' => $field->getType(),
            ];
        }

        return $payload;
    }
}
