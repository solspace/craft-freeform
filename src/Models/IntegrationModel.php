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
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\CraftPluginConfiguration;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Integrations\PaymentGateways\AbstractPaymentGatewayIntegration;
use Solspace\Freeform\Library\Logging\CraftLogger;
use Solspace\Freeform\Library\Translations\CraftTranslator;
use Solspace\Freeform\Records\IntegrationRecord;

/**
 * @property string $id
 * @property string $name
 * @property string $handle
 * @property string $type
 * @property string $class
 * @property string $accessToken
 * @property string $settings
 * @property string $forceUpdate
 * @property string $lastUpdate
 */
class IntegrationModel extends Model implements IntegrationStorageInterface
{
    /** @var int */
    public $id;

    /** @var string */
    public $name;

    /** @var string */
    public $handle;

    /** @var string */
    public $type;

    /** @var string */
    public $class;

    /** @var string */
    public $accessToken;

    /** @var array */
    public $settings;

    /** @var bool */
    public $forceUpdate;

    /** @var \DateTime */
    public $lastUpdate;

    /**
     * @param string $type
     *
     * @return IntegrationModel
     */
    public static function create($type): IntegrationModel
    {
        $model              = new self();
        $model->type        = $type;
        $model->forceUpdate = true;
        $model->lastUpdate  = new \DateTime();

        return $model;
    }

    /**
     * @inheritDoc
     */
    public function safeAttributes()
    {
        return [
            'name',
            'handle',
            'class',
            'accessToken',
            'settings',
            'forceUpdate',
            'lastUpdate',
        ];
    }

    /**
     * Update the access token
     *
     * @param string $accessToken
     */
    public function updateAccessToken(string $accessToken)
    {
        $this->accessToken = $accessToken;
    }

    /**
     * Update the settings that are to be stored
     *
     * @param array $settings
     */
    public function updateSettings(array $settings = [])
    {
        $this->settings = $settings;
    }

    /**
     * @inheritDoc
     */
    public function setForceUpdate(bool $value)
    {
        $this->forceUpdate = $value;
    }

    /**
     * @return bool
     * @throws IntegrationException
     */
    public function isOAuthConnection(): bool
    {
        return $this->getIntegrationObject()->isOAuthConnection();
    }

    /**
     * @return AbstractIntegration|AbstractCRMIntegration|AbstractMailingListIntegration|AbstractPaymentGatewayIntegration
     * @throws IntegrationException
     * @throws IntegrationNotFoundException
     */
    public function getIntegrationObject()
    {
        $freeform = Freeform::getInstance();

        switch ($this->type) {
            case IntegrationRecord::TYPE_MAILING_LIST:
                $handler = $freeform->mailingLists;
                break;

            case IntegrationRecord::TYPE_CRM:
                $handler = $freeform->crm;
                break;

            case IntegrationRecord::TYPE_PAYMENT_GATEWAY:
                $handler = $freeform->paymentGateways;
                break;

            default:
                throw new IntegrationException(Freeform::t('Unknown integration type specified'));
        }

        $className = $this->class;

        if (!class_exists($className)) {
            throw new IntegrationNotFoundException(sprintf('"%s" class does not exist', $className));
        }

        /** @var AbstractIntegration $integration */
        $integration = new $className(
            $this->id,
            $this->name,
            $this->lastUpdate,
            $this->accessToken,
            $this->settings,
            new CraftLogger(),
            new CraftPluginConfiguration(),
            new CraftTranslator(),
            $handler
        );

        $integration->setForceUpdate($this->forceUpdate);

        return $integration;
    }
}
