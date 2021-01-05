<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Library\Composer\Components\Page;
use Solspace\Freeform\Library\Composer\Components\Row;

class RowResolver extends Resolver
{
    /**
     * @param Page  $source
     * @param mixed $context
     *
     * @return Row[]
     */
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo)
    {
        return $source->getRows();
    }
}
