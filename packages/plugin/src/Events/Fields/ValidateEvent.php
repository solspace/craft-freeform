<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Form;

class ValidateEvent extends ArrayableEvent
{
    /** @var AbstractField */
    private $field;

    /** @var Form */
    private $form;

    /**
     * ValidateEvent constructor.
     */
    public function __construct(AbstractField $field, Form $form)
    {
        $this->field = $field;
        $this->form = $form;

        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['field', 'form'];
    }

    public function getField(): AbstractField
    {
        return $this->field;
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
