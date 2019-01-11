<?php

namespace Solspace\Freeform\Events;

use yii\base\Arrayable;
use yii\base\ArrayableTrait;
use yii\base\Event;

abstract class ArrayableEvent extends Event implements Arrayable
{
    use ArrayableTrait;
}
