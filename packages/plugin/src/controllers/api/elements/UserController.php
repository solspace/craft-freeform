<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class UserController extends BaseApiController
{
    public function actionAttributeMapping(): Response
    {
        return $this->asJson([
            ['id' => 'username', 'label' => 'Username', 'required' => true],
            ['id' => 'firstName', 'label' => 'First Name', 'required' => false],
            ['id' => 'lastName', 'label' => 'Last Name', 'required' => false],
            ['id' => 'fullName', 'label' => 'Full Name', 'required' => false],
            ['id' => 'email', 'label' => 'Email', 'required' => true],
            ['id' => 'password', 'label' => 'Password', 'required' => false],
            ['id' => 'photo', 'label' => 'Photo', 'required' => false],
        ]);
    }

    public function actionFieldMapping(): Response
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

    public function actionFieldOptions(): Response
    {
        $collection = new OptionCollection();
        $collection
            ->add('id', 'ID')
            ->add('fullName', 'Full Name')
            ->add('firstName', 'First name')
            ->add('lastName', 'Last name')
            ->add('username', 'Username')
        ;

        if (isset($_GET['order'])) {
            return $this->asSerializedJson($collection);
        }

        $fields = \Craft::$app->user->getIdentity()->getFieldLayout()->getCustomFields();
        foreach ($fields as $field) {
            $collection->add($field->handle, $field->name);
        }

        return $this->asSerializedJson($collection);
    }
}
