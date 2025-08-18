<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Cards;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\Cards\Card;
use Solspace\Freeform\Fields\Properties\Cards\CardCollection;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\CryptoHelper;

class CardsTransformer extends Transformer
{
    public function transform($value, ?Form $form = null): CardCollection
    {
        $collection = new CardCollection();

        if (!\is_array($value)) {
            return $collection;
        }

        foreach ($value as $item) {
            $card = new Card();
            $card->id = $item['id'] ?? CryptoHelper::getUniqueToken(6);
            $card->label = $item['label'] ?? '';
            $card->value = $item['value'] ?? '';
            $card->assetId = $item['assetId'] ?? null;
            $card->description = $item['description'] ?? '';
            $card->metadata = $item['metadata'] ?? [];

            $collection->add($card);
        }

        return $collection;
    }

    /**
     * @param CardCollection $value
     */
    public function reverseTransform($value): array
    {
        $serialized = [];
        if (!$value instanceof CardCollection) {
            return $serialized;
        }

        foreach ($value as $card) {
            $serialized[] = [
                'id' => $card->id,
                'label' => $card->label,
                'value' => $card->value,
                'assetId' => $card->assetId,
                'description' => $card->description,
                'metadata' => $card->metadata,
            ];
        }

        return $serialized;
    }
}
