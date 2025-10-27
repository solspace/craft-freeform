<?php

namespace Solspace\Freeform\Library\DataObjects;

class SpamReason
{
    public const TYPE_GENERIC = 'generic';
    public const TYPE_HONEYPOT = 'honeypot';
    public const TYPE_JS_TEST = 'js_test';
    public const TYPE_CAPTCHA = 'captcha';
    public const TYPE_BLOCKED_KEYWORDS = 'blocked_keywords';
    public const TYPE_BLOCKED_EMAIL_ADDRESS = 'blocked_email_address';
    public const TYPE_BLOCKED_IP = 'blocked_ip';
    public const TYPE_GIBBERISH = 'gibberish';
    public const TYPE_MINIMUM_SUBMIT_TIME = 'minimum_submit_time';
    public const TYPE_MAXIMUM_SUBMIT_TIME = 'maximum_submit_time';
    public const TYPE_AI = 'ai_spam';

    private string $type;

    private string $message;

    private ?string $value;

    /**
     * SpamReason constructor.
     */
    public function __construct(string $type, string $message, ?string $value = null)
    {
        $this->type = $type;
        $this->message = $message;
        $this->value = $value;
    }

    public static function getReasons(): array
    {
        return [
            self::TYPE_GENERIC,
            self::TYPE_HONEYPOT,
            self::TYPE_JS_TEST,
            self::TYPE_CAPTCHA,
            self::TYPE_BLOCKED_KEYWORDS,
            self::TYPE_BLOCKED_EMAIL_ADDRESS,
            self::TYPE_BLOCKED_IP,
            self::TYPE_GIBBERISH,
            self::TYPE_MINIMUM_SUBMIT_TIME,
            self::TYPE_MAXIMUM_SUBMIT_TIME,
            self::TYPE_AI,
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

    public function getValue(): ?string
    {
        return $this->value;
    }
}
