<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Library\Exceptions\FreeformException;

/**
 * @template T of ValueGeneratorInterface
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class ValueGenerator
{
    /**
     * @param class-string<T> $className
     */
    public function __construct(
        public string $className,
    ) {
        $reflection = new \ReflectionClass($this->className);
        if (!$reflection->implementsInterface(ValueGeneratorInterface::class)) {
            throw new FreeformException('Provided class "'.$this->className.'" does not implement ValueGeneratorInterface');
        }
    }
}
