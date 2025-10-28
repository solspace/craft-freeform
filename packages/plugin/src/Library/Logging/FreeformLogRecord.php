<?php

namespace Solspace\Freeform\Library\Logging;

use Monolog\Level;
use Monolog\LogRecord;

class FreeformLogRecord
{
    public function __construct(
        public string $message,
        public string $channel,
        public \DateTimeImmutable $datetime,
        public array $context,
        public array $extra,
        private int $levelValue,
        private string $levelName,
    ) {}

    public function getLevelValue(): int
    {
        return $this->levelValue;
    }

    public function getLevelName(): string
    {
        return $this->levelName;
    }

    public static function fromLogRecord(LogRecord $record): self
    {
        return new self(
            message: $record->message,
            channel: $record->channel,
            datetime: $record->datetime,
            context: $record->context ?? [],
            extra: $record->extra ?? [],
            levelValue: $record->level->value,
            levelName: $record->level->getName(),
        );
    }

    public static function fromLegacyRecord(array $record): self
    {
        [$defaultValue, $defaultName] = self::defaultErrorLevel();

        $message = (string) ($record['message'] ?? '');
        $channel = (string) ($record['channel'] ?? 'app');
        $context = \is_array($record['context'] ?? null) ? $record['context'] : [];
        $extra = \is_array($record['extra'] ?? null) ? $record['extra'] : [];

        $levelValue = (int) ($record['level'] ?? $defaultValue);
        $levelName = (string) ($record['level_name'] ?? $defaultName);

        $datetime = $record['datetime'] ?? null;
        if (!$datetime instanceof \DateTimeImmutable) {
            $datetime = new \DateTimeImmutable();
        }

        return new self(
            message: $message,
            channel: $channel,
            datetime: $datetime,
            context: $context,
            extra: $extra,
            levelValue: $levelValue,
            levelName: $levelName,
        );
    }

    private static function defaultErrorLevel(): array
    {
        if (class_exists(Level::class)) {
            $level = Level::Error;

            return [$level->value, $level->getName()];
        }

        return [400, 'ERROR'];
    }
}
