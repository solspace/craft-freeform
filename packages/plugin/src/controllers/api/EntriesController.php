<?php

namespace Solspace\Freeform\controllers\api;

use craft\elements\Entry;
use Solspace\Freeform\controllers\BaseCpApiController;

class EntriesController extends BaseCpApiController
{
    protected function get(): array
    {
        $ids = $this->request->get('ids');
        if (!\is_string($ids) || '' === $ids) {
            return [];
        }

        $entries = Entry::find()->id(explode(',', $ids))->all();
        $elements = \Craft::$app->getElements();
        $entries = array_filter($entries, static fn (Entry $entry) => $elements->canView($entry));

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
            array_values($entries)
        );
    }
}
