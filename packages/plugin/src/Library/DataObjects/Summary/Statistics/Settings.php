<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

class Settings
{
    /** @var bool */
    public $customPluginName = false;

    /** @var string */
    public $defaultView = false;

    /** @var bool */
    public $renderHtmlInComposer = false;

    /** @var bool */
    public $ajaxEnabledByDefault = false;

    /** @var bool */
    public $includeDefaultFormattingTemplates = false;

    /** @var bool */
    public $removeNewlinesOnExport = false;

    /** @var bool */
    public $populateValuesFromGet = false;

    /** @var bool */
    public $disableSubmit = false;

    /** @var bool */
    public $autoScroll = false;

    /** @var string */
    public $jsInsertLocation = '';

    /** @var bool */
    public $purgeSubmissions = false;

    /** @var int */
    public $purgeInterval = false;

    /** @var bool */
    public $formattingTemplatesPath = false;

    /** @var bool */
    public $sendAlertsOnFailedNotifications = false;

    /** @var bool */
    public $notificationTemplatesPath = false;

    /** @var bool */
    public $modifiedStatuses = false;

    /** @var bool */
    public $demoTemplatesInstalled = false;
}
