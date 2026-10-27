<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Records\FavoriteFieldRecord;

class FavoritesProvider
{
    public function getFavoriteFields(): array
    {
        $records = FavoriteFieldRecord::find()->all();

        $favorites = [];
        foreach ($records as $record) {
            $properties = JsonHelper::decode($record->metadata);
            if (is_a($record->type, SignatureField::class, true) && \is_object($properties) && !isset($properties->customizeAppearance)) {
                // Older favorites retain their configured colors when reused.
                $properties->customizeAppearance = true;
            }

            if (is_a($record->type, DatetimeField::class, true)) {
                $properties = (object) DatetimeField::normalizePickerProperties((array) $properties);
            }

            $favorites[] = [
                'id' => $record->id,
                'uid' => $record->uid,
                'label' => $record->label,
                'typeClass' => $record->type,
                'properties' => $properties,
            ];
        }

        return $favorites;
    }
}
