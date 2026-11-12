<?php

namespace Solspace\Freeform\Bundles\Submissions;

use CraftCms\Cms\Element\Events\ElementSourceTableAttributesResolving;
use Illuminate\Support\Facades\Event;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Bundles\FeatureBundle;

class CustomSourceFields extends FeatureBundle
{
    public function __construct()
    {
        Event::listen(
            ElementSourceTableAttributesResolving::class,
            [$this, 'handleCustomTableAttributes']
        );
    }

    public function handleCustomTableAttributes(ElementSourceTableAttributesResolving $event): void
    {
        if (!\in_array($event->elementType, [Submission::class, SpamSubmission::class], true)
            || !preg_match('/^form:(\d+)$/', $event->source, $matches)) {
            return;
        }

        $forms = $this->plugin()->forms->getAllForms();
        $form = $forms[(int) $matches[1]] ?? null;
        if (null === $form) {
            return;
        }

        foreach ($form->getLayout()->getFields()->getStorableFields() as $field) {
            $event->attributes->put('field:'.$field->getId(), ['label' => $field->getLabel()]);
        }
    }
}
