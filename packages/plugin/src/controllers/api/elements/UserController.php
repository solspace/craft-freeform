<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class UserController extends BaseApiController
{
    public function actionAttributes(): Response
    {
        return $this->asJson([
            ['id' => 'username', 'label' => 'Username', 'required' => true],
            ['id' => 'firstName', 'label' => 'First Name', 'required' => false],
            ['id' => 'lastName', 'label' => 'Last Name', 'required' => false],
            ['id' => 'email', 'label' => 'Email', 'required' => true],
            ['id' => 'password', 'label' => 'Password', 'required' => false],
            ['id' => 'photo', 'label' => 'Photo', 'required' => false],
        ]);
    }

    public function actionFields(): Response
    {
        $layout = \Craft::$app->getUser()->getIdentity()->getFieldLayout();

        $fields = [];
        foreach ($layout->getCustomFields() as $item) {
            $fields[] = [
                'id' => $item->id,
                'label' => $item->name,
                'required' => $item->required,
            ];
        }

        return $this->asJson($fields);
    }
}
