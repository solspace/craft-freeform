<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\OptionsInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;
use Solspace\Freeform\Fields\DataContainers\Option;

/**
 * @deprecated Please use specific OptionType instead
 */
class OptionsType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'OptionsType';
    }

    public static function getTypeDefinition(): Type
    {
        return OptionsInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     * @param mixed  $context
     */
    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo): mixed
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
