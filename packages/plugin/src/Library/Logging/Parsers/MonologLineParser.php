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

namespace Solspace\Freeform\Library\Logging\Parsers;

class MonologLineParser implements LogParserInterface
{
    private string $pattern = '/^'
        .'\[(?<date>.*)] '
        .'(?<channel>[\w\-_ ]+).(?<level>\w+): '
        .'(?<message>.*)'
        .'(?<context> (\[.*?]|\{.*?}))'
        .'(?<extra> (\{.*}))'
        .'\s{0,2}/';

    public function __construct(?string $pattern = null)
    {
        $this->pattern = $pattern ?: $this->pattern;
    }

    public function parse(string $log): ?LogLine
    {
        $parsed = $this->parseMonologLine($log);
        if (!$parsed) {
            return null;
        }

        [
            'datetime' => $date,
            'channel' => $channel,
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'extra' => $extra,
        ] = $parsed;

        return new LogLine(
            $date,
            $channel,
            $level,
            $message,
            $context,
            $extra
        );
    }

    private function parseMonologLine(string $line): ?array
    {
        // 1. Match the prefix
        if (!preg_match(
            '/^\[(?<datetime>[^\]]+)\]\s+(?<channel>[^.]+)\.(?<level>[A-Z]+):\s+(?<rest>.+)$/',
            $line,
            $m
        )) {
            return null;
        }

        $datetime = new \DateTime($m['datetime']);
        $channel = $m['channel'];
        $level = $m['level'];
        $rest = $m['rest'];

        // 2. Find first JSON object start
        $firstBracePos = strpos($rest, '{');
        if (false === $firstBracePos) {
            // No JSON, the whole rest is a message
            return [
                'datetime' => $datetime,
                'channel' => $channel,
                'level' => $level,
                'message' => trim($rest),
                'context' => null,
                'extra' => null,
            ];
        }

        $message = trim(substr($rest, 0, $firstBracePos));
        $jsonPart = substr($rest, $firstBracePos);

        // 3. Sequentially extract JSON objects
        $objects = [];

        $offset = 0;
        while ($offset < \strlen($jsonPart)) {
            // Skip whitespace
            while ($offset < \strlen($jsonPart) && ctype_space($jsonPart[$offset])) {
                ++$offset;
            }

            if ($offset >= \strlen($jsonPart) || '{' !== $jsonPart[$offset]) {
                break;
            }

            [$obj, $len] = $this->extractJsonObject($jsonPart, $offset);
            if (null === $obj) {
                // Broken/truncated JSON; stop
                break;
            }

            $objects[] = $obj;
            $offset = $len;
        }

        $context = $objects[0] ?? null;
        $extra = $objects[1] ?? null;

        return [
            'datetime' => $datetime,
            'channel' => $channel,
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'extra' => $extra,
        ];
    }

    /**
     * Extract a JSON object starting at $start (must be '{').
     * Returns [decodedValue|null, nextOffset].
     */
    private function extractJsonObject(string $src, int $start): array
    {
        $len = \strlen($src);
        $depth = 0;
        $inString = false;
        $escape = false;

        for ($i = $start; $i < $len; ++$i) {
            $ch = $src[$i];

            if ($inString) {
                if ($escape) {
                    $escape = false;
                } elseif ('\\' === $ch) {
                    $escape = true;
                } elseif ('"' === $ch) {
                    $inString = false;
                }

                continue;
            }

            if ('"' === $ch) {
                $inString = true;

                continue;
            }

            if ('{' === $ch) {
                ++$depth;
            } elseif ('}' === $ch) {
                --$depth;
                if (0 === $depth) {
                    $jsonFragment = substr($src, $start, $i - $start + 1);
                    $decoded = json_decode($jsonFragment, true);

                    return [$decoded, $i + 1];
                }
            }
        }

        // Incomplete object
        return [null, $len];
    }
}
