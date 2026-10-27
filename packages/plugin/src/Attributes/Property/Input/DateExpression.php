<?php

namespace Solspace\Freeform\Attributes\Property\Input;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class DateExpression extends DatePicker
{
    public ?string $type = 'dateExpression';
}
