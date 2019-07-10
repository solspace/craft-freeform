<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Events\Forms\AfterSubmitEvent;
use Solspace\Freeform\FieldTypes\SubmissionFieldType;
use Solspace\Freeform\Freeform;

class RelationsService extends BaseService
{
    /**
     * @param AfterSubmitEvent $event
     *
     * @throws \Throwable
     * @throws \craft\errors\ElementNotFoundException
     * @throws \yii\base\Exception
     */
    public function relate(AfterSubmitEvent $event)
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        $form          = $event->getForm();
        $relationships = $form->getRelations()->getRelationships();
        $submission    = $event->getSubmission();

        if (empty($relationships) || !$submission || !$submission->id) {
            return;
        }

        foreach ($relationships as $relationship) {
            $elementId = $relationship->getElementId();
            $fieldHandle = $relationship->getFieldHandle();

            $element   = \Craft::$app->elements->getElementById($elementId);
            if ($element) {
                $layout = $element->getFieldLayout();
                if (!$layout) {
                    continue;
                }

                $field = $layout->getFieldByHandle($fieldHandle);
                if (!$field || !$field instanceof SubmissionFieldType) {
                    continue;
                }

                $existingRelations = $element->getFieldValue($fieldHandle);
                if ($existingRelations instanceof SubmissionQuery) {
                    $existingRelations = $existingRelations->ids();
                }

                if (!is_array($existingRelations)) {
                    $existingRelations = empty($existingRelations) ? [] : [$existingRelations];
                }

                $existingRelations[] = $submission->id;

                \Craft::$app->relations->saveRelations($field, $element, $existingRelations);
            }
        }
    }
}
