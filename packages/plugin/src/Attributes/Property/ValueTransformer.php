<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Library\Exceptions\FreeformException;

/**
 * @template T of TransformerInterface
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class ValueTransformer
{
    /**
     * @param class-string<T> $className
     */
    public function __construct(
        public string $className,
    ) {
        $reflection = new \ReflectionClass($this->className);
        if (!$reflection->implementsInterface(TransformerInterface::class)) {
            throw new FreeformException('Provided class "'.$this->className.'" does not implement TransformerInterface');
        }
    }
}
