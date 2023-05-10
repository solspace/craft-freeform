<?php

namespace Solspace\Freeform\Library\Rules;

use Solspace\Freeform\Fields\FieldInterface;

class Condition
{
    public const TYPE_EQUALS = 'equals';
    public const TYPE_NOT_EQUALS = 'notEquals';
    public const TYPE_GREATER_THAN = 'greaterThan';
    public const TYPE_GREATER_THAN_OR_EQUALS = 'greaterThanOrEquals';
    public const TYPE_LESS_THAN = 'lessThan';
    public const TYPE_LESS_THAN_OR_EQUALS = 'lessThanOrEquals';
    public const TYPE_CONTAINS = 'contains';
    public const TYPE_NOT_CONTAINS = 'notContains';
    public const TYPE_STARTS_WITH = 'startsWith';
    public const TYPE_ENDS_WITH = 'endsWith';

    public function __construct(
        private string $uid,
        private FieldInterface $field,
        private string $operator,
        private string $value
    ) {
    }

    public function getUid(): string
    {
        return $this->uid;
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function getOperator(): string
    {
        return $this->operator;
    }

    public function getValue(): string
    {
        return $this->value;
    }
}
