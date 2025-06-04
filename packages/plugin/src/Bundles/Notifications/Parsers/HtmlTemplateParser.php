<?php

namespace Solspace\Freeform\Bundles\Notifications\Parsers;

class HtmlTemplateParser
{
    public function fromTwig(string $template): string
    {
        $parsedTemplate = $template;

        $replacements = $this->getReplacementTable();

        foreach ($replacements as $replacement) {
            foreach ($replacement['items'] as $item) {
                $token = $item['token'] ?? null;
                $name = $item['name'] ?? null;

                $parsedTemplate = preg_replace(
                    '/{{\s*'.preg_quote($token, '/').'\s*}}/',
                    \sprintf('<span contenteditable="false" data-freeform-token="%s">%s</span>', $token, $name),
                    $parsedTemplate
                );
            }
        }

        return $parsedTemplate;
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
        $filePath = __DIR__.'/suggestions.table.php';
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
