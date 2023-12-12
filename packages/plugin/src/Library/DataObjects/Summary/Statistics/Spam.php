<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics;

class Spam
{
    /** @var string */
    public $spamProtectionBehavior = false;

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
    public $captcha = false;

    /** @var string */
    public $captchaType = '';

    /** @var bool */
    public bool $bypassSpamCheckOnLoggedInUsers;

    /** @var int */
    public int $submissionThrottlingCount;
}
