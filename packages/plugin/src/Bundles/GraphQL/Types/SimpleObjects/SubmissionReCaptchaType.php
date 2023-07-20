<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\SubmissionReCaptchaInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

class SubmissionReCaptchaType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformSubmissionReCaptchaType';
    }

    public static function getTypeDefinition(): Type
    {
        return SubmissionReCaptchaInterface::getType();
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

        if ('value' === $resolveInfo->fieldName) {
            return $source['value'] ?? null;
        }

        return null;
    }
}
