<?php

namespace Solspace\Freeform\Library\Export;

use Carbon\Carbon;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Fields\TextareaField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\ExportSettings;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Export\Objects\Column;
use Solspace\Freeform\Library\Export\Objects\Row;

abstract class AbstractExport implements ExportInterface
{
    /** @var Form */
    private $form;

    /** @var Row[] */
    private $rows;

    /** @var bool */
    private $removeNewLines;

    /** @var bool */
    private $exportLabels;

    /** @var bool */
    private $handlesAsNames;

    /** @var string */
    private $timezone;

    public function __construct(
        Form $form,
        array $submissionData,
        ExportSettings $settings = null
    ) {
        if (null === $settings) {
            $settings = new ExportSettings();
        }

        $this->timezone = $settings->getTimezone();

        $this->form = $form;
        $this->removeNewLines = $settings->isRemoveNewlines();
        $this->exportLabels = $settings->isExportLabels();
        $this->handlesAsNames = $settings->isHandlesAsNames();

        $this->rows = $this->parseSubmissionDataIntoRows($submissionData);
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return Row[]
     */
    public function getRows(): array
    {
        return $this->rows;
    }

    public function isRemoveNewLines(): bool
    {
        return $this->removeNewLines;
    }

    public function isHandlesAsNames(): bool
    {
        return $this->handlesAsNames;
    }

    /**
     * Prepare the submission data to have field handles and labels ready.
     */
    private function parseSubmissionDataIntoRows(array $submissionData): array
    {
        $form = $this->getForm();

        $rows = [];
        foreach ($submissionData as $rowIndex => $row) {
            $rowObject = new Row();

            $columnIndex = 0;
            foreach ($row as $fieldId => $value) {
                $field = null;
                if ('dateCreated' === $fieldId) {
                    $date = new Carbon($value, 'UTC');
                    $date->setTimezone($this->timezone);

                    $value = $date->toDateTimeString();
                }

                $label = $fieldId;
                $handle = $fieldId;
                if (preg_match('/^'.Submission::FIELD_COLUMN_PREFIX.'(\d+)$/', $fieldId, $matches)) {
                    try {
                        $field = $form->getLayout()->getFieldById($matches[1]);
                        $label = $field->getLabel();
                        $handle = $field->getHandle();

                        if ($field instanceof MultipleValueInterface) {
                            if (preg_match('/^(\[|\{).*(\]|\})$/', $value)) {
                                $value = (array) json_decode($value, true);
                            }
                        }

                        if ($field instanceof ObscureValueInterface) {
                            $value = $field->getActualValue($value);
                        }

                        if ($field instanceof FileUploadField && \is_array($value)) {
                            $urls = [];

                            foreach ($value as $assetId) {
                                $asset = \Craft::$app->assets->getAssetById((int) $assetId);
                                if ($asset) {
                                    $assetValue = $asset->filename;
                                    if ($asset->getUrl()) {
                                        $assetValue = $asset->getUrl();
                                    }

                                    $urls[] = $assetValue;
                                }
                            }

                            $value = $urls;
                        }

                        if ($field instanceof TextareaField && $this->isRemoveNewLines()) {
                            $value = trim(preg_replace('/\s+/', ' ', $value));
                        }

                        if ($this->exportLabels && $field instanceof OptionsInterface) {
                            $options = $field->getOptionsAsKeyValuePairs();

                            if (\is_array($value)) {
                                foreach ($value as $index => $val) {
                                    $value[$index] = $options[$val] ?? $val;
                                }
                            } else {
                                $value = $options[$value] ?? $value;
                            }
                        }
                    } catch (FreeformException $e) {
                        continue;
                    }
                } else {
                    switch ($fieldId) {
                        case 'id':
                            $label = 'ID';

                            break;

                        case 'dateCreated':
                            $label = 'Date Created';

                            break;

                        case 'ip':
                            $label = 'IP';

                            break;

                        case 'cc_type':
                            $label = 'Payment Type';

                            break;

                        case 'cc_amount':
                            $label = 'Payment Amount';

                            break;

                        case 'cc_currency':
                            $label = 'Payment Currency';

                            break;

                        case 'cc_card':
                            $label = 'Payment Card';

                            break;

                        case 'cc_status':
                            $label = 'Payment Status';

                            break;

                        default:
                            $label = ucfirst($label);

                            break;
                    }
                }

                $rowObject->addColumn(
                    new Column($columnIndex++, $label, $handle, $field, $value)
                );
            }

            $rows[] = $rowObject;
        }

        return $rows;
    }
}
