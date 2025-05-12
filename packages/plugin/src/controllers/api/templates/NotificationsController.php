<?php

namespace Solspace\Freeform\controllers\api\templates;

use Solspace\Freeform\Bundles\Notifications\Parsers\Suggestions;
use Solspace\Freeform\controllers\BaseApiController;

class NotificationsController extends BaseApiController
{
    protected function get(): array
    {
        $suggestions = new Suggestions();

        return $suggestions->getSuggestionCategories();
    }
}
