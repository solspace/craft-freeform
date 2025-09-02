<?php

namespace Solspace\Freeform\Library\Helpers;

class ProseMirrorHelper
{
    /**
     * Convert ProseMirror content to HTML.
     */
    public static function toHtml(array $content): string
    {
        $html = '';

        foreach ($content as $block) {
            if (isset($block['type'])) {
                $html .= self::processBlock($block);
            }
        }

        return $html;
    }

    /**
     * Process a single ProseMirror block.
     */
    private static function processBlock(array $block): string
    {
        $type = $block['type'];
        $content = $block['content'] ?? [];
        $attrs = $block['attrs'] ?? [];

        return match ($type) {
            'paragraph' => '<p>'.self::processTextContent($content).'</p>',
            'heading' => self::processHeading($content, $attrs),
            'bulletList' => '<ul>'.self::processListItemContent($content).'</ul>',
            'orderedList' => '<ol>'.self::processListItemContent($content).'</ol>',
            'listItem' => '<li>'.self::processTextContent($content).'</li>',
            'blockquote' => '<blockquote>'.self::processTextContent($content).'</blockquote>',
            'codeBlock' => '<pre><code>'.htmlspecialchars(self::processTextContent($content)).'</code></pre>',
            'horizontalRule' => '<hr>',
            default => self::processTextContent($content),
        };
    }

    /**
     * Process heading blocks with proper level.
     */
    private static function processHeading(array $content, array $attrs): string
    {
        $level = $attrs['level'] ?? 2;
        $level = max(1, min(6, $level)); // Ensure level is between 1-6

        return "<h{$level}>".self::processTextContent($content)."</h{$level}>";
    }

    /**
     * Process text content within blocks, handling marks (bold, italic, etc.).
     */
    private static function processTextContent(array $content): string
    {
        $text = '';

        foreach ($content as $textBlock) {
            if (isset($textBlock['type'])) {
                if ('text' === $textBlock['type']) {
                    $content = $textBlock['text'] ?? '';
                    $marks = $textBlock['marks'] ?? [];

                    // Apply marks (formatting)
                    $content = self::applyMarks($content, $marks);
                    $text .= $content;
                } elseif ('variableTag' === $textBlock['type']) {
                    // Handle Formie variableTag nodes
                    $value = $textBlock['attrs']['value'] ?? '';
                    $text .= self::convertFormieVariableToFreeform($value);
                }
            }
        }

        return $text;
    }

    /**
     * Apply formatting marks to text content.
     */
    private static function applyMarks(string $content, array $marks): string
    {
        foreach ($marks as $mark) {
            if (isset($mark['type'])) {
                $content = match ($mark['type']) {
                    'bold' => "<strong>{$content}</strong>",
                    'italic' => "<em>{$content}</em>",
                    'underline' => "<u>{$content}</u>",
                    'strike' => "<s>{$content}</s>",
                    'code' => "<code>{$content}</code>",
                    'link' => self::createLink($content, $mark['attrs'] ?? []),
                    'superscript' => "<sup>{$content}</sup>",
                    'subscript' => "<sub>{$content}</sub>",
                    default => $content,
                };
            }
        }

        return $content;
    }

    /**
     * Create a link element with proper attributes.
     */
    private static function createLink(string $content, array $attrs): string
    {
        $href = $attrs['href'] ?? '#';
        $target = $attrs['target'] ?? '';
        $rel = $attrs['rel'] ?? '';

        $attributes = [];
        if ($target) {
            $attributes[] = "target=\"{$target}\"";
        }
        if ($rel) {
            $attributes[] = "rel=\"{$rel}\"";
        }

        $attrString = !empty($attributes) ? ' '.implode(' ', $attributes) : '';

        return "<a href=\"{$href}\"{$attrString}>{$content}</a>";
    }

    /**
     * Process list item content.
     */
    private static function processListItemContent(array $content): string
    {
        $html = '';

        foreach ($content as $item) {
            if (isset($item['type']) && 'listItem' === $item['type']) {
                $html .= '<li>'.self::processTextContent($item['content'] ?? []).'</li>';
            }
        }

        return $html;
    }

    private static function convertFormieVariableToFreeform(string $value): string
    {
        // Map common Formie variables to Freeform equivalents
        $variableMap = [
            '{formName}' => '{{ form.name }}',
            '{formTitle}' => '{{ form.name }}',
            '{form}' => '{{ form.name }}',
            '{siteName}' => '{{ general.siteName }}',
            '{systemName}' => '{{ general.systemName }}',
            '{siteHandle}' => '{{ general.siteHandle }}',
            '{timestamp}' => '{{ submission.dateCreated.format("F j, Y \a\t g:ia") }}',
            '{dateCreated}' => '{{ submission.dateCreated.format("F j, Y \a\t g:ia") }}',
            '{date}' => '{{ submission.dateCreated.format("F j, Y") }}',
            '{time}' => '{{ submission.dateCreated.format("g:ia") }}',
            '{allFields}' => '{{ loops.fields.all }}',
            '{all}' => '{{ loops.fields.all }}',
            '{all form field}' => '{{ loops.fields.all }}',
            '{submissionId}' => '{{ submission.id }}',
            '{submission}' => '{{ submission.id }}',
            '{id}' => '{{ submission.id }}',
            '{user}' => '{{ submission.userId ? submission.user.email : "Guest" }}',
            '{userId}' => '{{ submission.userId }}',
            '{ipAddress}' => '{{ submission.ipAddress }}',
            '{userAgent}' => '{{ submission.userAgent }}',
            '{referrer}' => '{{ submission.referrer }}',
        ];

        // Check for exact matches first
        if (isset($variableMap[$value])) {
            return $variableMap[$value];
        }

        // Handle field UID references like {field:uuid} or {uuid}
        if (preg_match('/^\{([a-f0-9-]{36})\}$/', $value, $matches)) {
            $fieldUid = $matches[1];

            return '{{ fieldUids[\''.$fieldUid.'\'] }}';
        }

        // If no match found, return the original value wrapped in Freeform syntax
        return '{{ '.trim($value, '{}').' }}';
    }
}
