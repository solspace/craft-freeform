<?php

namespace Solspace\Freeform\controllers\api\types;

use Solspace\Freeform\Bundles\Transformers\Options\OptionTypeTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Assets\Assets;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Categories\Categories;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries\Entries;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Tags\Tags;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users\Users;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Countries\Countries;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Currencies\Currencies;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Days\Days;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\DaysOfWeek\DaysOfWeek;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Languages\Languages;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Months\Months;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Numbers\Numbers;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Provinces\Provinces;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\States\States;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Years\Years;
use yii\web\Response;

class OptionsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private OptionTypeTransformer $optionTypeTransformer,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGetElementTypes(): Response
    {
        $types = [
            new Assets(),
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

    public function actionGetPredefinedTypes(): Response
    {
        $types = [
            new States(),
            new Provinces(),
            new Countries(),
            new Languages(),
            new Currencies(),
            new Numbers(),
            new Years(),
            new Months(),
            new Days(),
            new DaysOfWeek(),
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
