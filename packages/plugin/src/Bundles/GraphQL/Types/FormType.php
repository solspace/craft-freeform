<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormInterface;

class FormType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformFormType';
    }

    public static function getTypeDefinition(): Type
    {
        return FormInterface::getType();
    }
}
