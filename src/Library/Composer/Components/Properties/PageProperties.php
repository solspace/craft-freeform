<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Properties;

class PageProperties extends AbstractProperties
{
    /** @var string */
    protected $label;

    /**
     * @return string
     */
    public function getLabel(): string
    {
        return $this->label ?: 'Page';
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
        return ['label' => self::TYPE_STRING];
    }
}
