<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Page;

class PageResolver extends Resolver
{
    /**
     * @param Form  $source
     * @param mixed $context
     *
     * @return Page[]
     */
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo)
    {
        return $source->getLayout()->getPages();
    }
}
