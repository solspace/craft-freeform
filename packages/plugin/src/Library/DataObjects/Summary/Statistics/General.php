<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\Payments;

class General
{
    /** @var bool */
    public $databaseNotifications = false;

    /** @var bool */
    public $fileNotifications = false;

    /** @var bool */
    public $customFormattingTemplates = false;

    /** @var bool */
    public $exportProfiles = false;

    /** @var bool */
    public $gtm = false;

    /** @var string[] */
    public $crm = [];

    /** @var string[] */
    public $mailingLists = [];

    /** @var string[] */
    public $webhooks = [];

    /** @var string[] */
    public $paymentGateways = [];

    /** @var Payments */
    public $payments;

    public function __construct()
    {
        $this->payments = new Payments();
    }
}
