<?php

namespace Solspace\Freeform\Bundles\Notifications\Parsers;

class HtmlTemplateParser
{
    public function fromTwig(string $template): string
    {
        $replacements = $this->getReplacementTable();

        return preg_replace_callback(
            '/{{\s*([a-zA-Z0-9_.]+)\s*}}/',
            function ($matches) use ($replacements) {
                $token = $matches[1];
                $label = $replacements[$token] ?? null;

                if (null === $label) {
                    return $matches[0];
                }

                return \sprintf('<span contenteditable="false" data-freeform-token="%s">%s</span>', $token, $label);
            },
            $template
        );
    }

    public function toTwig(string $template): string
    {
        return preg_replace_callback(
            '/<span contenteditable="false" data-freeform-token="([a-zA-Z0-9_.]+)">.*?<\/span>/',
            fn ($matches) => \sprintf('{{ %s }}', $matches[1]),
            $template
        );
    }

    private function getReplacementTable(): array
    {
        // Load the map.table.php file and return the array
        $filePath = __DIR__.'/map.table.php';
        if (!file_exists($filePath)) {
            return [];
        }

        $map = include $filePath;
        if (!\is_array($map)) {
            return [];
        }

        return $map;
    }
}
