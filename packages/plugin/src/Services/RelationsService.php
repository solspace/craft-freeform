<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\FieldTypes\SubmissionFieldType;
use Solspace\Freeform\Freeform;

class RelationsService extends BaseService
{
    /**
     * @throws \Throwable
     */
    public function relate(SubmitEvent $event): void
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        $form = $event->getForm();
        $relationships = $form->getRelations()->getRelationships();
        $submission = $form->getSubmission();

        if (empty($relationships) || !$submission || !$submission->id) {
            return;
        }

        $integrationsProvider = \Craft::$container->get(FormIntegrationsProvider::class);
        if ($integrationsProvider->shouldDeferPostProcessForAsyncSpam($form) && !$form->isAsyncSpamValidated()) {
            return;
        }

        foreach ($relationships as $relationship) {
            $elementId = $relationship->getElementId();
            $fieldHandle = $relationship->getFieldHandle();

            $element = \Craft::$app->elements->getElementById($elementId);
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

                if (!\is_array($existingRelations)) {
                    $existingRelations = empty($existingRelations) ? [] : [$existingRelations];
                }

                $existingRelations[] = $submission->id;

                $element->setFieldValue($fieldHandle, $existingRelations);
                \Craft::$app->elements->saveElement($element);
            }
        }
    }
}
