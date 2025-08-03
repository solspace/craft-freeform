<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3;

use craft\db\Query;
use Solspace\Freeform\Bundles\Backup\BatchProcessing\ElementQueryProcessor;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\DTO\FormSubmissions;
use Solspace\Freeform\Bundles\Backup\DTO\Submission;
use verbb\formie\elements\Form as FormieForm;
use verbb\formie\elements\Submission as FormieSubmission;

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

                $submissions = FormieSubmission::find()->formId($form->id);
                $submissionCount = $submissions->count();

                if ($submissionCount > 0) {
                    $formSubmissions = new FormSubmissions();
                    $formSubmissions->formUid = $elementQueryForm ? $elementQueryForm->uid : $form->uid;

                    $formSubmissions->submissionBatchProcessor = new ElementQueryProcessor($submissions);
                    $formSubmissions->setProcessor(
                        function (FormieSubmission $row) use ($form) {
                            $exported = new Submission();
                            $exported->title = $row->title ?? 'Migrated submission';
                            $exported->status = $row->status ?? 'active';

                            try {
                                $formFields = $form->getFields();
                                foreach ($formFields as $field) {
                                    $handle = $field->handle ?? '';
                                    $value = $row->getFieldValue($field->handle ?? '');
                                    $exported->{$handle} = $value;
                                }
                            } catch (\Throwable $e) {
                                $fieldValues = $row->getFieldValues();
                                foreach ($fieldValues as $handle => $value) {
                                    $exported->{$handle} = $value;
                                }
                            }

                            return $exported;
                        }
                    );

                    $collection->add($formSubmissions, $form->uid);
                }
            }
        } catch (\Throwable $e) {
            return new FormSubmissionCollection();
        }

        return $collection;
    }
}
