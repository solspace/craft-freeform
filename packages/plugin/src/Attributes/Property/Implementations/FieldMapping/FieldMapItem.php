<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\FieldMapping;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Symfony\Component\Serializer\Annotation\Ignore;

class FieldMapItem
{
    public const TYPE_RELATION = 'relation';
    public const TYPE_CUSTOM = 'custom';

    public function __construct(
        private string $type,
        private string $source,
        private string $value,
    ) {
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    #[Ignore]
    public function getSource(): string
    {
        return $this->source;
    }

    public function extractValue(Form $form): mixed
    {
        if (self::TYPE_RELATION === $this->getType()) {
            return $form->get($this->getValue())->getValue();
        }

        static $twig;
        static $variables = [];

        if (null === $twig) {
            $twig = new IsolatedTwig();
        }

        $formHandle = $form->getHandle();
        if (!\array_key_exists($formHandle, $variables)) {
            $variableList = [
                'form' => $form,
                'submission' => $form->getSubmission(),
            ];

            $fields = $form->getLayout()->getFields();
            foreach ($fields as $field) {
                if (!\array_key_exists($field->getHandle(), $variableList)) {
                    $variableList[$field->getHandle()] = $field->getValue();
                }
            }

            $variables[$formHandle] = $variableList;
        }

        return $twig->render($this->getValue(), $variables[$formHandle]);
    }
}
