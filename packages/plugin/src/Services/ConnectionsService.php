<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Connections\ConnectionInterface;
use Solspace\Freeform\Library\Connections\Transformers\AbstractFieldTransformer;
use Solspace\Freeform\Library\Logging\FreeformLogger;

class ConnectionsService extends BaseService
{
    public function validateConnections(FormValidateEvent $event)
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        $form = $event->getForm();

        $list = $form->getConnectionProperties()->getList();
        foreach ($list as $connection) {
            if (!$connection->isConnectable()) {
                continue;
            }

            $keyValuePairs = $this->getTransformers($form, $connection);

            $result = $connection->validate($form, $keyValuePairs);
            if (!$result->isSuccessful()) {
                foreach ($result->getFormErrors() as $error) {
                    $form->addError($error);
                }

                foreach ($result->getFieldErrors() as $fieldHandle => $errors) {
                    $field = $form->get($fieldHandle);
                    if ($field) {
                        $field->addErrors($errors);
                    }
                }
            }
        }
    }

    public function connect(Form $form)
    {
        if (!Freeform::getInstance()->isPro() || $form->getSuppressors()->isConnections()) {
            return;
        }

        $list = $form->getConnectionProperties()->getList();
        foreach ($list as $connection) {
            if (!$connection->isConnectable()) {
                continue;
            }

            $result = $connection->connect($form, $this->getTransformers($form, $connection));
            if (!$result->isSuccessful()) {
                Freeform::getInstance()->logger
                    ->getLogger(FreeformLogger::ELEMENT_CONNECTION)
                    ->error($result->getAllErrorJson(), ['connection' => \get_class($connection)])
                ;
            }
        }
    }

    private function getTransformers(Form $form, ConnectionInterface $connection): array
    {
        $transformers = [];

        foreach ($connection->getMapping() as $craftFieldHandle => $freeformFieldHandle) {
            $field = $form->get($freeformFieldHandle);
            if (!$field) {
                continue;
            }

            $transformers[] = AbstractFieldTransformer::create($field, $craftFieldHandle);
        }

        return $transformers;
    }
}
