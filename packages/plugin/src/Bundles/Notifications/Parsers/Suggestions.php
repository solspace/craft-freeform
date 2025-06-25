<?php

namespace Solspace\Freeform\Bundles\Notifications\Parsers;

class Suggestions
{
    public function getSuggestionCategories(): array
    {
        return $this->getMap();
    }

    private function getMap(): array
    {
        static $map = null;

        if (null === $map) {
            $filePath = __DIR__.'/suggestions.table.php';
            $suggestions = [];
            if (file_exists($filePath)) {
                $suggestions = include $filePath;
            }

            $map = $suggestions;
        }

        return $map;
    }
}
