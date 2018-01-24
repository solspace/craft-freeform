<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\base\Model;

/**
 * @property int    $id
 * @property int    $mailingListId
 * @property string $handle
 * @property string $label
 * @property string $type
 * @property bool   $required
 */
class MailingListFieldModel extends Model
{
    /** @var int */
    public $id;

    /** @var int */
    public $mailingListId;

    /** @var string */
    public $handle;

    /** @var string */
    public $label;

    /** @var string */
    public $type;

    /** @var bool */
    public $required;

    /**
     * @return MailingListFieldModel
     */
    public static function create(): MailingListFieldModel
    {
        return new self();
    }
}
