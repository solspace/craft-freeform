<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\OpinionScaleInterface;
use Solspace\Freeform\Fields\Properties\OpinionScale\Scale;

class OpinionScaleType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformOpinionScaleType';
    }

    public static function getTypeDefinition(): Type
    {
        return OpinionScaleInterface::getType();
    }

    /**
     * @param Scale $source
     * @param mixed $arguments
     * @param mixed $context
     */
    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo): mixed
    {
        if (!$source instanceof Scale) {
            if (\is_array($source)) {
                if ('value' === $resolveInfo->fieldName) {
                    return $source['value'] ?? null;
                }

                /*
                 * @deprecated - this field definition is no longer used
                 *
                 * @remove - Freeform 6.0
                 */
                if ('key' === $resolveInfo->fieldName) {
                    return $source['key'] ?? null;
                }

                if ('label' === $resolveInfo->fieldName) {
                    return $source['label'] ?? $source['value'] ?? null;
                }

                return null;
            }

            return null;
        }

        if ('value' === $resolveInfo->fieldName) {
            return $source->getValue() ?? null;
        }

        if ('label' === $resolveInfo->fieldName) {
            return $source->getLabel() ?? $source->getValue() ?? null;
        }

        /*
         * @deprecated - this field definition is no longer used
         *
         * @remove - Freeform 6.0
         */
        if ('key' === $resolveInfo->fieldName) {
            return $source->getValue() ?? null;
        }

        return null;
    }
}
