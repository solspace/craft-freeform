<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3;

use craft\db\Query;
use Solspace\Freeform\Bundles\Backup\BatchProcessing\ElementQueryProcessor;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Bundles\Backup\DTO\Submission;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors\FileUploadProcessor;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors\NameProcessor;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors\TableProcessor;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use verbb\formie\elements\Form as FormieForm;
use verbb\formie\elements\Submission as FormieSubmission;
use verbb\formie\fields\FileUpload;
use verbb\formie\fields\Name as FormieName;
use verbb\formie\fields\Table as FormieTable;

class SubmissionProcessor
{
    public function collectSubmissions(?array $ids = null): FormSubmissionCollection
    {
        $collection = new FormSubmissionCollection();

        try {
            $forms = FormieForm::find()->all();
            $dbForms = (new Query())
                ->select(['id', 'uid'])
                ->from('{{%formie_forms}}')
                ->all()
            ;

            $formMap = [];
            $elementUidToFormIdMap = [];
            foreach ($forms as $form) {
                $formMap[$form->uid] = $form;
                $elementUidToFormIdMap[$form->uid] = $form->id;
            }

            $formsToProcess = [];
            if (null !== $ids) {
                foreach ($dbForms as $dbForm) {
                    if (\in_array($dbForm['uid'], $ids, true)) {
                        $formsToProcess[] = $dbForm;
                    }
                }
            } else {
                foreach ($dbForms as $dbForm) {
                    $hasElementQueryForm = false;
                    foreach ($elementUidToFormIdMap as $elementUid => $formId) {
                        if ($formId == $dbForm['id']) {
                            $hasElementQueryForm = true;

                            break;
                        }
                    }
                    if ($hasElementQueryForm) {
                        $formsToProcess[] = $dbForm;
                    }
                }
            }

            foreach ($formsToProcess as $dbForm) {
                $formUid = $dbForm['uid'];

                try {
                    $hasElementQueryForm = false;
                    $elementQueryForm = null;
                    foreach ($elementUidToFormIdMap as $elementUid => $formId) {
                        if ($formId == $dbForm['id']) {
                            $hasElementQueryForm = true;
                            $elementQueryForm = $formMap[$elementUid] ?? null;

                            break;
                        }
                    }

                    $form = $elementQueryForm ?? null;
                    if (!$form) {
                        $form = (object) [
                            'id' => $dbForm['id'],
                            'uid' => $formUid,
                            'title' => 'Form '.$dbForm['id'],
                        ];
                    }

                    $submissions = FormieSubmission::find()->formId($form->id)->siteId('*');
                    $submissionCount = $submissions->count();

                    if (0 === $submissionCount) {
                        continue;
                    }

                    $formSubmissions = new FormSubmissions();
                    $formSubmissions->formUid = $elementQueryForm ? $elementQueryForm->uid : $form->uid;

                    $formSubmissions->submissionBatchProcessor = new ElementQueryProcessor($submissions);
                    $formSubmissions->setProcessor(
                        static function (FormieSubmission $row) use ($form) {
                            $exported = new Submission();
                            $exported->title = $row->title ?? 'Migrated submission';
                            $exported->status = $row->status ?? 'active';

                            try {
                                $formFields = $form->getFields();
                                foreach ($formFields as $field) {
                                    $handle = $field->handle ?? '';
                                    $value = $row->getFieldValue($field->handle ?? '');

                                    // Handle Formie File Upload field values
                                    if ($field instanceof FileUpload) {
                                        $fileUploadProcessor = new FileUploadProcessor();
                                        $value = $fileUploadProcessor->convertSubmissionValue($value);
                                    }

                                    // Normalize Formie Name field values and align handles with Freeform NameProcessor
                                    if ($field instanceof FormieName) {
                                        $nameProcessor = new NameProcessor();
                                        foreach ($nameProcessor->convertSubmissionValue($field, $value) as $nameHandle => $nameValue) {
                                            $exported->{$nameHandle} = $nameValue;
                                        }

                                        continue;
                                    }

                                    // Normalize Formie Table field values and align handles with Freeform TableProcessor
                                    if ($field instanceof FormieTable) {
                                        $tableProcessor = new TableProcessor();
                                        $handle = $tableProcessor->getSanitizedHandle($handle);
                                        $value = $tableProcessor->convertSubmissionValue($field, $value);
                                    }

                                    $exported->{$handle} = $value;
                                }
                            } catch (\Throwable $e) {
                                Freeform::getInstance()->logger->getLogger(FreeformLogger::MIGRATION)->warning(
                                    'Falling back to raw field values while migrating a Formie submission.',
                                    [
                                        'formId' => $form->id ?? null,
                                        'submissionId' => $row->id ?? null,
                                        'exception' => $e->getMessage(),
                                    ]
                                );

                                $fieldValues = $row->getFieldValues();
                                foreach ($fieldValues as $handle => $value) {
                                    $exported->{$handle} = $value;
                                }
                            }

                            return $exported;
                        }
                    );

                    $collection->add($formSubmissions, $form->uid);
                } catch (\Throwable $e) {
                    Freeform::getInstance()->logger->getLogger(FreeformLogger::MIGRATION)->error(
                        'Skipping a Formie form while migrating submissions.',
                        [
                            'formId' => $dbForm['id'] ?? null,
                            'formUid' => $formUid,
                            'exception' => $e->getMessage(),
                        ]
                    );

                    continue;
                }
            }
        } catch (\Throwable $e) {
            Freeform::getInstance()->logger->getLogger(FreeformLogger::MIGRATION)->error('Failed to collect Formie submissions for migration.', ['exception' => $e->getMessage()]);

            throw $e;
        }

        return $collection;
    }
}
