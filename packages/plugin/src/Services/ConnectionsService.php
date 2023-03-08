<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Connections\ConnectionInterface;
use Solspace\Freeform\Library\Connections\Transformers\AbstractFieldTransformer;
use Solspace\Freeform\Library\Connections\Transformers\DirectValueTransformer;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Symfony\Component\PropertyAccess\PropertyAccess;

class ConnectionsService extends BaseService
{
    public function validateConnections(FormValidateEvent $event)
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        $form = $event->getForm();
        $submission = Submission::create($form);

        $list = $form->getConnectionProperties()->getList();
        foreach ($list as $connection) {
            if (!$connection->isConnectable()) {
                continue;
            }

            $keyValuePairs = $this->getTransformers($form, $submission, $connection);

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

    public function connect(Form $form, Submission $submission)
    {
        if (!Freeform::getInstance()->isPro() || $form->getSuppressors()->isConnections()) {
            return;
        }

        $list = $form->getConnectionProperties()->getList();
        foreach ($list as $connection) {
            if (!$connection->isConnectable()) {
                continue;
            }

            $result = $connection->connect($form, $this->getTransformers($form, $submission, $connection));
            if (!$result->isSuccessful()) {
                Freeform::getInstance()->logger
                    ->getLogger(FreeformLogger::ELEMENT_CONNECTION)
                    ->error($result->getAllErrorJson(), ['connection' => \get_class($connection)])
                ;
            }
        }
    }

    private function getTransformers(Form $form, Submission $submission, ConnectionInterface $connection): array
    {
        $transformers = [];

        $propertyAccessor = PropertyAccess::createPropertyAccessor();

        foreach ($connection->getMapping() as $craftFieldHandle => $freeformFieldHandle) {
            if (preg_match('/^(form|submission):([a-z]+)$/i', $freeformFieldHandle, $matches)) {
                $type = $matches[1];
                $key = $matches[2];

                $object = 'submission' === $type ? $submission : $form;
                $value = $propertyAccessor->getValue($object, $key);

                $transformers[] = new DirectValueTransformer($value, $craftFieldHandle);
            } else {
                $field = $form->get($freeformFieldHandle);
                if (!$field) {
                    continue;
                }

                $transformers[] = AbstractFieldTransformer::create($field, $craftFieldHandle);
            }
        }

        return $transformers;
    }
}
