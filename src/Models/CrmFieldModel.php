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

namespace Solspace\Freeform\Models;

use craft\base\Model;

/**
 * @property int    $id
 * @property int    $integrationId
 * @property string $handle
 * @property string $label
 * @property string $type
 * @property bool   $required
 */
class CrmFieldModel extends Model
{
    /** @var int */
    public $id;

    /** @var int */
    public $integrationId;

    /** @var string */
    public $handle;

    /** @var string */
    public $label;

    /** @var string */
    public $type;

    /** @var bool */
    public $required;

    /**
     * @return CrmFieldModel
     */
    public static function create(): CrmFieldModel
    {
        return new self();
    }
}
