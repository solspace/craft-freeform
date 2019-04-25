<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations;

class SettingBlueprint
{
    const TYPE_INTERNAL = 'internal';
    const TYPE_CONFIG   = 'config';
    const TYPE_TEXT     = 'text';
    const TYPE_PASSWORD = 'password';
    const TYPE_BOOL     = 'bool';

    /** @var string */
    private $type;

    /** @var string */
    private $handle;

    /** @var string */
    private $label;

    /** @var string */
    private $instructions;

    /** @var bool */
    private $required;

    /**
     * SettingObject constructor.
     *
     * @param string $type
     * @param string $handle
     * @param string $label
     * @param string $instructions
     * @param bool   $required
     */
    public function __construct(
        $type,
        $handle,
        $label,
        $instructions,
        $required = false
    ) {
        $this->type         = $type;
        $this->handle       = $handle;
        $this->label        = $label;
        $this->instructions = $instructions;
        $this->required     = (bool)$required;
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getHandle(): string
    {
        return $this->handle;
    }

    /**
     * @return string
     */
    public function getLabel(): string
    {
        return $this->label;
    }

    /**
     * @return string
     */
    public function getInstructions(): string
    {
        return $this->instructions;
    }

    /**
     * @return boolean
     */
    public function isRequired(): bool
    {
        return $this->required;
    }
}
