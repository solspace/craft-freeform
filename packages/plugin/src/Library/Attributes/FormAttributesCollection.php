<?php

namespace Solspace\Freeform\Library\Attributes;

class FormAttributesCollection extends Attributes
{
    private Attributes $row;
    private Attributes $error;

    public function __construct(array $attributes = [])
    {
        $this->row = new Attributes($attributes['row'] ?? []);
        $this->error = new Attributes($attributes['error'] ?? []);

        unset($attributes['row'], $attributes['error']);

        parent::__construct($attributes);
    }

    public function getRow(): Attributes
    {
        return $this->row;
    }

    public function getError(): Attributes
    {
        return $this->error;
    }

    public function jsonSerialize(): array
    {
        return array_merge(
            parent::jsonSerialize(),
            [
                'row' => $this->row->jsonSerialize(),
                'error' => $this->error->jsonSerialize(),
            ]
        );
    }
}
