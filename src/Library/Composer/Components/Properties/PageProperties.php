<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Properties;

use Solspace\Freeform\Library\Composer\Components\Properties;

class PageProperties extends AbstractProperties
{
    /** @var string */
    protected $label;

    /**
     * @param int $index
     *
     * @return string
     */
    public static function getKey(int $index): string
    {
        return Properties::PAGE_PREFIX . $index;
    }

    /**
     * @param string $key
     *
     * @return int
     */
    public static function getIndex(string $key): int
    {
        return (int) str_replace(Properties::PAGE_PREFIX, '', $key);
    }

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
