<?php

namespace Solspace\Freeform\controllers\api;

use craft\elements\Entry;
use Solspace\Freeform\controllers\BaseApiController;

class EntriesController extends BaseApiController
{
    protected function get(): array
    {
        $ids = $this->request->get('ids');
        if ($ids) {
            $ids = explode(',', $ids);
        }

        $entries = Entry::find()->id($ids)->all();

        return array_map(
            static fn (Entry $entry) => [
                'id' => $entry->id,
                'uid' => $entry->uid,
                'title' => $entry->title,
                'url' => $entry->getUrl(),
                'editUrl' => $entry->getCpEditUrl(),
                'status' => $entry->getStatus(),
                'dateCreated' => $entry->dateCreated?->format('c'),
                'dateUpdated' => $entry->dateUpdated?->format('c'),
            ],
            $entries
        );
    }
}
