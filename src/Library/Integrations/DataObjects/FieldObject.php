<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\DataObjects;

use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\FreeformSalesforceLead\Library\SalesforceLead;

class FieldObject implements \JsonSerializable
{
    const TYPE_STRING  = 'string';
    const TYPE_ARRAY   = 'array';
    const TYPE_NUMERIC = 'numeric';
    const TYPE_BOOLEAN = 'boolean';

    /** @var string */
    private $handle;

    /** @var string */
    private $label;

    /** @var bool */
    private $required;

    /** @var string */
    private $type;

    /**
     * @return array
     */
    public static function getTypes(): array
    {
        return [self::TYPE_STRING, self::TYPE_NUMERIC, self::TYPE_BOOLEAN, self::TYPE_ARRAY];
    }

    /**
     * @return string
     */
    public static function getDefaultType(): string
    {
        return self::TYPE_STRING;
    }

    /**
     * @param string $handle
     * @param string $label
     * @param string $type
     * @param bool   $required
     */
    public function __construct($handle, $label, $type, $required = false)
    {
        $this->handle   = $handle;
        $this->label    = $label;
        $this->type     = $type;
        $this->required = (bool) $required;
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
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @return boolean
     */
    public function isRequired(): bool
    {
        return (bool) $this->required;
    }

    /**
     * Specify data which should be serialized to JSON
     */
    public function jsonSerialize(): array
    {
        return [
            'handle'   => $this->getHandle(),
            'label'    => $this->getLabel(),
            'required' => $this->isRequired(),
        ];
    }
}
