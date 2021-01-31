<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use craft\helpers\Html;
use craft\web\View;

class JavascriptObject extends AbstractFormRenderObject
{
    private $position;

    public function __construct($value, array $replacements = [], array $options = [], int $position = View::POS_END)
    {
        parent::__construct($value, $replacements, $options);

        $this->position = $position;
    }

    public function attachToView()
    {
        \Craft::$app->view->registerScript($this->getValue(), $this->position, $this->options);
    }

    public function getOutput(): string
    {
        return Html::script($this->getValue(), $this->options);
    }
}
