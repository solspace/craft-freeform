<?php

namespace Solspace\Freeform\Library\DataObjects\FreeformFeed;

use Carbon\Carbon;

class Notification
{
    public const TYPE_NOTICE = 'notice';
    public const TYPE_WARNING = 'warning';
    public const TYPE_CRITICAL = 'critical';

    private int $id;

    private string $type;

    private string $message;

    private array $conditions;

    private Carbon $dateCreated;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? 0;
        $this->type = $data['type'] ?? self::TYPE_NOTICE;
        $this->message = $data['message'] ?? '';
        $this->conditions = $data['conditions'] ?? [];
        $this->dateCreated = new Carbon($data['dateCreated'] ?? 'now');
    }

    public function getId(): int
    {
        return $this->id;
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

    public function getDateCreated(): Carbon
    {
        return $this->dateCreated;
    }
}
