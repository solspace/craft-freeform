<?php

namespace Solspace\Freeform\Library\DataObjects\Summary;

use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Fields;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Forms;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\General;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Notifications;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Rules;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Settings;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Spam;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\System;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Totals;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Widgets;

class Statistics
{
    public System $system;
    public Totals $totals;
    public General $general;
    public Settings $settings;
    public Spam $spam;
    public Fields $fields;
    public Forms $forms;
    public Notifications $notifications;
    public Rules $rules;
    public Widgets $widgets;

    public function __construct()
    {
        $this->system = new System();
        $this->totals = new Totals();
        $this->general = new General();
        $this->settings = new Settings();
        $this->spam = new Spam();
        $this->fields = new Fields();
        $this->forms = new Forms();
        $this->notifications = new Notifications();
        $this->rules = new Rules();
        $this->widgets = new Widgets();
    }
}
