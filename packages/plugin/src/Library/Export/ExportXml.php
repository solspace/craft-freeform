<?php

namespace Solspace\Freeform\Library\Export;

use DOMDocument;
use SimpleXMLElement;
use Solspace\Freeform\Fields\Pro\TableField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;

class ExportXml extends AbstractExport
{
    public function getMimeType(): string
    {
        return 'text/xml';
    }

    public function getFileExtension(): string
    {
        return 'xml';
    }

    public function export(): string
    {
        $xml = new SimpleXMLElement('<root/>');

        foreach ($this->getRows() as $row) {
            $submission = $xml->addChild('submission');

            foreach ($row as $column) {
                $field = $column->getField();
                $value = $column->getValue();

                if ($field && $field instanceof MultipleValueInterface) {
                    $node = $submission->addChild($column->getHandle());

                    if ($field instanceof TableField) {
                        $layout = $field->getTableLayout();
                        foreach ($value as $tableRow) {
                            $rowNode = $node->addChild('row');

                            foreach ($tableRow as $index => $columnValue) {
                                $columnNode = $rowNode->addChild('column', htmlspecialchars($columnValue));

                                $label = $layout[$index]['label'] ?? null;
                                if ($label) {
                                    $columnNode->addAttribute('label', $label);
                                }
                            }
                        }
                    } else {
                        foreach ($value as $item) {
                            $node->addChild('item', htmlspecialchars($item));
                        }
                    }
                } else {
                    $node = $submission->addChild(
                        $column->getHandle(),
                        htmlspecialchars($column->getValue())
                    );
                }

                $node->addAttribute('label', $column->getLabel());
            }
        }

        return $this->formatXml($xml);
    }

    protected function formatXml(SimpleXMLElement $element): string
    {
        $xmlDocument = new DOMDocument('1.0');
        $xmlDocument->preserveWhiteSpace = false;
        $xmlDocument->formatOutput = true;
        $xmlDocument->loadXML($element->asXML());

        return $xmlDocument->saveXML();
    }
}
