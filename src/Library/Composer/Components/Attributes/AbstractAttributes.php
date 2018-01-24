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

namespace Solspace\Freeform\Library\Composer\Components\Attributes;

use Solspace\Freeform\Library\Exceptions\FreeformException;

abstract class AbstractAttributes
{
    /**
     * CustomFormAttributes constructor.
     *
     * @param array|null $attributes
     *
     * @throws FreeformException
     */
    public function __construct(array $attributes = null)
    {
        if ($attributes) {
            foreach ($attributes as $key => $value) {
                if (property_exists($this, $key)) {
                    $this->{$key} = $value;
                } else {
                    throw new FreeformException(sprintf("Invalid attribute '%s' provided", $key));
                }
            }
        }
    }

    /**
     * Merges the passed attributes into the existing ones
     *
     * @param array|null $attributes
     *
     * @throws FreeformException
     */
    public function mergeAttributes(array $attributes = null)
    {
        if ($attributes) {
            foreach ($attributes as $key => $value) {
                if (property_exists($this, $key)) {
                    $this->{$key} = $value;
                } else {
                    throw new FreeformException(sprintf("Invalid attribute '%s' provided", $key));
                }
            }
        }
    }

    /**
     * Walk through the array and create an attribute string
     *
     * @param array $array
     *
     * @return string
     */
    protected final function getAttributeStringFromArray(array $array)
    {
        $attributeString = "";

        foreach ($array as $key => $value) {
            if (is_bool($value) && $value) {
                $attributeString .= "$key ";
            } else if (!is_bool($value)) {
                $attributeString .= "$key=\"$value\" ";
            }
        }

        return $attributeString ? " " . $attributeString : "";
    }

    /**
     * @param array|string $value
     *
     * @return string
     */
    protected final function extractClassValue($value)
    {
        if (empty($value)) {
            return "";
        }

        if (is_array($value)) {
            $value = implode(" ", $value);
        }

        return $value;
    }
}
