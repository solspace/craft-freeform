<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Bundles\Fields\Implementations\SummaryField\SummaryFormatter;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;

#[Type(
    name: 'Summary',
    typeShorthand: 'summary',
    iconPath: __DIR__.'/../Icons/summary.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/summary.ejs',
)]
class SummaryField extends AbstractField implements ExtraFieldInterface, NoStorageInterface, NoEmailPresenceInterface
{
    protected bool $required = false;

    #[Input\Text(
        label: 'Included Field Handles',
        instructions: 'Leave blank to summarize all supported fields before this field, or enter comma-separated field handles. Fields remain in form order.',
    )]
    protected string $includedFields = '';

    #[Input\Boolean(
        label: 'Hide Empty Fields',
        instructions: 'Omit unanswered fields from the summary.',
    )]
    protected bool $hideEmpty = true;

    public function getType(): string
    {
        return self::TYPE_SUMMARY;
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    /** @return FieldInterface[] */
    public function getSourceFields(): array
    {
        $handles = array_filter(array_map('trim', explode(',', $this->includedFields)));
        $fields = [];
        foreach ($this->getForm()->getLayout()->getFields() as $field) {
            if ($field === $this || $field->getHandle() === $this->getHandle()) {
                break;
            }

            if (!$field->canRender() || !SummaryFormatter::supports($field->getType())) {
                continue;
            }

            if ($handles && !\in_array($field->getHandle(), $handles, true)) {
                continue;
            }

            $fields[] = $field;
        }

        return $fields;
    }

    public function getSummaryConfig(): array
    {
        return [
            'fields' => array_map(static fn (FieldInterface $field) => $field->getHandle(), $this->getSourceFields()),
            'hideEmpty' => $this->hideEmpty,
            'emptyValue' => \Craft::t('freeform', 'Not answered'),
            'checkedLabel' => \Craft::t('freeform', 'Yes'),
            'uncheckedLabel' => \Craft::t('freeform', 'No'),
            'filesLabel' => \Craft::t('freeform', 'Files'),
        ];
    }

    public function getInputHtml(): string
    {
        $config = $this->getSummaryConfig();
        $validator = \Craft::$container->get(RuleValidator::class);
        $formatter = new SummaryFormatter();
        $sources = [];
        $items = '';

        foreach ($this->getSourceFields() as $field) {
            $visible = !$validator->isFieldHidden($this->getForm(), $field);
            $source = $formatter->describe($field);
            $source['visible'] = $visible;
            // Never embed an initially hidden answer in the summary's HTML/data.
            $source['text'] = $visible ? $formatter->formatValue($source, $field->getValue(), $config) : '';
            if ($visible && $field instanceof TableField) {
                $source['fileCounts'] = [];
                foreach ((array) $field->getValue() as $rowIndex => $row) {
                    if (!\is_array($row)) {
                        continue;
                    }
                    foreach ($source['columns'] as $columnIndex => $column) {
                        if ('file' === $column['type']) {
                            $source['fileCounts'][$rowIndex][$columnIndex] = \count(array_filter((array) ($row[$columnIndex] ?? [])));
                        }
                    }
                }
            }
            $sources[] = $source;

            if (!$visible || ($this->hideEmpty && '' === $source['text'])) {
                continue;
            }

            $items .= Html::tag(
                'div',
                Html::tag('dt', Html::encode($source['label']))
                .Html::tag('dd', nl2br(Html::encode('' !== $source['text'] ? $source['text'] : $config['emptyValue']))),
                ['data-summary-field' => $field->getHandle()]
            );
        }

        // Compile developer attributes before adding answer data. User answers must
        // never pass through Attributes' Twig interpolation.
        $attributes = $this->getAttributes()->getInput()->clone()->toHtmlTagArray(['field' => $this]);
        $attributes['data-freeform-summary'] = true;
        $attributes['data-summary-config'] = json_encode($config, \JSON_THROW_ON_ERROR);
        $attributes['data-summary-sources'] = json_encode($sources, \JSON_THROW_ON_ERROR);

        return Html::tag('dl', $items, $attributes);
    }
}
