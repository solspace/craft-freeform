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
        $model->id = $record->id;
        $model->resourceId = $record->resourceId;
        $model->amount = $record->amount / 100;
        $model->currency = strtoupper($record->currency);
        $model->status = $record->status;
        $model->card = $details->last4 ?? null;
        $model->brand = $details->brand ?? null;
        $model->type = $record->type;
        $model->method = $method;
        $model->planName = $method->planName ?? null;
        $model->interval = $method->interval ?? null;
        $model->frequency = $method->frequency ?? null;

        if (isset($method->error)) {
            if (\is_string($method->error)) {
                $model->errorMessage = $method->error;
            } elseif (isset($method->error->message)) {
                $model->errorMessage = $method->error->message;
            } else {
                $model->errorMessage = json_encode($method->error);
            }
        }

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

        if (isset($intent->payment_method)) {
            $method = ['type' => $intent->payment_method->type];
            if (isset($intent->payment_method->{$intent->payment_method->type})) {
                $details = $intent->payment_method->type;
                if (method_exists($details, 'toArray')) {
                    $details = $details->toArray();
                }

                $method['details'] = $details;
            }

            $model->method = $method;
        }

        return $model;
    }
}
