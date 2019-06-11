<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Layout;
use Solspace\Freeform\Library\Composer\Composer;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Session\CraftRequest;
use Solspace\Freeform\Library\Session\CraftSession;
use Solspace\Freeform\Library\Translations\CraftTranslator;

/**
 * Class Freeform_FormRecord
 *
 * @property int    $id
 * @property string $name
 * @property string $handle
 * @property int    $spamBlockCount
 * @property string $submissionTitleFormat
 * @property string $description
 * @property string $layoutJson
 * @property string $returnUrl
 * @property int    $defaultStatus
 * @property int    $formTemplateId
 * @property int    $optInDataStorageTargetHash
 * @property int    $limitFormSubmissions
 * @property string $color
 */
class FormRecord extends ActiveRecord
{
    const TABLE     = '{{%freeform_forms}}';
    const TABLE_STD = 'freeform_forms';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * Factory Method
     *
     * @return FormRecord
     */
    public static function create(): FormRecord
    {
        $form = new self();
        $form->spamBlockCount = 0;

        return $form;
    }

    /**
     * @inheritDoc
     */
    public function rules(): array
    {
        return [
            [['handle'], 'unique'],
            [['name', 'handle'], 'required'],
        ];
    }
}
