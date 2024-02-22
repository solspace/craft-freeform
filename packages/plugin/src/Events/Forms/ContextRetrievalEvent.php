<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class ContextRetrievalEvent extends Event implements FormEventInterface
{
    public function __construct(private Form $form, private SessionBag $bag)
    {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getBag(): SessionBag
    {
        return $this->bag;
    }
}
