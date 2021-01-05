<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use craft\helpers\Html;
use craft\web\View;

class JavascriptObject extends AbstractFormRenderObject
{
    private $position;

    private $options;

    public function __construct($value, array $replacements = [], int $position = View::POS_END, array $options = [])
    {
        parent::__construct($value, $replacements);

        $this->position = $position;
        $this->options = $options;
    }

    /**
     * Attach the object to view.
     */
    public function attachToView()
    {
        \Craft::$app->view->registerScript($this->getValue(), $this->position, $this->options);
    }

    public function getOutput(): string
    {
        return Html::script($this->getValue(), $this->options);
    }
}
