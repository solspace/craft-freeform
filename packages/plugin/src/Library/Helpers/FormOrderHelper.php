<?php

namespace Solspace\Freeform\Library\Helpers;

use yii\web\BadRequestHttpException;

class FormOrderHelper
{
    public static function moveBefore(array $ids, int $formId, ?int $beforeId): array
    {
        $ids = array_values(array_filter(array_map('intval', $ids), static fn ($id) => $id !== $formId));
        if (null === $beforeId) {
            $ids[] = $formId;

            return $ids;
        }

        $index = array_search($beforeId, $ids, true);
        if (false === $index) {
            throw new BadRequestHttpException('The destination has changed. Please try again.');
        }
        array_splice($ids, $index, 0, [$formId]);

        return $ids;
    }
}
