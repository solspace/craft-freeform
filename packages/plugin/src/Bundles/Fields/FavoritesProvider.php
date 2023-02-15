<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Records\FavoriteFieldRecord;

class FavoritesProvider
{
    public function getFavoriteFields(): array
    {
        $records = FavoriteFieldRecord::find()->all();

        $favorites = [];
        foreach ($records as $record) {
            $favorites[] = [
                'id' => $record->id,
                'uid' => $record->uid,
                'label' => $record->label,
                'typeClass' => $record->type,
                'properties' => json_decode($record->metadata),
            ];
        }

        return $favorites;
    }
}
