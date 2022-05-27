<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\DataObjects\FieldType;

class FetchFieldTypes extends ArrayableEvent
{
    private $types;

    private $editableTypes;

    private array $typeInfo = [];

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
        $typeInfo = new FieldType($class);
        if (!$typeInfo) {
            return $this;
        }

        $this->typeInfo[$class] = $typeInfo;
        $this->types[] = $typeInfo->getType();

        if ($typeInfo->isStorable()) {
            $this->editableTypes[$typeInfo->getType()] = $typeInfo->getName();
        }

        return $this;
    }

    public function getTypeInfo(): array
    {
        return array_values($this->typeInfo);
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
