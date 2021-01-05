<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\FormArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\FormType;

class FormGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return FormType::class;
    }

    public static function getArgumentsClass(): string
    {
        return FormArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return FormInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Form entity';
    }
}
