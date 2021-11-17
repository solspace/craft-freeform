<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class GetContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'handleRequest']);
    }

    public function handleRequest(FormEventInterface $event)
    {
        $form = $event->getForm();
        foreach ($form->getLayout()->getFields() as $field) {
            if (isset($_GET[$field->getHandle()])) {
                if ($field instanceof PersistentValueInterface) {
                    continue;
                }

                $value = $_GET[$field->getHandle()];

                if ($field instanceof CheckboxField) {
                    $field->setIsCheckedByPost((bool) $value);
                }

                $field->setValue($value);
            }
        }
    }
}
