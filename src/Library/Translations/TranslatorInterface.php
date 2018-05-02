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

namespace Solspace\Freeform\Library\Translations;

interface TranslatorInterface
{
    /**
     * Translates a string
     * Replaces any variables in the $string with variables from $variables
     * User brackets to specify variables in string
     *
     * Example:
     * Translation string: "Hello, {firstName}!"
     * Variables: ["firstName": "Icarus"]
     * End result: "Hello, Icarus!"
     *
     * @param string $string
     * @param array  $variables
     *
     * @return string
     */
    public function translate($string, array $variables = []): string;
}
