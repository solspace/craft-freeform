<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\FormPropertiesArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormPropertiesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\FormPropertiesType;

class FormPropertiesGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return FormPropertiesType::class;
    }

    public static function getArgumentsClass(): string
    {
        return FormPropertiesArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return FormPropertiesInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Form Properties entity';
    }
}
