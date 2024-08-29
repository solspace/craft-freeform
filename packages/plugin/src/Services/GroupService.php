<?php

namespace Solspace\Freeform\Services;

use craft\db\Query;
use Solspace\Freeform\Records\FormGroupsRecord;

class GroupService extends BaseService
{
    public function __construct(?array $config, private PropertyProvider $propertyProvider)
    {
        parent::__construct($config);
    }

    public function getAllGroups(null|array|string $site = null): array
    {
        if (!$site) {
            return [];
        }

        $query = $this->getGroupQuery();
        $this->attachSitesToQuery($query, $site);
        $results = $query->all();

        return $results ?: [];
    }

    private function getGroupQuery(): Query
    {
        return (new Query())
            ->select(['site', 'groups'])
            ->from(FormGroupsRecord::TABLE)
        ;
    }

    private function attachSitesToQuery(Query $query, null|array|string $site): void
    {
        if (null !== $site) {
            $query->andWhere(['site' => $site]);
        }
    }
}
