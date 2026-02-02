<?php

namespace Solspace\Freeform\Bundles\Notifications\Parsers;

use Solspace\Freeform\Form\Form;

class HtmlTemplateParser
{
    public function fromTwig(string $template, ?Form $form = null): string
    {
        $parsedTemplate = $template;

        $replacements = $this->getReplacementTable();

        foreach ($replacements as $replacement) {
            foreach ($replacement['items'] as $item) {
                $token = $item['token'] ?? null;
                $name = $item['name'] ?? null;

                $parsedTemplate = preg_replace_callback(
                    '/{{\s*([^}]+)\s*}}/',
                    static function ($matches) use ($name, $token) {
                        $match = trim($matches[1]);
                        if ($match === $token) {
                            return \sprintf(
                                '<span contenteditable="false" data-freeform-token="%s">%s</span>',
                                $token,
                                $name,
                            );
                        }

                        return $matches[0];
                    },
                    $parsedTemplate,
                );
            }
        }

        if (null === $form) {
            return $parsedTemplate;
        }

        // Replace Field tokens
        return preg_replace_callback(
            '/{{\s*fieldUids\[\'([^]\']+)\']\s*}}/',
            static function ($matches) use ($form) {
                $fieldUid = trim($matches[1]);
                $fieldLabel = $form->get($fieldUid)?->getLabel() ?? $fieldUid;

                return \sprintf(
                    '<span contenteditable="false" data-freeform-token="fieldUids[\'%s\']">%s</span>',
                    $fieldUid,
                    $fieldLabel,
                );
            },
            $parsedTemplate,
        );
    }

    public function toTwig(string $template): string
    {
        return preg_replace_callback(
            '/<span contenteditable="false" data-freeform-token="([^\"]+)">.*?<\/span>/',
            static fn ($matches) => \sprintf('{{ %s }}', $matches[1]),
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
