<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;

class FetchFieldTypes extends ArrayableEvent
{
    private $types;

    private $editableTypes;

    /**
     * MailingListTypesEvent constructor.
     */
    public function __construct(array $types = [])
    {
        $this->types = [];
        $this->editableTypes = [];

        foreach ($types as $type) {
            $this->addType($type);
        }

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['types', 'editableTypes'];
    }

    public function addType(string $class): self
    {
        $reflectionClass = new \ReflectionClass($class);

        /** @var AbstractField $class */
        $type = $class::getFieldType();
        $name = $class::getFieldTypeName();

        if ($reflectionClass->isSubclassOf(AbstractField::class)) {
            $this->types[$type] = $name;
        }

        if (!$reflectionClass->implementsInterface(NoStorageInterface::class)) {
            $this->editableTypes[$type] = $name;
        }

        return $this;
    }

    public function getTypes(): array
    {
        return $this->types;
    }

    public function getEditableTypes(): array
    {
        return $this->editableTypes;
    }
}
