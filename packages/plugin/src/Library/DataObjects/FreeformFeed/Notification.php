<?php

namespace Solspace\Freeform\Library\DataObjects\FreeformFeed;

class Notification
{
    public const TYPE_NOTICE = 'notice';
    public const TYPE_WARNING = 'warning';
    public const TYPE_CRITICAL = 'critical';

    /** @var string */
    private $type;

    /** @var string */
    private $message;

    /** @var string[] */
    private $conditions;

    public function __construct(array $data)
    {
        $this->type = $data['type'] ?? self::TYPE_NOTICE;
        $this->message = $data['message'] ?? '';
        $this->conditions = $data['conditions'] ?? [];
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getConditions(): array
    {
        return $this->conditions;
    }
}
