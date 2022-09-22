<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations;

class SettingBlueprint implements \JsonSerializable
{
    public const TYPE_INTERNAL = 'internal';
    public const TYPE_CONFIG = 'config';
    public const TYPE_TEXT = 'text';
    public const TYPE_AUTO = 'auto';
    public const TYPE_PASSWORD = 'password';
    public const TYPE_BOOL = 'bool';

    public function __construct(
        private string $type,
        private string $handle,
        private string $label,
        private string $instructions,
        private bool $required = false,
        private mixed $defaultValue = null,
        private bool $instanceSetting = false
    ) {
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getInstructions(): string
    {
        return $this->instructions;
    }

    public function isRequired(): bool
    {
        return $this->required;
    }

    public function getDefaultValue(): mixed
    {
        return $this->defaultValue;
    }

    public function isInstanceSetting(): bool
    {
        return $this->instanceSetting;
    }

    public function jsonSerialize()
    {
        return (object) [
            'type' => $this->type,
            'handle' => $this->handle,
            'label' => $this->label,
            'instructions' => $this->instructions,
            'required' => $this->required,
            'defaultValue' => $this->defaultValue,
        ];
    }
}
