<?php

namespace Solspace\Freeform\Library\Helpers;

use yii\web\ForbiddenHttpException;

class DefaultViewHelper
{
    /** Keep the existing fallback order and only select an accessible destination. */
    public static function resolve(string $preferred, array $available): string
    {
        if ($available[$preferred] ?? false) {
            return $preferred;
        }
        foreach (['forms', 'submissions', 'notifications', 'settings', 'export-profiles', 'spam', 'ab-tests'] as $view) {
            if ($available[$view] ?? false) {
                return $view;
            }
        }

        throw new ForbiddenHttpException('You do not have access to a Freeform section.');
    }
}
