<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Records\SubmissionNoteRecord;

class NotesService extends BaseService
{
    public function saveNote($submissionId)
    {
        $note = \Craft::$app->request->post(SubmissionNoteRecord::NOTE_FIELD_NAME);
        $record = SubmissionNoteRecord::findOne(['submissionId' => $submissionId]);

        if (!$record) {

            // We will not create a new empty note record
            if (!$note) {
                return false;
            }

            $record = new SubmissionNoteRecord();
            $record->submissionId = $submissionId;
        }
        
        $record->note = $note;
        $record->validate();

        if (!$record->hasErrors()) {
            $transaction = \Craft::$app->getDb()->beginTransaction();
            try {
                $record->save(false);

                if ($transaction !== null) {
                    $transaction->commit();
                }

                return true;

            } catch (\Exception $e) {
                if ($transaction !== null) {
                    $transaction->rollBack();
                }

                throw $e;
            }
        }

        return false;
    }
}
