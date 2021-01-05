<?php

namespace Solspace\Freeform\Library\DataObjects\Summary;

use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Fields;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Forms;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\General;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Other;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Settings;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Spam;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\System;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Totals;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Widgets;

class Statistics
{
    /** @var System */
    public $system;

    /** @var Totals */
    public $totals;

    /** @var General */
    public $general;

    /** @var Settings */
    public $settings;

    /** @var Spam */
    public $spam;

    /** @var Fields */
    public $fields;

    /** @var Forms */
    public $forms;

    /** @var Widgets */
    public $widgets;

    /** @var Other */
    public $other;

    public function __construct()
    {
        $this->system = new System();
        $this->totals = new Totals();
        $this->general = new General();
        $this->settings = new Settings();
        $this->spam = new Spam();
        $this->fields = new Fields();
        $this->forms = new Forms();
        $this->widgets = new Widgets();
        $this->other = new Other();
    }
}
