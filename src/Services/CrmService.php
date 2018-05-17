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

namespace Solspace\Freeform\Services;

use craft\db\Query;
use GuzzleHttp\Exception\BadResponseException;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\FetchCrmTypesEvent;
use Solspace\Freeform\Events\Integrations\PushEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\CRMHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;
use Solspace\Freeform\Library\Integrations\TokenRefreshInterface;
use Solspace\Freeform\Records\CrmFieldRecord;
use Solspace\Freeform\Records\IntegrationRecord;

class CrmService extends AbstractIntegrationService implements CRMHandlerInterface
{
    /** @var array */
    private static $integrations;

    /**
     * Update the access token of an integration
     *
     * @param AbstractCRMIntegration $integration
     *
     * @throws \Exception
     */
    public function updateAccessToken(AbstractCRMIntegration $integration)
    {
        $model              = $this->getIntegrationById($integration->getId());
        $model->accessToken = $integration->getAccessToken();
        $model->settings    = $integration->getSettings();

        $this->save($model);
    }

    /**
     * @return array
     * @throws \ReflectionException
     */
    public function getAllCRMServiceProviders(): array
    {
        if (null === self::$integrations) {
            $event = new FetchCrmTypesEvent();

            $this->trigger(self::EVENT_FETCH_TYPES, $event);

            self::$integrations = $event->getTypes();
        }

        return self::$integrations;
    }

    /**
     * @return array
     * @throws \ReflectionException
     */
    public function getAllCRMSettingBlueprints(): array
    {
        $serviceProviderTypes = $this->getAllCRMServiceProviders();

        // Get all blueprints per class
        $settingBlueprints = [];

        /**
         * @var AbstractCRMIntegration $providerClass
         * @var string                 $name
         */
        foreach ($serviceProviderTypes as $providerClass => $name) {
            $settingBlueprints[$providerClass] = $providerClass::getSettingBlueprints();
        }

        return $settingBlueprints;
    }

    /**
     * Get all setting blueprints for a specific CRM integration
     *
     * @param string $class
     *
     * @return SettingBlueprint[]
     * @throws IntegrationException
     * @throws \ReflectionException
     */
    public function getCRMSettingBlueprints($class): array
    {
        $serviceProviderTypes = $this->getAllCRMServiceProviders();

        /**
         * @var AbstractCRMIntegration $providerClass
         */
        foreach ($serviceProviderTypes as $providerClass => $name) {
            if ($providerClass === $class) {
                return $providerClass::getSettingBlueprints();
            }
        }

        throw new IntegrationException('Could not get CRM settings');
    }

    /**
     * Updates the fields of a given CRM integration
     *
     * @param AbstractCRMIntegration $integration
     * @param FieldObject[]          $fields
     *
     * @return bool
     */
    public function updateFields(AbstractCRMIntegration $integration, array $fields): bool
    {
        $handles = [];
        foreach ($fields as $field) {
            $handles[] = $field->getHandle();
        }

        $id             = $integration->getId();
        $existingFields = (new Query())
            ->select(['handle'])
            ->from(CrmFieldRecord::TABLE)
            ->where(['integrationId' => $id])
            ->column();

        $removableHandles = array_diff($existingFields, $handles);
        $addableHandles   = array_diff($handles, $existingFields);
        $updatableHandles = array_intersect($handles, $existingFields);

        foreach ($removableHandles as $handle) {
            // PERFORM DELETE
            \Craft::$app
                ->getDb()
                ->createCommand()
                ->delete(
                    CrmFieldRecord::TABLE,
                    [
                        'integrationId' => $id,
                        'handle'        => $handle,
                    ]
                );
        }

        foreach ($fields as $field) {
            // PERFORM INSERT
            if (\in_array($field->getHandle(), $addableHandles, true)) {
                $record                = new CrmFieldRecord();
                $record->integrationId = $id;
                $record->handle        = $field->getHandle();
                $record->label         = $field->getLabel();
                $record->type          = $field->getType();
                $record->required      = $field->isRequired();
                $record->save();
            }

            // PERFORM UPDATE
            if (\in_array($field->getHandle(), $updatableHandles, true)) {
                \Craft::$app
                    ->getDb()
                    ->createCommand()
                    ->update(
                        CrmFieldRecord::TABLE,
                        [
                            'label'    => $field->getLabel(),
                            'type'     => $field->getType(),
                            'required' => $field->isRequired() ? 1 : 0,
                        ],
                        [
                            'integrationId' => $id,
                            'handle'        => $field->getHandle(),
                        ]
                    );
            }
        }

        // Remove ForceUpdate flag
        \Craft::$app
            ->getDb()
            ->createCommand()
            ->update(
                IntegrationRecord::TABLE,
                ['forceUpdate' => 0],
                ['id' => $id]
            );

        return true;
    }

