<?php

namespace Solspace\Freeform\controllers\client\api\forms;

use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Symfony\Component\Serializer\Serializer;
use yii\web\Response;

class RulesController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private RuleProvider $ruleProvider,
        private Serializer $serializer,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGet(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            return $this->asJson([]);
        }

        $rules = $this->ruleProvider->getFormRules($form);
        $serialized = $this->serializer->serialize($rules, 'json');

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $serialized;

        return $this->response;
    }
}
