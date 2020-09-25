<?php

namespace Solspace\Freeform\Library\Export;

use Carbon\Carbon;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Fields\TextareaField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
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

    /**
     * @param string $type
     * @param Form   $form
     * @param array  $data
     * @param bool   $removeNewlines
     *
     * @return ExportInterface
     */
    public static function create(string $type, Form $form, array $data, bool $removeNewlines = false): ExportInterface
    {
        switch ($type) {
            case 'json':
                return new ExportJson($form, $data, $removeNewlines);

            case 'xml':
                return new ExportXml($form, $data, $removeNewlines);

            case 'text':
                return new ExportText($form, $data, $removeNewlines);

            case 'excel':
                return new ExportExcel($form, $data, $removeNewlines);

            case 'csv':
            default:
                return new ExportCsv($form, $data, $removeNewlines);
        }
    }

    /**
     * @param Form  $form
     * @param array $submissionData
     * @param bool  $removeNewLines
     */
    public function __construct(Form $form, array $submissionData, bool $removeNewLines = false)
    {
        $this->form           = $form;
        $this->removeNewLines = $removeNewLines;
        $this->rows           = $this->parseSubmissionDataIntoRows($submissionData);
    }

    /**
     * @return Form
     */
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

    /**
     * @return bool
     */
    public function isRemoveNewLines(): bool
    {
        return $this->removeNewLines;
    }

    /**
     * Prepare the submission data to have field handles and labels ready
     *
     * @param array $submissionData
     *
     * @return array
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
                if ($fieldId === 'dateCreated') {
                    $date = new Carbon($value, 'UTC');
                    $date->setTimezone(date_default_timezone_get());

                    $value = $date->toDateTimeString();
                }

                $label  = $fieldId;
                $handle = $fieldId;
                if (preg_match('/^' . Submission::FIELD_COLUMN_PREFIX . '(\d+)$/', $fieldId, $matches)) {
                    try {
                        $field  = $form->getLayout()->getFieldById($matches[1]);
                        $label  = $field->getLabel();
                        $handle = $field->getHandle();

                        if ($field instanceof MultipleValueInterface) {
                            if (preg_match('/^(\[|\{).*(\]|\})$/', $value)) {
                                $value = (array) \GuzzleHttp\json_decode($value, true);
                            }
                        }

                        if ($field instanceof ObscureValueInterface) {
                            $value = $field->getActualValue($value);
                        }

                        if ($field instanceof FileUploadField) {
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
