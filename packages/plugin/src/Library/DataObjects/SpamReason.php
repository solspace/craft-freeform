<?php

namespace Solspace\Freeform\Library\DataObjects;

class SpamReason
{
    const TYPE_GENERIC = 'generic';
    const TYPE_HONEYPOT = 'honeypot';
    const TYPE_JS_TEST = 'js_test';
    const TYPE_RECAPTCHA = 'recaptcha';
    const TYPE_BLOCKED_KEYWORDS = 'blocked_keywords';
    const TYPE_BLOCKED_EMAIL_ADDRESS = 'blocked_email_address';
    const TYPE_BLOCKED_IP = 'blocked_ip';
    const TYPE_MINIMUM_SUBMIT_TIME = 'minimum_submit_time';
    const TYPE_MAXIMUM_SUBMIT_TIME = 'maximum_submit_time';

    /** @var string */
    private $type;

    /** @var string */
    private $message;

    /**
     * SpamReason constructor.
     */
    public function __construct(string $type, string $message)
    {
        $this->type = $type;
        $this->message = $message;
    }

    public static function getReasons(): array
    {
        return [
            self::TYPE_GENERIC,
            self::TYPE_HONEYPOT,
            self::TYPE_JS_TEST,
            self::TYPE_RECAPTCHA,
            self::TYPE_BLOCKED_KEYWORDS,
            self::TYPE_BLOCKED_EMAIL_ADDRESS,
            self::TYPE_BLOCKED_IP,
            self::TYPE_MINIMUM_SUBMIT_TIME,
            self::TYPE_MAXIMUM_SUBMIT_TIME,
        ];
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getMessage(): string
    {
        return $this->message;
    }
}
