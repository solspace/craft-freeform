<?php

namespace Solspace\Freeform\Library\Activity;

use craft\db\Query;
use Solspace\Freeform\Freeform;

/** The feed and downloads share one validated filter contract. */
class ActivityQuery
{
    public static function filtered(array $filters, string $cutoff): Query
    {
        $query = (new Query())->from(ActivityTable::TABLE)->where(['>=', 'dateCreated', $cutoff]);
        foreach (['category', 'level', 'formId', 'submissionId'] as $column) {
            if ($filters[$column]) {
                $query->andWhere([$column => $filters[$column]]);
            }
        }
        if ('' !== $filters['q']) {
            if (ctype_digit(ltrim($filters['q'], '#'))) {
                $query->andWhere(['submissionId' => (int) ltrim($filters['q'], '#')]);
            } else {
                $matches = [];
                foreach (ActivityPolicy::EVENTS as $key => $definition) {
                    if (str_contains(mb_strtolower(Freeform::t($definition[1]).' '.Freeform::t($definition[0])), mb_strtolower($filters['q']))) {
                        $matches[] = $key;
                    }
                }
                $query->andWhere(['event' => $matches]);
            }
        }

        return $query;
    }
}
