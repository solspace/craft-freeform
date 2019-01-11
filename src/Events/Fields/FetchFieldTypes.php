<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;

class FetchFieldTypes extends ArrayableEvent
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
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['types'];
    }

    /**
     * @param string $class
     *
     * @return FetchFieldTypes
     */
    public function addType(string $class): FetchFieldTypes
    {
        $reflectionClass = new \ReflectionClass($class);

        if (
            $reflectionClass->isSubclassOf(AbstractField::class) &&
            !$reflectionClass->implementsInterface(NoStorageInterface::class)
        ) {
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
