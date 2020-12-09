<?php

namespace Solspace\Freeform\Events\Assets;

use craft\web\View;
use Solspace\Freeform\Events\CancelableArrayableEvent;

class RegisterEvent extends CancelableArrayableEvent
{
    /** @var View */
    private $view;

    /**
     * RegisterEvent constructor.
     */
    public function __construct(View $view)
    {
        $this->view = $view;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['view']);
    }

    public function getView(): View
    {
        return $this->view;
    }
}
