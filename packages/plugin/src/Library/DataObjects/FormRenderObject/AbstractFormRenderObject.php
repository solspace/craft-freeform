<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Events\Forms\RegisterRenderObjectOptionsEvent;
use yii\base\Event;

abstract class AbstractFormRenderObject implements FormRenderObjectInterface
{
    const EVENT_REGISTER_OPTIONS = 'registerOptions';

    /** @var array */
    protected $options;

    /** @var mixed */
    private $value;

    /** @var array */
    private $replacements;

    public function __construct($value, array $replacements = [], $options = [])
    {
        $this->value = $value;
        $this->replacements = $replacements;

        $event = new RegisterRenderObjectOptionsEvent($options);
        Event::trigger(static::class, self::EVENT_REGISTER_OPTIONS, $event);

        $this->options = $event->getOptions();
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        return StringHelper::replaceValues($this->value, $this->replacements);
    }
}
