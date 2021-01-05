<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Row;

class FieldResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo)
    {
        // @var AbstractField[] $fields
        if ($source instanceof Form) {
            $fields = $source->getLayout()->getFields();
        } elseif ($source instanceof Row) {
            $fields = $source->getFields();
        } else {
            $fields = [];
        }

        $ids = $arguments['id'] ?? [];
        $hashes = $arguments['hash'] ?? [];
        $handles = $arguments['handle'] ?? [];
        foreach ($fields as $index => $field) {
            if ($ids && !\in_array($field->getId(), $ids, false)) {
                unset($fields[$index]);
            }
            if ($handles && !\in_array($field->getHandle(), $handles, false)) {
                unset($fields[$index]);
            }
            if ($hashes && !\in_array($field->getHash(), $hashes, false)) {
                unset($fields[$index]);
            }
        }

        return array_values($fields);
    }
}
