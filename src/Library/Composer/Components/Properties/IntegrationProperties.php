<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Properties;

class IntegrationProperties extends AbstractProperties
{
    /** @var int */
    protected $integrationId;

    /** @var array */
    protected $mapping;

    /**
     * @return int|null
     */
    public function getIntegrationId()
    {
        return (int)$this->integrationId ?: null;
    }

    /**
     * @return array|null
     */
    public function getMapping()
    {
        return !empty($this->mapping) ? $this->mapping : null;
    }

    /**
     * Return a list of all property fields and their type
     *
     * [propertyKey => propertyType, ..]
     * E.g. ["name" => "string", ..]
     *
     * @return array
     */
    protected function getPropertyManifest(): array
    {
        return [
            'integrationId' => self::TYPE_INTEGER,
            'mapping'       => self::TYPE_ARRAY,
        ];
    }
}
