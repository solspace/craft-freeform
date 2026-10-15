<?php

namespace Solspace\Freeform\Library\AI;

use setasign\Fpdi\PdfParser\Filter\AsciiHex;
use setasign\Fpdi\PdfParser\PdfParser;
use setasign\Fpdi\PdfParser\StreamReader;
use setasign\Fpdi\PdfParser\Type\PdfArray;
use setasign\Fpdi\PdfParser\Type\PdfDictionary;
use setasign\Fpdi\PdfParser\Type\PdfHexString;
use setasign\Fpdi\PdfParser\Type\PdfIndirectObjectReference;
use setasign\Fpdi\PdfParser\Type\PdfName;
use setasign\Fpdi\PdfParser\Type\PdfNumeric;
use setasign\Fpdi\PdfParser\Type\PdfString;
use setasign\Fpdi\PdfParser\Type\PdfType;

/** Reads choice definitions only; never executes actions or reads answers/content streams. */
final class PdfChoiceFieldExtractor
{
    public static function extract(string $bytes): array
    {
        // Also tolerate a development checkout being pulled before Composer is updated.
        if (!class_exists(PdfParser::class)) {
            return [];
        }
        // Keep the uploaded bytes in memory, including documents over php://temp's default 2 MiB.
        $parser = new class(StreamReader::createByString($bytes, ReferenceFile::MAX_BYTES + 1)) extends PdfParser {
            private int $reads = 0;
            private int $depth = 0;
            private ?float $startedAt = null;

            public function readValue($token = null, $expectedType = null)
            {
                $this->startedAt ??= microtime(true);
                if (++$this->reads > 100000 || ++$this->depth > 32 || microtime(true) - $this->startedAt > 2) {
                    throw new \RuntimeException('PDF metadata budget exceeded.');
                }

                try {
                    return parent::readValue($token, $expectedType);
                } finally {
                    --$this->depth;
                }
            }
        };

        try {
            $acroForm = self::entry($parser->getCatalog(), 'AcroForm', $parser);
            $fields = self::entry($acroForm, 'Fields', $parser);
            if (!$fields instanceof PdfArray) {
                return [];
            }

            $choices = [];
            $visited = [];
            $nodes = 0;
            $budget = 65534;
            $walk = static function (PdfType $node, array $inherited = [], string $parentName = '', int $depth = 0) use (&$walk, &$choices, &$visited, &$nodes, &$budget, $parser): void {
                if (++$nodes > 2000 || $depth > 20 || \count($choices) >= 200 || $budget <= 0) {
                    return;
                }
                if ($node instanceof PdfIndirectObjectReference) {
                    if (isset($visited[$node->value])) {
                        return;
                    }
                    $visited[$node->value] = true;
                }
                $node = PdfType::resolve($node, $parser);
                if (!$node instanceof PdfDictionary) {
                    return;
                }

                foreach (['FT', 'Ff', 'Opt'] as $key) {
                    if (isset($node->value[$key])) {
                        $inherited[$key] = self::entry($node, $key, $parser);
                    }
                }
                $partialName = self::text(self::entry($node, 'T', $parser));
                $name = '' !== $partialName ? ltrim($parentName.'.'.$partialName, '.') : $parentName;
                $kids = self::entry($node, 'Kids', $parser);
                $type = $inherited['FT'] ?? null;
                $options = $inherited['Opt'] ?? null;
                $hasChildFields = false;
                if ($kids instanceof PdfArray) {
                    foreach ($kids->value as $kid) {
                        $child = PdfType::resolve($kid, $parser);
                        if ($child instanceof PdfDictionary && isset($child->value['T'])) {
                            $hasChildFields = true;

                            break;
                        }
                    }
                }

                if (!$hasChildFields && $type instanceof PdfName && 'Ch' === $type->value && $options instanceof PdfArray && '' !== $name) {
                    // A choice field's widget children share its definition; do not duplicate them.
                    $options = self::options($options, $parser);
                    if ($options) {
                        $flags = $inherited['Ff'] ?? null;
                        $flags = $flags instanceof PdfNumeric ? (int) $flags->value : 0;
                        $choice = [
                            'name' => $name,
                            'label' => self::text(self::entry($node, 'TU', $parser)) ?: $name,
                            'type' => ($flags & (1 << 21)) ? 'MultipleSelect' : 'Dropdown',
                            'options' => $options,
                        ];
                        $size = 1 + \strlen(json_encode($choice, \JSON_UNESCAPED_UNICODE | \JSON_INVALID_UTF8_SUBSTITUTE));
                        if ($size <= $budget) {
                            $choices[] = $choice;
                            $budget -= $size;
                        }
                    }

                    return;
                }

                if ($kids instanceof PdfArray) {
                    foreach ($kids->value as $kid) {
                        $walk($kid, $inherited, $name, $depth + 1);
                        if ($nodes >= 2000 || \count($choices) >= 200 || $budget <= 0) {
                            break;
                        }
                    }
                }
            };

            foreach ($fields->value as $field) {
                $walk($field);
                if ($nodes >= 2000 || \count($choices) >= 200 || $budget <= 0) {
                    break;
                }
            }

            return $choices;
        } catch (\Exception) {
            // Unsupported compression, malformed PDFs and metadata limits must not block visual import.
            // Do not log exceptions: they may contain document contents.
            return [];
        } finally {
            $parser->cleanUp();
        }
    }

