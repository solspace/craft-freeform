<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\OptionInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

class OptionType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformOptionType';
    }

    public static function getTypeDefinition(): Type
    {
        return OptionInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     * @param mixed  $context
     */
    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo): string|int|bool|null
    {
        if ('value' === $resolveInfo->fieldName) {
            return $source->getValue() ?? null;
        }

        if ('label' === $resolveInfo->fieldName) {
            return $source->getLabel() ?? null;
        }

        if ('checked' === $resolveInfo->fieldName) {
            return $source->isChecked() ?? false;
        }

        return null;
    }
}
