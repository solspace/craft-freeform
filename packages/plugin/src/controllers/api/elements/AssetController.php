<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class AssetController extends BaseApiController
{
    public function actionFieldOptions(): Response
    {
        $collection = new OptionCollection();
        $collection
            ->add('id', 'ID')
            ->add('filename', 'Filename')
        ;

        if (isset($_GET['order'])) {
            return $this->asSerializedJson($collection);
        }

        $assetSourceId = \Craft::$app->getRequest()->get('assetSourceId');
        if ($assetSourceId) {
            $fields = \Craft::$app->getVolumes()->getVolumeById($assetSourceId)->getFieldLayout()->getCustomFields();
            foreach ($fields as $field) {
                $collection->add($field->handle, $field->name);
            }
        }

        return $this->asSerializedJson($collection);
    }
}
