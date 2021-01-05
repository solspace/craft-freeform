<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use craft\web\View;

class HtmlObject extends AbstractFormRenderObject
{
    private $position;

    public function __construct($value, array $replacements = [], int $position = View::POS_END)
    {
        parent::__construct($value, $replacements);

        $this->position = $position;
    }

    /**
     * Attach the object to view.
     */
    public function attachToView()
    {
        \Craft::$app->view->registerHtml($this->getValue(), $this->position);
    }

    public function getOutput(): string
    {
        $this->attachToView();

        return '';
    }
}
