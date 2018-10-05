<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class AttachFormAttributesEvent extends Event
{
    /** @var Form */
    private $form;

    /** @var array */
    private $attributes;

    /**
     * AttachFormAttributes constructor.
     *
     * @param Form  $form
     * @param array $attributes
     */
    public function __construct(Form $form, array $attributes = [])
    {
        $this->form       = $form;
        $this->attributes = $attributes;

        parent::__construct([]);
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return array
     */
    public function getAttributes(): array
    {
        return $this->attributes;
    }

    /**
     * @param string $name
     * @param mixed  $value
     *
     * @return $this
     */
    public function attachAttribute(string $name, $value): AttachFormAttributesEvent
    {
        $this->attributes[$name] = $value;

        return $this;
    }

    /**
     * @param string $name
     *
     * @return $this
     */
    public function removeAttribute(string $name): AttachFormAttributesEvent
    {
        if (isset($this->attributes[$name])) {
            unset($this->attributes[$name]);
        }

        return $this;
    }

    /**
     * Compiles all of the attributes into a string
     *
     * @return string
     */
    public function getCompiledAttributeString(): string
    {
        return StringHelper::compileAttributeStringFromArray($this->attributes);
    }
}
