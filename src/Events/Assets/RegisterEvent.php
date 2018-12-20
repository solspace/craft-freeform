<?php

namespace Solspace\Freeform\Events\Assets;

use craft\events\CancelableEvent;
use craft\web\View;

class RegisterEvent extends CancelableEvent
{
    /** @var View */
    public $view;

    /**
     * RegisterEvent constructor.
     *
     * @param View $view
     */
    public function __construct(View $view)
    {
        $this->view = $view;

        parent::__construct();
    }

    /**
     * @return View
     */
    public function getView(): View
    {
        return $this->view;
    }
}
