<?php

namespace Solspace\Freeform\controllers\api\types;

use Solspace\Freeform\Bundles\Transformers\Options\ElementOptionTypeTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Categories\Categories;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries\Entries;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Tags\Tags;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users\Users;
use yii\web\Response;

class OptionsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private ElementOptionTypeTransformer $optionTypeTransformer,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetElementTypes(): Response
    {
        $types = [
            new Entries(),
            new Users(),
            new Categories(),
            new Tags(),
        ];

        $serialized = [];
        foreach ($types as $type) {
            $serialized[] = $this->optionTypeTransformer->transform($type);
        }

        return $this->asSerializedJson($serialized);
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
}
