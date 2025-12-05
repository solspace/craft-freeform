<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleStaticValueTrait;

class RichTextField extends AbstractField implements DefaultFieldInterface, SingleValueInterface, InputOnlyInterface, NoStorageInterface, ExtraFieldInterface
{
    use SingleStaticValueTrait;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_RICH_TEXT;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getContent(): string
    {
        return $this->getNormalizedValue();
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        return $this->getNormalizedValue();
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    /**
     * Convert Quill's internal list markup to more semantic HTML:
     * - <ol><li data-list="bullet">...</li></ol> to <ul><li>...</li></ul>
     * - strip .ql-ui spans.
     */
    private function getNormalizedValue(): string
    {
        $html = (string) $this->getValue();

        if ('' === trim($html)) {
            return $html;
        }

        // Match each <ol ...>...</ol>
        $pattern = '#<ol\b([^>]*)>(.*?)</ol>#si';

        return preg_replace_callback($pattern, static function (array $matches) {
            $olAttrs = $matches[1];     // attributes of <ol>
            $inner = $matches[2];       // contents between <ol> and </ol>

            // Find all <li ...>...</li> inside this <ol>
            if (!preg_match_all('#<li\b([^>]*)>(.*?)</li>#si', $inner, $liMatches, \PREG_SET_ORDER)) {
                // no <li> so leave <ol> unchanged
                return $matches[0];
            }

            // Check that all li are bullet items: data-list="bullet"
            foreach ($liMatches as $liMatch) {
                $liAttrStr = $liMatch[1];

                if (!preg_match('/\bdata-list=("|\')bullet\1/i', $liAttrStr)) {
                    // Mixed list or non-bullet list so leave <ol> unchanged
                    return $matches[0];
                }
            }

            // At this point, it's a pure bullet list. Convert to <ul>.

            // Strip data-list="bullet" from <li> tags
            $innerConverted = preg_replace(
                '/\s*data-list=("|\')bullet\1/i',
                '',
                $inner
            );

            // Remove the Quill UI span: <span class="...ql-ui..."></span>
            $innerConverted = preg_replace(
                '#<span[^>]*class=("|\')[^"\']*ql-ui[^"\']*\1[^>]*></span>#i',
                '',
                $innerConverted
            );

            // Return <ul> with the same attributes as the original <ol>
            return '<ul'.$olAttrs.'>'.$innerConverted.'</ul>';
        }, $html);
    }
}
