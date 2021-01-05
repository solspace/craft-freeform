<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\ConditionalRules;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\ElementConnections;

class Forms
{
    /** @var bool */
    public $multiPage = false;

    /** @var bool */
    public $builtInAjax = false;

    /** @var bool */
    public $notStoringSubmissions = false;

    /** @var bool */
    public $postForwarding = false;

    /** @var bool */
    public $collectIp = false;

    /** @var bool */
    public $optInDataStorage = false;

    /** @var bool */
    public $limitSubmissionRate = false;

    /** @var bool */
    public $formTagAttributes = false;

    /** @var bool */
    public $adminNotifications = false;

    /** @var bool */
    public $loadingIndicators = false;

    /** @var ConditionalRules */
    public $conditionalRules;

    /** @var ElementConnections */
    public $elementConnections;

    public function __construct()
    {
        $this->conditionalRules = new ConditionalRules();
        $this->elementConnections = new ElementConnections();
    }
}
