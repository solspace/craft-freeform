<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\helpers\StringHelper as CraftStringHelper;
use craft\search\SearchQuery;
use craft\search\SearchQueryTerm;
use craft\search\SearchQueryTermGroup;

class SearchHelper
{
    public static function maybeTruncateHandle(string $handle, int $maxLen = 25): string
    {
        return CraftStringHelper::first($handle, $maxLen);
    }

    public static function adjustSearchQuery(SearchQuery $query)
    {
        $reflectionClass = new \ReflectionClass(SearchQuery::class);
        $reflectionProperty = $reflectionClass->getProperty('_tokens');

        $tokens = $reflectionProperty->getValue($query);

        $modifyTerm = static function (SearchQueryTerm $term) {
            if ($term->attribute) {
                $term->attribute = SearchHelper::maybeTruncateHandle($term->attribute);
            }
        };

        foreach ($tokens as &$termOrGroup) {
            // Token can be a group of terms or a single term.
            if ($termOrGroup instanceof SearchQueryTermGroup) {
                foreach ($termOrGroup->terms as &$term) {
                    $modifyTerm($term);
                }
                unset($term);
            } else {
                $modifyTerm($termOrGroup);
            }
        }

        $reflectionProperty->setValue($query, $tokens);
    }
}
