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

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\CraftPluginConfiguration;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Logging\CraftLogger;
use Solspace\Freeform\Library\Translations\CraftTranslator;

/**
 * Class IntegrationRecord
 *
 * @property int       $id
 * @property string    $name
 * @property string    $handle
 * @property string    $type
 * @property string    $class
 * @property string    $accessToken
 * @property string    $settings
 * @property bool      $forceUpdate
 * @property \DateTime $lastUpdate
 */
class IntegrationRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_integrations}}';

    const TYPE_MAILING_LIST = 'mailing_list';
    const TYPE_CRM          = 'crm';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
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
