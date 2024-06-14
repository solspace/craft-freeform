<?php

namespace Solspace\Freeform\controllers\api\types;

use Solspace\Freeform\Bundles\Transformers\Options\OptionTypeTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;
use yii\web\Response;

class OptionsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private OptionTypeTransformer $optionTypeTransformer,
        private OptionTypesProvider $optionTypesProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetElementTypes(): Response
    {
        return $this->getSerializedTypes($this->optionTypesProvider->getElementTypes());
    }

    public function actionGetPredefinedTypes(): Response
    {
        return $this->getSerializedTypes($this->optionTypesProvider->getPredefinedTypes());
    }

    public function actionOptions(string $type): Response
    {
        $this->requirePostRequest();

        $request = \Craft::$app->getRequest();
        $formId = $request->post('formId');
        $fieldId = $request->post('fieldId');
        $query = $request->post('query');

        $options = $this->getOptionsService()->getOptions($formId, $fieldId, $query);

        return $this->asJson($options);
    }

    private function getSerializedTypes(array $types): Response
    {
        $serialized = [];
        foreach ($types as $type) {
            $serialized[] = $this->optionTypeTransformer->transform($type);
        }

        return $this->asSerializedJson($serialized);
    }
}
