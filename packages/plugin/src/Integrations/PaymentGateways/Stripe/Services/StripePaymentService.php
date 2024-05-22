<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services;

use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Models\Payments\PaymentModel;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Stripe\PaymentIntent;

class StripePaymentService
{
    public function recordToModel(PaymentRecord $record): ?PaymentModel
    {
        $method = $record->getPaymentMethod();

        if (!$method || !$method->details) {
            return null;
        }

        $details = $method->details;

        $model = new PaymentModel();
        $model->amount = $record->amount / 100;
        $model->currency = strtoupper($record->currency);
        $model->status = $record->status;
        $model->card = $details->last4 ?? null;
        $model->brand = $details->brand ?? null;
        $model->type = $record->type;
        $model->planName = $method->planName ?? null;
        $model->interval = $method->interval ?? null;
        $model->frequency = $method->frequency ?? null;
        $model->errorMessage = $method->error ?? null;

        return $model;
    }

    public function intentToModel(StripeField $field, PaymentIntent $intent): PaymentModel
    {
        $model = new PaymentModel();
        $model->amount = $intent->amount / 100;
        $model->currency = strtoupper($intent->currency);
        $model->status = $intent->status;
        $model->card = $intent->payment_method?->card?->last4 ?? null;
        $model->brand = $intent->payment_method?->card?->brand ?? null;
        $model->type = $field->getPaymentType();
        $model->planName = $intent->invoice?->subscription?->plan?->product?->name ?? null;
        $model->interval = $intent->invoice?->subscription?->plan?->interval ?? null;
        $model->frequency = $intent->invoice?->subscription?->plan?->interval_count ?? null;

        return $model;
    }
}
