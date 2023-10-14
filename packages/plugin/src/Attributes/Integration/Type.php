<?php

namespace Solspace\Freeform\Attributes\Integration;

use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Symfony\Component\Serializer\Annotation\Ignore;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    public array $editions = [];
    public string $class;
    public string $shortName;
    public ?PropertyCollection $properties;

    public function __construct(
        public string $name,
        public ?string $readme = null,
        public ?string $iconPath = null,
    ) {
    }

    public function __toString(): string
    {
        return $this->name;
    }

    public function getReadmeContent(): ?string
    {
        if ($this->readme && file_exists($this->readme)) {
            return file_get_contents($this->readme);
        }

        return null;
    }

    public function implements(string $interface): bool
    {
        return (new \ReflectionClass($this->class))->implementsInterface($interface);
    }

    #[Ignore]
    public function getIconUrl(): ?string
    {
        if ($this->iconPath && file_exists($this->iconPath)) {
            return \Craft::$app->assetManager->getPublishedUrl($this->iconPath, true);
        }

        return null;
    }
}
