<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderSubmissionFieldEvent;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
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

        Event::on(
            Submission::class,
            Submission::EVENT_RENDER_TABLE_VALUE,
            [$this, 'renderTableValue']
        );
    }

    public function renderSubmissionFieldTemplate(RenderSubmissionFieldEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof PayPalField) {
            return;
        }

        $payment = PaymentRecord::findOne([
            'submissionId' => $event->getSubmission()->id,
            'fieldId' => $field->getId(),
        ]);

        if (!$payment) {
            $event->setOutput('-');

            return;
        }

        $template = file_get_contents(__DIR__.'/../Templates/submission-field.twig');
        $metadata = json_decode($payment->metadata ?? '{}', true);

        // Prefer metadata for amount/currency/status; fallback to record
        $unit = $metadata['unit'] ?? 'dollars';

        $rawAmount = 0;
        if (isset($metadata['amount'])) {
            $rawAmount = (float) $metadata['amount'];
        } elseif (isset($payment->amount)) {
            $rawAmount = (float) $payment->amount;
        }

        $displayAmount = null;
        if ($rawAmount > 0) {
            $isCents = 'cents' === $unit;
            $divider = $isCents ? 100 : 1;
            $displayAmount = number_format($rawAmount / $divider, 2);
        }

        $displayStatus = (string) ($metadata['status'] ?? $payment->status);

        $captureId = $metadata['captureId'] ?? null;
        $orderId = $metadata['orderId'] ?? $payment->resourceId ?? null;
        $dashboardLink = null;

        $base = 'https://www.paypal.com';
        if ($captureId) {
            $dashboardLink = $base.'/activity/payment/'.$captureId;
        } elseif ($orderId) {
            $dashboardLink = $base.'/activity/payment/'.$orderId;
        }

        $paypalSvg = file_get_contents(__DIR__.'/../icon.svg');

        $paypalMeta = $metadata;
        $feeAmount = null;
        $netAmount = null;
        if (isset($paypalMeta['paypalFee'])) {
            $feeAmount = number_format((float) $paypalMeta['paypalFee'], 2);
        }
        if (isset($paypalMeta['netAmount'])) {
            $netAmount = number_format((float) $paypalMeta['netAmount'], 2);
        }

        $event->setOutput(
            \Craft::$app->view->renderString(
                $template,
                [
                    'field' => $field,
                    'submission' => $event->getSubmission(),
                    'payment' => $payment,
                    'amount' => $displayAmount,
                    'currency' => $paypalMeta['currency'] ?? $payment->currency,
                    'paypalSvg' => $paypalSvg,
                    'paypalMeta' => $paypalMeta,
                    'feeAmount' => $feeAmount,
                    'netAmount' => $netAmount,
                    'dashboardLink' => $dashboardLink,
                    'displayStatus' => $displayStatus,
                ]
            )
        );
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof PayPalField) {
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

        $metadata = json_decode($payment->metadata ?? '{}');
        $unit = $metadata->unit ?? 'cents';
        $amount = $payment->amount;
        if ('dollars' !== $unit) {
            $amount = number_format(((float) $amount) / 100, 2);
        } else {
            $amount = number_format((float) $amount, 2);
        }

        $event->setOutput(\sprintf('PayPal · %s %s', strtoupper($payment->currency), $amount));
    }
}
