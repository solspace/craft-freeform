<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services\Integrations;

use craft\db\Query;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Integrations\DeleteEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Events\Integrations\SaveEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Webhooks\WebhookIntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Services\BaseService;
use yii\base\Event;

class IntegrationsService extends BaseService
{
    public const EVENT_REGISTER_INTEGRATION_TYPES = 'register-integration-types';

    public const EVENT_BEFORE_SAVE = 'before-save';
    public const EVENT_AFTER_SAVE = 'after-save';
    public const EVENT_BEFORE_DELETE = 'before-delete';
    public const EVENT_AFTER_DELETE = 'after-delete';

    public function __construct(
        $config = [],
        private PropertyProvider $propertyProvider,
    ) {
        parent::__construct($config);
    }

    /**
     * @return Type[]
     */
    public function getAllIntegrationTypes(): array
    {
        static $types;

        if (null === $types) {
            $event = new RegisterIntegrationTypesEvent();
            Event::trigger(self::class, self::EVENT_REGISTER_INTEGRATION_TYPES, $event);

            $types = $event->getTypes();
            usort($types, fn (Type $a, Type $b) => strcmp($a->name, $b->name));
        }

        return $types;
    }

    /**
     * @return IntegrationModel[]
     */
    public function getAllIntegrations(?string $type = null): array
    {
        $this->getAllIntegrationTypes();
        $query = $this->getQuery();

        if ($type) {
            $query->andWhere(['[[type]]' => $type]);
        }

        $results = $query->all();

        $models = [];
        foreach ($results as $result) {
            $model = $this->createIntegrationModel($result);
            $models[] = $model;
        }

        return $models;
    }

    public function getById(int $id): ?IntegrationModel
    {
        $result = $this->getQuery()->where(['id' => $id])->one();
        if (!$result) {
            return null;
        }

        return $this->createIntegrationModel($result);
    }

    public function getByHandle(string $handle): ?IntegrationModel
    {
        $result = $this->getQuery()->where(['handle' => $handle])->one();
        if (!$result) {
            return null;
        }

        return $this->createIntegrationModel($result);
    }

    public function save(IntegrationModel $model, IntegrationInterface $integration, bool $triggerEvents = false): bool
    {
        try {
            $integration->onBeforeSave();
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        $this->updateModelFromIntegration($model, $integration);

        $isNew = !$model->id;

        $beforeSaveEvent = new SaveEvent($model, $integration, $isNew);
        if ($triggerEvents) {
            $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);
        }

        if ($isNew) {
            $record = new IntegrationRecord();
        } else {
            $record = IntegrationRecord::findOne(['id' => $model->id]);

            if (!$record) {
                throw new IntegrationException(
                    Freeform::t('Email Marketing integration with ID {id} not found', ['id' => $model->id])
                );
            }
        }

        $record->enabled = $model->enabled;
        $record->name = $model->name;
        $record->handle = $model->handle;
        $record->type = $model->type;
        $record->class = $model->class;
        $record->metadata = $model->metadata;

        $record->validate();
        $model->addErrors($record->getErrors());

        if ($beforeSaveEvent->isValid && !$model->hasErrors()) {
            $transaction = \Craft::$app->getDb()->beginTransaction();

            try {
                $record->save(false);

                if ($isNew) {
                    $model->id = $record->id;
                    $integration->setId($record->id);
                }

                $transaction?->commit();

                if ($triggerEvents) {
                    $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($model, $integration, $isNew));
                }

                return true;
            } catch (\Exception $e) {
                $transaction?->rollBack();

                throw $e;
            }
        }

