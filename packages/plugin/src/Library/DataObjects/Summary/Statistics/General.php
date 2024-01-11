<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\Integrations;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\Payments;

class General
{
    public bool $databaseNotifications = false;
    public bool $fileNotifications = false;
    public bool $customFormattingTemplates = false;
    public bool $exportProfiles = false;

    public Integrations $integrations;
    public Payments $payments;

    public function __construct()
    {
        $this->payments = new Payments();
        $this->integrations = new Integrations();
    }
}
