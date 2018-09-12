<?php

namespace Solspace\Freeform\Events\Assets;

use craft\events\CancelableEvent;
use yii\base\View;

class RegisterEvent extends CancelableEvent
{
    /** @var View */
    private $view;

    /**
     * @param FieldModel $model
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
