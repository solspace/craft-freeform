<?php

namespace Solspace\Freeform\Library\Attributes;

class FieldAttributesCollection extends Attributes
{
    private Attributes $input;
    private Attributes $label;
    private Attributes $instructions;
    private Attributes $container;
    private Attributes $error;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->input = new Attributes();
        $this->label = new Attributes();
        $this->instructions = new Attributes();
        $this->container = new Attributes();
        $this->error = new Attributes();
    }

    public function getInput(): Attributes
    {
        return $this->input;
    }

    public function getLabel(): Attributes
    {
        return $this->label;
    }

    public function getInstructions(): Attributes
    {
        return $this->instructions;
    }

    public function getContainer(): Attributes
    {
        return $this->container;
    }

    public function getError(): Attributes
    {
        return $this->error;
    }

    public function merge(array $data): self
    {
        $reservedKeywords = [
            'input',
            'label',
            'instructions',
            'container',
            'error',
        ];

        foreach ($data as $key => $items) {
            if (!\is_array($items)) {
                continue;
            }

            if (!\in_array($key, $reservedKeywords, true)) {
                continue;
            }

            $object = $this->{$key};

            if (isset($items['append'])) {
                $append = $items['append'];
                unset($items['append']);

                foreach ($append as $itemKey => $value) {
                    $object->append($itemKey, $value);
                }
            }

            foreach ($items as $itemKey => $value) {
                $this->{$key}->replace($itemKey, $value);
            }
        }

        return $this;
    }

    public function jsonSerialize(): array
    {
        return array_merge(
            parent::jsonSerialize(),
            [
                'input' => $this->input->jsonSerialize(),
                'label' => $this->label->jsonSerialize(),
                'instructions' => $this->instructions->jsonSerialize(),
                'container' => $this->container->jsonSerialize(),
                'error' => $this->error->jsonSerialize(),
            ]
        );
    }
}
