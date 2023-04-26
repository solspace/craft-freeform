<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Table\TableTransformer;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\MultiDimensionalValueInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Properties\Table\TableLayout;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Attributes\Attributes;

#[Type(
    name: 'Table',
    typeShorthand: 'table',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class TableField extends AbstractField implements MultiValueInterface, MultiDimensionalValueInterface, ExtraFieldInterface
{
    use MultipleValueTrait;

    public const COLUMN_TYPE_STRING = 'string';
    public const COLUMN_TYPE_SELECT = 'select';
    public const COLUMN_TYPE_CHECKBOX = 'checkbox';

    #[Property(
        label: 'Table Layout',
        instructions: 'Use semicolon ";" separated values for select options.',
        type: Property::TYPE_TABLE,
        value: [],
        transformer: TableTransformer::class,
        options: [
            [
                'value' => self::COLUMN_TYPE_STRING,
                'label' => 'Text',
            ],
            [
                'value' => self::COLUMN_TYPE_CHECKBOX,
                'label' => 'Checkbox',
            ],
            [
                'value' => self::COLUMN_TYPE_SELECT,
                'label' => 'Select',
            ],
        ],
    )]
    protected TableLayout $tableLayout;

    #[Property(
        label: 'Use built-in Table JS?'
    )]
    protected bool $useScript = false;

    #[Property(
        label: 'Maximum number of rows',
        instructions: 'Set the maximum number of rows that can be added to the table.',
    )]
    protected ?int $maxRows;

    #[Property(
        label: 'Add Button Label',
        instructions: 'Set the label for the add button.',
    )]
    protected string $addButtonLabel = 'Add';

    #[Property(
        label: 'Add Button Markup',
        instructions: 'Set the markup for the add button.',
    )]
    protected ?string $addButtonMarkup;

    #[Property(
        label: 'Remove Button Label',
        instructions: 'Set the label for the remove button.',
    )]
    protected string $removeButtonLabel = 'Remove';

    #[Property(
        label: 'Remove Button Markup',
        instructions: 'Set the markup for the remove button.',
    )]
    protected ?string $removeButtonMarkup;

    public function getType(): string
    {
        return self::TYPE_TABLE;
    }

    public function getTableLayout(): TableLayout
    {
        return $this->tableLayout;
    }

    public function isUseScript(): bool
    {
        return $this->useScript;
    }

    public function getMaxRows(): ?int
    {
        return $this->maxRows;
    }

    public function getAddButtonLabel(): string
    {
        return $this->addButtonLabel;
    }

    public function getAddButtonMarkup(): ?string
    {
        return $this->addButtonMarkup;
    }

    public function getRemoveButtonLabel(): string
    {
        return $this->removeButtonLabel;
    }

    public function getRemoveButtonMarkup(): ?string
    {
        return $this->removeButtonMarkup;
    }

    public function setValue(mixed $value): self
    {
        $layout = $this->getTableLayout();

        $this->values = $values = [];
        if (!\is_array($value)) {
            return $this;
        }

        foreach ($value as $rowIndex => $row) {
            if (!\is_array($row)) {
                continue;
            }

            $hasSingleValue = false;
            $rowValues = [];
            foreach ($layout as $index => $column) {
                $value = $row[$index] ?? '';
                if ($value) {
                    $hasSingleValue = true;
                }

                $rowValues[$index] = $value;
            }

            if (!$hasSingleValue) {
                continue;
            }

            $values[] = $rowValues;
        }

        $this->values = $values;

        return $this;
    }

    protected function getInputHtml(): string
    {
        $layout = $this->getTableLayout();

        $attributes = $this->attributes->getInput();

        $handle = $this->getHandle();
        $values = $this->getValue();
        if (empty($values)) {
            $values = [];
            foreach ($layout as $column) {
                $type = $column['type'] ?? self::COLUMN_TYPE_STRING;
                if (self::COLUMN_TYPE_CHECKBOX === $type) {
                    $values[] = null;
                } else {
                    $values[] = $column['value'] ?? null;
                }
            }

            $values = [$values];
        }

        $tableAttributes = (new Attributes())
            ->set('data-freeform-table')
            ->set('class', $attributes->find('class') ?? false)
        ;

        $id = $this->getIdAttribute();
        $output = '<table'.$tableAttributes.'>';

        $output .= '<thead>';
        $output .= '<tr>';

        $rowAttributes = $this->attributes->getLabel();

        foreach ($layout as $column) {
            $label = $column['label'] ?? '';

            $output .= '<th'.$rowAttributes.'>'.htmlentities($label).'</th>';
        }
        $output .= '<th>&nbsp;</th></tr>';
        $output .= '</thead>';

        $inputAttributes = clone $attributes;
        $inputAttributes->setIfEmpty('type', 'checkbox');

        $output .= '<tbody>';
        foreach ($values as $rowIndex => $row) {
            $output .= '<tr>';

            foreach ($layout as $index => $column) {
                $type = $column['type'] ?? self::COLUMN_TYPE_STRING;
                $defaultValue = $column['value'] ?? '';
                $value = $row[$index] ?? $defaultValue;
                $value = htmlentities($value);

                $output .= '<td>';

                $name = "{$handle}[{$rowIndex}][{$index}]";

                switch ($type) {
                    case self::COLUMN_TYPE_CHECKBOX:
                        $value = $row[$index];

                        $currentInputAttributes = (new Attributes())
                            ->set('name', $name)
                            ->set('value', $defaultValue)
                            ->set('data-default-value', $defaultValue)
                            ->set('checked', (bool) $value)
                            ->set('class', $attributes->find('checkboxClass') ?? false)
                        ;

                        $output .= '<input'.$currentInputAttributes.' />';

                        break;

                    case self::COLUMN_TYPE_SELECT:
                        $selectAttributes = (new Attributes())
                            ->set('class', $attributes->find('selectClass') ?? false)
                            ->set('name', $name)
                        ;

                        $options = explode(';', $defaultValue);
                        $output .= '<select'.$selectAttributes.'>';

                        foreach ($options as $option) {
                            $optionAttributes = (new Attributes())
                                ->set('value', $option)
                                ->set('selected', $option === $value)
                            ;

                            $output .= '<option '.$optionAttributes.'>'
                                .$option
                                .'</option>';
                        }

                        $output .= '</select>';

                        break;

                    case self::COLUMN_TYPE_STRING:
                    default:
                        $currentInputAttributes = $inputAttributes
                            ->clone()
                            ->replace('type', 'text')
                            ->replace('name', $name)
                            ->replace('value', $value)
                            ->replace('data-default-value', $defaultValue)
                        ;

                        $output .= '<input'.$currentInputAttributes.' />';

                        break;
                }

                $output .= '</td>';
            }

            $output .= '<td>';
            if ($this->getRemoveButtonMarkup()) {
                $output .= $this->getRemoveButtonMarkup();
            } else {
                $buttonAttributes = (new Attributes())
                    ->set('data-freeform-table-remove-row')
                    ->set('class', $attributes->find('removeButtonClass') ?? false)
                    ->set('type', 'button')
                ;

                $output .= '<button'.$buttonAttributes.'>'
                    .$this->getRemoveButtonLabel()
                    .'</button>';
            }
            $output .= '</td>';

            $output .= '</tr>';
        }
        $output .= '</tbody>';
        $output .= '</table>';

        if ($this->getAddButtonMarkup()) {
            $output .= $this->getAddButtonMarkup();
        } else {
            $buttonAttributes = (new Attributes())
                ->set('data-freeform-table-add-row')
                ->set('class', $attributes->find('addButtonClass') ?? false)
                ->set('data-target', $id)
                ->set('type', 'button')
            ;

            $output .= '<button'.$buttonAttributes.'>'
                .$this->getAddButtonLabel()
                .'</button>';
        }

        return $output;
    }
}
