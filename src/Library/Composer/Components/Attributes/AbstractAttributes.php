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

namespace Solspace\Freeform\Library\Composer\Components\Attributes;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Library\Exceptions\FreeformException;

abstract class AbstractAttributes
{
    /**
     * @param array $attributes
     * @param null  $templateObject
     * @param array $templateVars
     *
     * @return array
     * @throws \Throwable
     * @throws \yii\base\Exception
     */
    public static function extractAttributes(array $attributes, $templateObject = null, array $templateVars = []): array
    {
        $byAttribute = [];
        foreach ($attributes as $values) {
            $attribute = $values['attribute'] ?? '';
            $value     = $values['value'] ?? '';

            if (empty($attribute) || (empty($value) && empty($attribute))) {
                continue;
            }

            $attribute = \Craft::$app->view->renderObjectTemplate($attribute, $templateObject, $templateVars);
            $attribute = htmlentities($attribute, ENT_QUOTES);

            if (!$value) {
                if (!isset($byAttribute[$attribute])) {
                    $byAttribute[$attribute] = null;
                }

                continue;
            }

            $value = \Craft::$app->view->renderObjectTemplate($value, $templateObject, $templateVars);
            $value = htmlentities($value, ENT_QUOTES);

            if (isset($byAttribute[$attribute])) {
                $byAttribute[$attribute] .= ' ' . $value;
            } else {
                $byAttribute[$attribute] = $value;
            }
        }

        return $byAttribute;
    }

    /**
     * @param array $attributes
     * @param null  $templateObject
     * @param array $templateVars
     *
     * @return string
     * @throws \Throwable
     * @throws \yii\base\Exception
     */
    public static function extractAttributeString(array $attributes, $templateObject = null, array $templateVars = []): string
    {
        $attributes = self::extractAttributes($attributes, $templateObject, $templateVars);

        $output = [];
        foreach ($attributes as $attribute => $value) {
            if (null === $value) {
                $output[] = "$attribute";
            } else {
                $output[] = "$attribute=\"$value\"";
            }
        }

        return $output ? ' ' . implode(' ', $output) : '';
    }

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
    final protected function getAttributeStringFromArray(array $array): string
    {
        return StringHelper::compileAttributeStringFromArray($array);
    }

    /**
     * @param array|string $value
     *
     * @return string
     */
    final protected function extractClassValue($value)
    {
        if (empty($value)) {
            return '';
        }

        if (\is_array($value)) {
            $value = implode(' ', $value);
        }

        return $value;
    }
}
