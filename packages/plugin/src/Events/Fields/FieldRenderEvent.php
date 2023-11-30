<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Fields\FieldInterface;
use yii\base\Event;

class FieldRenderEvent extends Event
{
    public function __construct(private FieldInterface $field)
    {
        parent::__construct();
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }
}
