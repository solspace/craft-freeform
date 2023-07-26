<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\FormReCaptchaInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;
use Solspace\Freeform\Fields\DataContainers\Option;

class FormReCaptchaType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformFormReCaptchaType';
    }

    public static function getTypeDefinition(): Type
    {
        return FormReCaptchaInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     */
    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): mixed
    {
        if ('name' === $resolveInfo->fieldName) {
            return $source['name'] ?? null;
        }

        if ('handle' === $resolveInfo->fieldName) {
            return $source['handle'] ?? null;
        }

        if ('enabled' === $resolveInfo->fieldName) {
            return $source['enabled'] ?? null;
        }

        return null;
    }
}
