<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Common;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;

interface PaymentFieldInterface extends NoEmailPresenceInterface, FieldInterface {}
