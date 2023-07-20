<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Rules\Rule;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName;

class FieldRule extends Rule
{
    public const DISPLAY_SHOW = 'show';
    public const DISPLAY_HIDE = 'hide';

    private FieldInterface $field;
    private string $display;

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    #[Groups(['builder'])]
    #[SerializedName('field')]
    public function getFieldUid(): string
    {
        return $this->field->getUid();
    }

    #[Groups(['front-end'])]
    #[SerializedName('field')]
    public function getFieldHandle(): string
    {
        return $this->field->getHandle();
    }

    public function setField(FieldInterface $field): self
    {
        $this->field = $field;

        return $this;
    }

    #[Groups(['front-end', 'builder'])]
    public function getDisplay(): string
    {
        return $this->display;
    }

    public function setDisplay(string $display): self
    {
        $this->display = $display;

        return $this;
    }
}
