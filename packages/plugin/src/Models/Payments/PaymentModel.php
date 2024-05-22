<?php

namespace Solspace\Freeform\Models\Payments;

use craft\base\Model;

class PaymentModel extends Model
{
    public int $amount = 0;
    public string $currency = '';
    public string $status = '';
    public ?string $errorMessage = null;
    public ?string $card = null;
    public ?string $brand = null;
    public string $type = '';
    public ?string $planName = null;
    public ?string $interval = null;
    public ?string $frequency = null;
}