    private static function entry(mixed $dictionary, string $key, PdfParser $parser): ?PdfType
    {
        return $dictionary instanceof PdfDictionary && isset($dictionary->value[$key])
            ? PdfType::resolve($dictionary->value[$key], $parser)
            : null;
    }

    private static function options(PdfArray $array, PdfParser $parser): array
    {
        // Never present a truncated option list as complete evidence.
        if (\count($array->value) > 200) {
            return [];
        }
        $options = [];
        foreach ($array->value as $option) {
            $option = PdfType::resolve($option, $parser);
            if ($option instanceof PdfArray) {
                if (2 !== \count($option->value)) {
                    return [];
                }
                $exportValue = PdfType::resolve($option->value[0], $parser);
                $displayValue = PdfType::resolve($option->value[1], $parser);
                if ((!$exportValue instanceof PdfString && !$exportValue instanceof PdfHexString) || (!$displayValue instanceof PdfString && !$displayValue instanceof PdfHexString)) {
                    return [];
                }
                $value = self::text($exportValue);
                $label = self::text($displayValue);
            } else {
                if (!$option instanceof PdfString && !$option instanceof PdfHexString) {
                    return [];
                }
                $label = $value = self::text($option);
            }
            if ('' === $label && '' === $value) {
                continue;
            }
            $options[] = ['label' => $label, 'value' => $value];
        }

        return $options;
    }

    private static function text(?PdfType $value): string
    {
        if ($value instanceof PdfString) {
            $text = PdfString::unescape($value->value);
        } elseif ($value instanceof PdfHexString) {
            $text = (new AsciiHex())->decode($value->value);
        } else {
            return '';
        }

        // PDF text strings use UTF-16 with a BOM, UTF-8 with a BOM, or PDFDocEncoding.
        if (str_starts_with($text, "\xFE\xFF")) {
            $text = mb_convert_encoding(substr($text, 2), 'UTF-8', 'UTF-16BE');
        } elseif (str_starts_with($text, "\xFF\xFE")) {
            $text = mb_convert_encoding(substr($text, 2), 'UTF-8', 'UTF-16LE');
        } elseif (str_starts_with($text, "\xEF\xBB\xBF")) {
            $text = mb_scrub(substr($text, 3), 'UTF-8');
        } else {
            $text = self::decodePdfDocEncoding($text);
        }

        $text = trim(preg_replace('/[\x00-\x1F\x7F]/u', '', $text));

        // Skip oversized definitions instead of silently altering names or option values.
        if (mb_strlen($text) > 512) {
            throw new \RuntimeException('PDF metadata string is too long.');
        }

        return $text;
    }

    private static function decodePdfDocEncoding(string $text): string
    {
        $special = [
            0x18 => 0x02D8, 0x19 => 0x02C7, 0x1A => 0x02C6, 0x1B => 0x02D9,
            0x1C => 0x02DD, 0x1D => 0x02DB, 0x1E => 0x02DA, 0x1F => 0x02DC,
            0x7F => 0xFFFD, 0x80 => 0x2022, 0x81 => 0x2020, 0x82 => 0x2021,
            0x83 => 0x2026, 0x84 => 0x2014, 0x85 => 0x2013, 0x86 => 0x0192,
            0x87 => 0x2044, 0x88 => 0x2039, 0x89 => 0x203A, 0x8A => 0x2212,
            0x8B => 0x2030, 0x8C => 0x201E, 0x8D => 0x201C, 0x8E => 0x201D,
            0x8F => 0x2018, 0x90 => 0x2019, 0x91 => 0x201A, 0x92 => 0x2122,
            0x93 => 0xFB01, 0x94 => 0xFB02, 0x95 => 0x0141, 0x96 => 0x0152,
            0x97 => 0x0160, 0x98 => 0x0178, 0x99 => 0x017D, 0x9A => 0x0131,
            0x9B => 0x0142, 0x9C => 0x0153, 0x9D => 0x0161, 0x9E => 0x017E,
            0x9F => 0xFFFD, 0xA0 => 0x20AC, 0xAD => 0xFFFD,
        ];
        $out = '';
        for ($i = 0, $length = \strlen($text); $i < $length; ++$i) {
            $code = \ord($text[$i]);
            $out .= mb_chr($special[$code] ?? $code, 'UTF-8');
        }

        return $out;
    }
}
