<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use yii\web\Response;

class OptionsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private PropertyProvider $propertyProvider
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGenerateOptions(): Response
    {
        $request = $this->request;

        $type = $request->post('typeClass');
        $properties = $request->post('properties');

        /** @var OptionTypeProviderInterface $configuration */
        $configuration = new $type();
        $this->propertyProvider->setObjectProperties($configuration, $properties);

        return $this->asSerializedJson($configuration->generateOptions()->toArray());
    }
}