    /**
     * Returns all FieldObjects of a particular CRM integration
     *
     * @param AbstractCRMIntegration $integration
     *
     * @return FieldObject[]
     */
    public function getFields(AbstractCRMIntegration $integration): array
    {
        $data = (new Query())
            ->select(['handle', 'label', 'type', 'required'])
            ->from(CrmFieldRecord::TABLE)
            ->where(['integrationId' => $integration->getId()])
            ->orderBy('label ASC')
            ->all();

        $fields = [];
        foreach ($data as $item) {
            $fields[] = new FieldObject(
                $item['handle'],
                $item['label'],
                $item['type'],
                $item['required']
            );
        }

        return $fields;
    }

    /**
     * Push the mapped object values to the CRM
     *
     * @param Submission $submission
     *
     * @return bool
     * @throws \Solspace\Freeform\Library\Exceptions\Composer\ComposerException
     */
    public function pushObject(Submission $submission): bool
    {
        $freeform = Freeform::getInstance();

        $form       = $submission->getForm();
        $layout     = $form->getLayout();
        $properties = $form->getIntegrationProperties();

        try {
            /** @var AbstractCRMIntegration $integration */
            $integration = $this->getIntegrationObjectById($properties->getIntegrationId());
        } catch (\Exception $e) {
            return false;
        }

        $mapping = $properties->getMapping();
        if (empty($mapping)) {
            $freeform->logger->warning(
                Freeform::t(
                    "No field mapping specified for '{integration}' integration",
                    ['integration' => $integration->getName()]
                )
            );

            return false;
        }

        /** @var FieldObject[] $crmFieldsByHandle */
        $crmFieldsByHandle = [];
        foreach ($integration->getFields() as $field) {
            $crmFieldsByHandle[$field->getHandle()] = $field;
        }

        $objectValues = [];
        foreach ($mapping as $crmHandle => $fieldHandle) {
            try {
                $crmField  = $crmFieldsByHandle[$crmHandle];
                $formField = $layout->getFieldByHandle($fieldHandle);

                if ($crmField->getType() === FieldObject::TYPE_ARRAY) {
                    $value = $submission->{$formField->getHandle()}->getValue();
                } else {
                    $value = $submission->{$formField->getHandle()}->getValueAsString();
                }

                $objectValues[$crmHandle] = $integration->convertCustomFieldValue($crmField, $value);
            } catch (\Exception $e) {
                $freeform->logger->error($e->getMessage());
            }
        }

        if (!$this->onBeforePush($integration, $objectValues)) {
            return false;
        }

        if (!empty($objectValues)) {
            try {
                $result = $integration->pushObject($objectValues);

                if ($result) {
                    $this->onAfterPush($integration, $objectValues);
                }

                return $result;
            } catch (BadResponseException $e) {
                if ($integration instanceof TokenRefreshInterface) {
                    if ($integration->refreshToken() && $integration->isAccessTokenUpdated()) {
                        try {
                            $this->updateAccessToken($integration);

                            try {
                                $result = $integration->pushObject($objectValues);

                                if ($result) {
                                    $this->onAfterPush($integration, $objectValues);
                                }

                                return $result;
                            } catch (\Exception $e) {
                                $freeform->logger->error($e->getMessage());
                            }
                        } catch (\Exception $e) {
                            $freeform->logger->error($e->getMessage());
                        }
                    }
                }

                $freeform->logger->error($e->getMessage());
            } catch (\Exception $e) {
                $freeform->logger->error($e->getMessage());
            }
        }

        return false;
    }

    /**
     * @inheritDoc
     */
    protected function getIntegrationType(): string
    {
        return IntegrationRecord::TYPE_CRM;
    }

    /**
     * @param AbstractIntegration $integration
     * @param array               $values
     *
     * @return bool
     */
    private function onBeforePush(AbstractIntegration $integration, array $values): bool
    {
        $event = new PushEvent($integration, $values);
        $this->trigger(self::EVENT_BEFORE_PUSH, $event);

        return $event->isValid;
    }

    /**
     * @param AbstractIntegration $integration
     * @param array               $values
     *
     * @return bool
     */
    private function onAfterPush(AbstractIntegration $integration, array $values): bool
    {
        $event = new PushEvent($integration, $values);
        $this->trigger(self::EVENT_AFTER_PUSH, $event);

        return $event->isValid;
    }
}
