<?php

namespace Solspace\Freeform\controllers\api\forms;

use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Symfony\Component\Serializer\Serializer;
use yii\web\Response;

class RulesController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private RuleProvider $ruleProvider,
        private Serializer $serializer,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGet(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);

        return $this->compileResponse($this->ruleProvider->getFormRules($form));
    }

    public function actionGetNotifications(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);

        return $this->compileResponse($this->ruleProvider->getFormNotificationRules($form));
    }

    public function actionGetIntegrations(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);

        return $this->compileResponse($this->ruleProvider->getFormIntegrationRules($form));
    }

    private function compileResponse(mixed $content): Response
    {
        $serialized = $this->serializer->serialize($content, 'json', ['groups' => 'builder']);

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $serialized;

        return $this->response;
    }
}
