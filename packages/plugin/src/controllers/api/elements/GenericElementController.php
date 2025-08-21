<?php

namespace Solspace\Freeform\controllers\api\elements;

use craft\base\ElementInterface;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class GenericElementController extends BaseApiController
{
    public function actionStatuses(): Response
    {
        $collection = new OptionCollection();

        if (isset($_GET['type'])) {
            $type = $_GET['type'];

            if (!class_exists($type)) {
                throw new \Exception('Invalid element type');
            }

            if (!is_subclass_of($type, ElementInterface::class)) {
                throw new \Exception('Invalid element type');
            }

            $statuses = $type::statuses();

            foreach ($statuses as $key => $value) {
                if (\is_array($value)) {
                    $value = $value['label'] ?? $key;
                }

                $collection->add($key, $value);
            }
        }

        return $this->asSerializedJson($collection);
    }
}
