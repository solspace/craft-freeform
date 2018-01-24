<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use yii\base\Event;

class FetchFieldTypes extends Event
{
    /** @var array */
    private $types;

    /**
     * MailingListTypesEvent constructor.
     *
     * @param array $types
     */
    public function __construct(array $types = [])
    {
        $this->types = [];

        foreach ($types as $type) {
            $this->addType($type);
        }

        parent::__construct();
    }

    /**
     * @param string $class
     *
     * @return FetchFieldTypes
     */
    public function addType(string $class): FetchFieldTypes
    {
        $reflectionClass = new \ReflectionClass($class);

        if ($reflectionClass->isSubclassOf(AbstractField::class)) {
            /** @var $class AbstractField */
            $type = $class::getFieldType();
            $name = $class::getFieldTypeName();

            $this->types[$type] = $name;
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getTypes(): array
    {
        return $this->types;
    }
}
