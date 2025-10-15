<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\EventListeners;

use Solspace\Freeform\Events\Submissions\RenderSubmissionFieldEvent;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;

class RenderTemplates extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_RENDER_FIELD,
            [$this, 'renderSubmissionFieldTemplate']
        );
    }

    public function renderSubmissionFieldTemplate(RenderSubmissionFieldEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof MollieField) {
            return;
        }

        $template = file_get_contents(__DIR__.'/../Templates/submission-field.twig');

        $payment = PaymentRecord::findOne([
            'submissionId' => $event->getSubmission()->id,
            'fieldId' => $field->getId(),
        ]);

        if (!$payment) {
            $event->setOutput('<div class="field"><div class="heading"><label><span>'.$field->getLabel().'</span></label></div><div class="mollie"><p>No payment found</p></div></div>');

            return;
        }

        $metadata = json_decode($payment->metadata ?? '{}', true);
        $amount = $payment->amount ? (float) $payment->amount : 0;
        $currency = $payment->currency ?? 'EUR';
        $status = $payment->status ?? 'unknown';

        $event->setOutput(
            \Craft::$app->view->renderString(
                $template,
                [
                    'field' => $field,
                    'submission' => $event->getSubmission(),
                    'payment' => $payment,
                    'amount' => $amount,
                    'currency' => $currency,
                    'status' => $status,
                    'method' => $metadata['method'] ?? null,
                ]
            )
        );
    }
}
