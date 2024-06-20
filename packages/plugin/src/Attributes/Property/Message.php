<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Message implements CustomNormalizerInterface
{
    public const WARNING = 'warning';
    public const NOTICE = 'notice';

    public function __construct(public string $message, public string $type = self::NOTICE) {}

    public function normalize(): array
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
        ];
    }
}
