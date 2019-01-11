<?php

namespace Solspace\Freeform\Events;

use craft\events\CancelableEvent;
use yii\base\Arrayable;
use yii\base\ArrayableTrait;

class CancelableArrayableEvent extends CancelableEvent implements Arrayable
{
    use ArrayableTrait;
}
