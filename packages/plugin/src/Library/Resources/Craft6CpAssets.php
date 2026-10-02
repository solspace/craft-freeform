<?php

namespace Solspace\Freeform\Library\Resources;

final class Craft6CpAssets
{
    /**
     * Craft's legacy Twig base emits cpVite() after the page body. Move that
     * exact block to the head before sending the response, without duplicating
     * its stylesheets, module preloads, or module entry point.
     */
    public static function moveToHead(string $html, string $assets): string
    {
        if ('' === trim($assets)) {
            return $html;
        }

        $headEnd = strpos($html, '</head>');
        if (false === $headEnd || !preg_match('/<body\b[^>]*\bclass="[^"]*\bfreeform-cp\b[^"]*"[^>]*>/i', $html, $body, \PREG_OFFSET_CAPTURE)) {
            return $html;
        }

        $bodyStart = $body[0][1] + \strlen($body[0][0]);
        $assetStart = strrpos($html, $assets);
        if (false === $assetStart || $assetStart < $bodyStart) {
            return $html;
        }

        $html = substr_replace($html, '', $assetStart, \strlen($assets));

        return substr_replace($html, $assets.\PHP_EOL, $headEnd, 0);
    }
}
