<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Square\EventListeners;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Events\Submissions\RenderSubmissionFieldEvent;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Fields\SquareField;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Services\SquarePriceService;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;

class RenderTemplates extends FeatureBundle
{
    public function __construct(
        private SquarePriceService $priceService,
    ) {
        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_RENDER_FIELD,
            [$this, 'renderSubmissionFieldTemplate']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_RENDER_TABLE_VALUE,
            [$this, 'renderTableValue']
        );

        \Craft::$app->view->hook(
            'freeform.submissions.edit.sidepanel',
            [$this, 'renderSubmissionSidePanel']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            function (ProcessSubmissionEvent $event) {
                $form = $event->getForm();
                $submission = $event->getSubmission();

                foreach ($form->getLayout()->getFields() as $field) {
                    if (!$field instanceof SquareField) {
                        continue;
                    }

                    $value = (string) $field->getValue();
                    if (!$value) {
                        continue;
                    }

                    $integration = $field->getIntegration();
                    if (!$integration) {
                        continue;
                    }

                    $existing = PaymentRecord::findOne([
                        'fieldId' => $field->getId(),
                        'integrationId' => $integration->getId(),
                        'resourceId' => $value,
                    ]);

                    if ($existing) {
                        continue;
                    }

                    $record = new PaymentRecord();
                    $record->integrationId = $integration->getId();
                    $record->fieldId = $field->getId();
                    $record->submissionId = $submission->id;
                    $record->resourceId = $value;
                    $record->type = 'payment';
                    $record->currency = $field->getCurrency();

                    try {
                        $amount = $this->priceService->getAmount($form, $field);
                    } catch (\Throwable) {
                        $amount = 0;
                    }

                    $record->amount = $amount;
                    $record->status = 'COMPLETED';
                    $record->save();
                }
            }
        );
    }

    public function renderSubmissionFieldTemplate(RenderSubmissionFieldEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof SquareField) {
            return;
        }

        $template = file_get_contents(__DIR__.'/../Templates/submission-field.twig');

        $squareSvg = file_get_contents(__DIR__.'/../icon.svg');

        $payment = PaymentRecord::findOne([
            'submissionId' => $event->getSubmission()->id,
            'fieldId' => $field->getId(),
        ]);

        if (!$payment) {
            $event->setOutput('<p>No payment found</p>');

            return;
        }

        $event->setOutput(
            \Craft::$app->view->renderString(
                $template,
                [
                    'field' => $field,
                    'amount' => $this->priceService->getFormattedAmount($payment->amount, $payment->currency),
                    'currency' => $payment?->currency,
                    'squareSvg' => $squareSvg,
                    'submission' => $event->getSubmission(),
                    'payment' => $payment,
                ]
            )
        );
    }

    public function renderSubmissionSidePanel(array &$context): ?string
    {
        static $rendered = false;

        if ($rendered) {
            return null;
        }

        $submission = $context['submission'];

        $payment = PaymentRecord::findOne([
            'submissionId' => $submission->id,
        ]);

        if (!$payment) {
            return null;
        }

        $context['payment'] = $payment;
        $context['squareSvg'] = file_get_contents(__DIR__.'/../icon.svg');
        $context['amount'] = $this->priceService->getFormattedAmount($payment->amount, $payment->currency);
        $context['currency'] = $payment->currency;

        $templateContents = file_get_contents(__DIR__.'/../Templates/submission-side-panel.twig');

        $rendered = true;

        return \Craft::$app->view->renderString(
            $templateContents,
            $context,
        );
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof SquareField) {
            return;
        }

        $submission = $event->getSubmission();
        $payment = PaymentRecord::findOne([
            'submissionId' => $submission->id,
            'fieldId' => $field->getId(),
        ]);

        if (!$payment) {
            $event->setOutput('-');

            return;
        }

        $event->setOutput(
            $this->priceService->getFormattedAmount($payment->amount, $payment->currency).' '.strtoupper($payment->currency)
        );
    }
}
