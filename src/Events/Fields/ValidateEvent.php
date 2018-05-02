<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class ValidateEvent extends Event
{
    /** @var AbstractField */
    private $field;

    /** @var Form $form */
    private $form;

    /**
     * ValidateEvent constructor.
     *
     * @param AbstractField $field
     */
    public function __construct(AbstractField $field, Form $form)
    {
        $this->field = $field;
        $this->form  = $form;

        parent::__construct([]);
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