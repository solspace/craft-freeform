<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

class Spam
{
    /** @var bool */
    public $honeypot = false;

    /** @var bool */
    public $customHoneypotName = false;

    /** @var bool */
    public $javascriptEnhancement = false;

    /** @var string */
    public $spamProtectionBehaviour = false;

    /** @var bool */
    public $spamFolder = false;

    /** @var bool */
    public $purgeSpam = false;

    /** @var int */
    public $purgeInterval = 0;

    /** @var bool */
    public $blockEmail = false;

    /** @var bool */
    public $blockKeywords = false;

    /** @var bool */
    public $blockIp = false;

    /** @var bool */
    public $submissionThrottling = false;

    /** @var bool */
    public $minSubmitTime = false;

    /** @var bool */
    public $submitExpiration = false;

    /** @var bool */
    public $recaptcha = false;

    /** @var string */
    public $recaptchaType = '';
}
