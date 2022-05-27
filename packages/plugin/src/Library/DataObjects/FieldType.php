<?php

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;

class FieldType implements \JsonSerializable
{
    private string $name;

    private string $type;

    private ?string $icon;

    private bool $isStorable;

    public function __construct(private string $className)
    {
        $reflection = new \ReflectionClass($className);

        if (!$reflection->isSubclassOf(AbstractField::class)) {
            return null;
        }

        // @var AbstractField $className
        $this->type = $className::getFieldType();
        $this->name = $className::getFieldTypeName();
        $this->icon = $className::getSvgIcon();
        $this->isStorable = !$reflection->implementsInterface(NoStorageInterface::class);
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getIcon(): string
    {
        return $this->icon;
    }

    public function isStorable(): bool
    {
        return $this->isStorable;
    }

    public function jsonSerialize(): array
    {
        return [
            'name' => $this->name,
            'type' => $this->type,
            'class' => $this->className,
            'icon' => $this->icon,
            'storable' => $this->isStorable(),
        ];
    }
}
