<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Jobs;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class FreeformQueueHandler
{
    public function __construct(
        private SettingsService $settingsService
    ) {}

    public function executeNotificationJob(NotificationJobInterface $job): void
    {
        $queue = \Craft::$app->getQueue();

        if ($this->settingsService->isNotificationQueueEnabled()) {
            $queue->push($job);
        } else {
            $job->execute($queue);
        }
    }

    public function executeIntegrationJob(IntegrationJobInterface $job): void
    {
        $queue = \Craft::$app->getQueue();

        if ($this->settingsService->isIntegrationQueueEnabled()) {
            $queue->push($job);
        } else {
            $job->execute($queue);
        }
    }

    public function rehydrateForm(Form $form, Submission $submission): Form
    {
        $submissionFields = $submission->getFieldCollection();

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof PersistentValueInterface || !$field->getHandle()) {
                continue;
            }

            $submissionField = $submissionFields->get($field);
            if (!$submissionField) {
                continue;
            }

            $event = new TransformValueEvent($field, $submissionField->getValue());
            Event::trigger(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, $event);

            if (!$event->isValid) {
                continue;
            }

            $field->setValue($event->getValue());
        }

        return $form;
    }
}
