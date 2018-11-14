<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\CheckboxField;
use Solspace\Freeform\Library\Composer\Components\Fields\FileUploadField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Connections\ConnectionInterface;
use Solspace\Freeform\Library\Logging\FreeformLogger;

class ConnectionsService extends BaseService
{
    /**
     * @param FormValidateEvent $event
     */
    public function validateConnections(FormValidateEvent $event)
    {
        $form = $event->getForm();

        $list = $form->getConnectionProperties()->getList();
        foreach ($list as $connection) {
            if (!$connection->isConnectable()) {
                continue;
            }

            $keyValuePairs = $this->getKeyValuePairs($form, $connection);

            $result = $connection->validate($keyValuePairs);
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

    /**
     * @param Form $form
     */
    public function connect(Form $form)
    {
        $list = $form->getConnectionProperties()->getList();
        foreach ($list as $connection) {
            if (!$connection->isConnectable()) {
                continue;
            }

            $keyValuePairs = $this->getKeyValuePairs($form, $connection);

            $result = $connection->connect($keyValuePairs);
            if (!$result->isSuccessful()) {
                Freeform::getInstance()->logger
                    ->getLogger(FreeformLogger::ELEMENT_CONNECTION)
                    ->error($result->getAllErrorJson(), ['connection' => \get_class($connection)]);
            }
        }
    }

    /**
     * @param Form                $form
     * @param ConnectionInterface $connection
     *
     * @return array
     */
    private function getKeyValuePairs(Form $form, ConnectionInterface $connection): array
    {
        $keyValuePairs = [];

        foreach ($connection->getMapping() as $craftFieldName => $freeformFieldName) {
            $field = $form->get($freeformFieldName);
            if (!$field) {
                continue;
            }

            if ($field instanceof CheckboxField) {
                $value = $field->getValueAsString();
            } else {
                $value = $field->getValue();
            }

            $keyValuePairs[$craftFieldName] = $value;
        }

        return $keyValuePairs;
    }

}