        return false;
    }

    public function delete(int $id): bool
    {
        $model = $this->getById($id);
        if (!$model) {
            return false;
        }

        $beforeDeleteEvent = new DeleteEvent($model);
        $this->trigger(self::EVENT_BEFORE_DELETE, $beforeDeleteEvent);

        if (!$beforeDeleteEvent->isValid) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->beginTransaction();

        try {
            $affectedRows = \Craft::$app->getDb()
                ->createCommand()
                ->delete(IntegrationRecord::TABLE, ['id' => $model->id])
                ->execute()
            ;

            $transaction?->commit();

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($model));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            $transaction?->rollBack();

            throw $exception;
        }
    }

    public function getIntegrationType(string|IntegrationInterface $integration): string
    {
        $reflection = new \ReflectionClass($integration);

        if ($reflection->implementsInterface(CRMIntegrationInterface::class)) {
            return 'crm';
        }

        if ($reflection->implementsInterface(EmailMarketingIntegrationInterface::class)) {
            return 'email-marketing';
        }

        if ($reflection->implementsInterface(PaymentGatewayIntegrationInterface::class)) {
            return 'payment-gateways';
        }

        if ($reflection->implementsInterface(WebhookIntegrationInterface::class)) {
            return 'webhooks';
        }

        if ($reflection->implementsInterface(CaptchaIntegrationInterface::class)) {
            return 'captchas';
        }

        return 'other';
    }

    public function decryptModelValues(IntegrationModel $model): void
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        if (!$model->class) {
            return;
        }

        $properties = $this->propertyProvider->getEditableProperties($model->class);
        foreach ($properties as $property) {
            if (!$property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
                continue;
            }

            $value = $model->metadata[$property->handle];
            if ($value) {
                $value = \Craft::$app->security->decryptByKey(base64_decode($value), $securityKey);
            }

            $model->metadata[$property->handle] = $value;
        }
    }

    public function parsePostedModelData(IntegrationModel $model): void
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        $editableProperties = $this->propertyProvider->getEditableProperties($model->class);
        foreach ($editableProperties as $property) {
            $handle = $property->handle;
            $value = $model->metadata[$handle] ?? null;

            if ($value && $property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
                $value = base64_encode(\Craft::$app->security->encryptByKey($value, $securityKey));

                $model->metadata[$property->handle] = $value;
            }
        }
    }

    public function updateModelFromIntegration(IntegrationModel $model, IntegrationInterface $integration): void
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        $editableProperties = $this->propertyProvider->getEditableProperties($model->class);
        $reflection = new \ReflectionClass($model->class);
        foreach ($editableProperties as $property) {
            if ($property->hasFlag(IntegrationInterface::FLAG_READONLY, IntegrationInterface::FLAG_INSTANCE_ONLY)) {
                continue;
            }

            $handle = $property->handle;
            $instanceProperty = $reflection->getProperty($handle);
            $value = $instanceProperty->getValue($integration);

            if (!$value && $property->required && !$property->visibilityFilters) {
                $model->addError(
                    $model->class.$handle,
                    Freeform::t('{key} is required', ['key' => $property->label])
                );

                continue;
            }

            if ($property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
                $value = base64_encode(\Craft::$app->security->encryptByKey($value, $securityKey));
            }

            $model->metadata[$property->handle] = $value;
        }
    }

    public function getForForm(?Form $form = null, ?string $type = null): array
    {
        static $cache;

        if (null === $cache) {
            $cache = [];
        }

        $key = ($form?->getId() ?? '0').$type;

        if (!isset($cache[$key])) {
            $integrations = $this->getAllIntegrations($type);

            $integrations = array_filter(
                $integrations,
                fn (IntegrationModel $model) => $model->enabled
            );

            $integrationIds = array_map(
                fn (IntegrationModel $model) => $model->id,
                $integrations
            );

            $query = FormIntegrationRecord::find()
                ->where(['formId' => $form?->getId() ?? null])
                ->andWhere(['IN', 'integrationId', $integrationIds])
                ->indexBy('integrationId')
            ;

            /** @var FormIntegrationRecord[] $formIntegrationRecords */
            $formIntegrationRecords = $query->all();

            foreach ($integrations as $integration) {
                $metadata = [];
                $formIntegration = $formIntegrationRecords[$integration->id] ?? null;
                if ($formIntegration) {
                    $metadata = json_decode($formIntegration->metadata ?? '{}', true);
                    $enabled = $formIntegration->enabled;
                }

                if (!$formIntegration) {
                    if (isset($integration->metadata['enabledByDefault'])) {
                        $enabled = (bool) $integration->metadata['enabledByDefault'];
                    } else {
                        $enabled = false;
                    }
                }

                $integration->enabled = $enabled;
                $integration->metadata = array_merge(
                    $integration->metadata,
                    $metadata
                );
            }

            $cache[$key] = array_map(
                fn (IntegrationModel $record) => $record->getIntegrationObject(),
                $integrations
            );
        }

        return $cache[$key];
    }

    protected function getQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'integration.id',
                    'integration.enabled',
                    'integration.name',
                    'integration.handle',
                    'integration.type',
                    'integration.class',
                    'integration.metadata',
                ]
            )
            ->from(IntegrationRecord::TABLE.' integration')
            ->orderBy(['id' => \SORT_ASC])
        ;
    }

    protected function createIntegrationModel(array $data): IntegrationModel
    {
        return new IntegrationModel($data);
    }
}
