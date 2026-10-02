<?php

namespace Solspace\Freeform\Library\Resources;

final class Craft6Autosuggest
{
    /**
     * The legacy Vue widget removes its preview input before mounting. Craft 6
     * wraps that input in a web component, which would otherwise upgrade empty.
     * Keep the plain preview that Vue expects, with its attributes unchanged.
     */
    public static function unwrapPreviews(string $html): string
    {
        return preg_replace_callback(
            '/(<div\b[^>]*\bclass="[^"]*\bautosuggest-container\b[^"]*"[^>]*>\s*)<craft-input\b[^>]*>\s*(<input\b[^>]*\bid="[^"]+-preview"[^>]*>)\s*<\/craft-input>/s',
            static fn (array $match): string => $match[1].str_replace(' slot="input"', '', $match[2]),
            $html,
        ) ?? $html;
    }
}
