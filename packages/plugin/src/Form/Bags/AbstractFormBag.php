<?php

namespace Solspace\Freeform\Form\Bags;

use Solspace\Freeform\Library\Bags\AbstractBag;
use Solspace\Freeform\Library\Composer\Components\Form;

class AbstractFormBag extends AbstractBag
{
    /** @var Form */
    private $form;

    public function __construct(Form $form, array $contents = [])
    {
        $this->form = $form;
        parent::__construct($contents);
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
