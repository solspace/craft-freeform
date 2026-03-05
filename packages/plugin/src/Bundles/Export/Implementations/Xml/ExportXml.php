<?php

namespace Solspace\Freeform\Bundles\Export\Implementations\Xml;

use PhpOffice\PhpSpreadsheet\Shared\XMLWriter;
use Solspace\Freeform\Bundles\Export\AbstractSubmissionExport;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;

class ExportXml extends AbstractSubmissionExport
{
    public static function getLabel(): string
    {
        return 'XML';
    }

    public function getMimeType(): string
    {
        return 'text/xml';
    }

    public function getFileExtension(): string
    {
        return 'xml';
    }

    public function export($resource): void
    {
        $xml = new XMLWriter();

        $xml->setIndent(true);
        $xml->startDocument('1.0', 'UTF-8');

        $xml->startElement('root');

        foreach ($this->getRowBatch() as $rows) {
            foreach ($rows as $columns) {
                $xml->startElement('submission');

                foreach ($columns as $column) {
                    $field = $column->getField();
                    $value = $column->getValue();
                    $handle = $column->getDescriptor()->getId();
                    $label = $column->getDescriptor()->getLabel();

                    if ($field) {
                        $handle = $field->getHandle();
                    }

                    $xml->startElement($this->sanitizeTagName($handle));

                    if ($field instanceof MultiValueInterface) {
                        if ($field instanceof TableField) {
                            $xml->writeAttribute('label', $label);

                            $layout = $field->getTableLayout();
                            $value = \is_array($value) ? $value : [];

                            foreach ($value as $tableRow) {
                                $xml->startElement('row');

                                foreach ($tableRow as $index => $columnValue) {
                                    $xml->startElement('column');

                                    $label = $layout[$index]->label ?? null;
                                    if ($label) {
                                        $xml->writeAttribute('label', $layout[$index]->label);
                                    }

                                    if (\is_array($columnValue) || \is_object($columnValue)) {
                                        foreach ((array) $columnValue as $item) {
                                            $xml->startElement('item');
                                            $xml->text(htmlspecialchars((string) $item, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401));
                                            $xml->endElement(); // item
                                        }
                                    } elseif ($columnValue) {
                                        $xml->text(htmlspecialchars($columnValue, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401));
                                    }

                                    $xml->endElement(); // column
                                }

                                $xml->endElement(); // row
                            }
                        } elseif (\is_array($value)) {
                            foreach ($value as $item) {
                                $xml->startElement('item');
                                $xml->text(htmlspecialchars($item, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401));
                                $xml->endElement(); // item
                            }
                        }
                    } else {
                        if (\is_array($value) || \is_object($value)) {
                            foreach ($value as $key => $item) {
                                $xml->startElement('item');

                                if (!is_numeric($key)) {
                                    $xml->writeAttribute('key', $key);
                                }

                                $xml->text(htmlspecialchars($item, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401));
                                $xml->endElement();
                            }
                        } else {
                            $xml->writeAttribute('label', $label);
                            $xml->text(htmlspecialchars($value, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401));
                        }
                    }

                    $xml->endElement(); // $handle
                }

                $xml->endElement(); // submission
                fwrite($resource, $xml->flush());
            }
        }

        $xml->endElement(); // root
        $xml->endDocument();

        fwrite($resource, $xml->flush());
    }

    public function exportOld($resource): void
    {
        $xml = new \SimpleXMLElement('<root/>');

        foreach ($this->getRowBatch() as $rows) {
            $submission = $xml->addChild('submission');

            foreach ($rows as $columns) {
                foreach ($columns as $column) {
                    $field = $column->getField();
                    $value = $column->getValue();

                    $handle = $this->sanitizeTagName($column->getHandle());

                    if ($field instanceof MultiValueInterface) {
                        $node = $submission->addChild($handle);

                        if ($field instanceof TableField) {
                            $layout = $field->getTableLayout();
                            $value = \is_array($value) ? $value : [];
                            foreach ($value as $tableRow) {
                                $rowNode = $node->addChild('row');

                                foreach ($tableRow as $index => $columnValue) {
                                    $columnNode = $rowNode->addChild(
                                        'column',
                                        htmlspecialchars($columnValue, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401)
                                    );

                                    $label = $layout[$index]->label ?? null;
                                    if ($label) {
                                        $columnNode->addAttribute('label', $label);
                                    }
                                }
                            }
                        } elseif (\is_array($value)) {
                            foreach ($value as $item) {
                                $node->addChild(
                                    'item',
                                    htmlspecialchars($item, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401)
                                );
                            }
                        }
                    } else {
                        $node = $submission->addChild(
                            $handle,
                            htmlspecialchars($column->getValue(), \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401)
                        );
                    }

                    $node->addAttribute('label', $column->getLabel());
                }
            }
        }
    }

    protected function formatXml(\SimpleXMLElement $element): string
    {
        $xmlDocument = new \DOMDocument('1.0');
        $xmlDocument->preserveWhiteSpace = false;
        $xmlDocument->formatOutput = true;
        $xmlDocument->loadXML($element->asXML());

        return $xmlDocument->saveXML();
    }

    private function sanitizeTagName(?string $name): string
    {
        $name = (string) $name;
        $name = preg_replace('/[^A-Za-z0-9_\-\.]+/', '_', $name) ?: '';

        if ('' === $name || !preg_match('/^[A-Za-z_]/', $name)) {
            $name = 'field_'.$name;
        }

        return $name;
    }
}
