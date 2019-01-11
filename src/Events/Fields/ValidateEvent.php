<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Form;

class ValidateEvent extends ArrayableEvent
{
    /** @var AbstractField */
    private $field;

    /** @var Form $form */
    private $form;

    /**
     * ValidateEvent constructor.
     *
     * @param AbstractField $field
     * @param Form          $form
     */
    public function __construct(AbstractField $field, Form $form)
    {
        $this->field = $field;
        $this->form  = $form;

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['field', 'form'];
    }

    /**
     * @return AbstractField
     */
    public function getField(): AbstractField
    {
        return $this->field;
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }
}
