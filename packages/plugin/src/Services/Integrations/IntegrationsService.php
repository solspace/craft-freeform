<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services\Integrations;

use craft\db\Query;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\Bundles\Rules\Types\IntegrationRuleValidator;
use Solspace\Freeform\Events\Integrations\DeleteEvent;
use Solspace\Freeform\Events\Integrations\FailedRequestEvent;
use Solspace\Freeform\Events\Integrations\ProcessPostedValuesEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Events\Integrations\SaveEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\SolspaceAI\BaseSolspaceAIIntegration;
use Solspace\Freeform\Jobs\FormJobInterface;
use Solspace\Freeform\Library\Cache\Memo;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\SecurityHelper;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\PushableInterface;
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

    private const PREFIX_ID = 'id';
    private const PREFIX_UID = 'uid';
    private const PREFIX_HANDLE = 'handle';

    private Memo $cache;

    private ?array $installedIntegrationClassMap = null;
    private ?array $enabledIntegrationTypeMap = null;

    public function __construct(
        $config,
        protected IntegrationClientProvider $clientProvider,
        protected IntegrationTypeProvider $typeProvider,
        protected IntegrationLoggerProvider $loggerProvider,
        private PropertyProvider $propertyProvider,
        private IntegrationRuleValidator $integrationRuleValidator,
    ) {
        parent::__construct($config);

        $this->cache = new Memo();
    }

    public function isIntegrationInstalled(string $integrationClass): bool
    {
        if (null === $this->installedIntegrationClassMap) {
            $classes = IntegrationRecord::find()
                ->select(['class'])
                ->column()
            ;

            $this->installedIntegrationClassMap = array_fill_keys($classes, true);
        }

        return isset($this->installedIntegrationClassMap[$integrationClass]);
    }

    public function isIntegrationTypeEnabled(string $type): bool
    {
        if (null === $this->enabledIntegrationTypeMap) {
            $types = IntegrationRecord::find()
                ->select(['type'])
                ->where(['enabled' => true])
                ->distinct()
                ->column()
            ;

            $this->enabledIntegrationTypeMap = array_fill_keys($types, true);
        }

        return isset($this->enabledIntegrationTypeMap[$type]);
    }

    /**
     * @return Type[]
     */
    public function getAllIntegrationTypes(): array
    {
        return $this->cache->getOrSet(
            'types',
            static function () {
                $event = new RegisterIntegrationTypesEvent();
                Event::trigger(self::class, self::EVENT_REGISTER_INTEGRATION_TYPES, $event);

                $types = $event->getTypes();
                usort($types, static fn (Type $a, Type $b) => strcmp($a->name, $b->name));

                return $types;
            }
        );
    }

    /**
     * @return Type[]
     */
    public function getAllServiceProviders(?string $isOfType = null): array
    {
        $providers = $this->cache->getOrSet(
            'providers',
            function () {
                $types = $this->getIntegrationsService()->getAllIntegrationTypes();

                $providers = [];
                foreach ($types as $type) {
                    $type->properties = $this->propertyProvider->getEditableProperties($type->class);

                    $providers[$type->class] = $type;
                }

                return $providers;
            }
        );

        if ($isOfType) {
            return array_filter($providers, static fn (Type $type) => $type->type === $isOfType);
        }

        return $providers;
    }

    /**
     * @return IntegrationModel[]
     */
    public function getAllIntegrations(?string $type = null): array
    {
        $this->getAllIntegrationTypes();

        $integrations = $this->cache->getOrSet(
            'all',
            function () {
                $results = $this->getQuery()->all();

                $models = [];
                foreach ($results as $result) {
                    $model = $this->createIntegrationModel($result);

                    try {
                        $model->getIntegrationObject();
                        $models[] = $model;
                    } catch (IntegrationNotFoundException $e) {
                    }
                }

                return $models;
            }
        );

        if ($type) {
            return array_filter($integrations, static fn (IntegrationModel $model) => $model->type === $type);
        }

        return $integrations;
    }

    public function getById(int $id): ?IntegrationModel
    {
        return $this->cache->getOrSet(
            $id,
            function () use ($id) {
                $integrations = $this->getAllIntegrations();

                foreach ($integrations as $integration) {
                    if ($integration->id === $id) {
                        $this->cacheIntegrationModel($integration);

                        return $integration;
                    }
                }

                return null;
            },
            self::PREFIX_ID,
        );
    }

    public function getByUid(string $uid): ?IntegrationModel
    {
        return $this->cache->getOrSet(
            $uid,
            function () use ($uid) {
                $integrations = $this->getAllIntegrations();

                foreach ($integrations as $integration) {
                    if ($integration->uid === $uid) {
                        $this->cacheIntegrationModel($integration);

                        return $integration;
                    }
                }

                return null;
            },
            self::PREFIX_UID,
        );
    }

    public function getByHandle(string $handle): ?IntegrationModel
    {
        return $this->cache->getOrSet(
            $handle,
            function () use ($handle) {
                $integrations = $this->getAllIntegrations();

                foreach ($integrations as $integration) {
                    if ($integration->handle === $handle) {
                        $this->cacheIntegrationModel($integration);

                        return $integration;
                    }
                }

                return null;
            },
            self::PREFIX_HANDLE,
        );
    }

    public function getIntegrationObjectById(int $id): IntegrationInterface
    {
        $model = $this->getById($id);
        if ($model) {
            return $model->getIntegrationObject();
        }

        throw new IntegrationException(
            Freeform::t('Integration with ID {id} not found', ['id' => $id])
        );
    }

    public function getIntegrationObjectByUid(string $uid): IntegrationInterface
    {
        $model = $this->getByUid($uid);
        if ($model) {
            return $model->getIntegrationObject();
        }

        throw new IntegrationException(
            Freeform::t('Integration with UID {uid} not found', ['uid' => $uid])
        );
    }

    public function getFirstEnabledSolspaceAIIntegration(): ?IntegrationModel
    {
        $models = $this->getAllIntegrations(Type::TYPE_AI);
        foreach ($models as $model) {
            if (!$model->enabled) {
                continue;
            }

            try {
                $integration = $model->getIntegrationObject();
            } catch (IntegrationNotFoundException) {
                continue;
            }
            if (!$integration instanceof BaseSolspaceAIIntegration) {
                continue;
            }
            if ($model->connectionEstablished || '' !== $integration->getApiKey()) {
                return $model;
            }
        }

        return null;
    }

    public function setConnectionEstablished(IntegrationInterface $integration): void
    {
        $record = IntegrationRecord::findOne(['id' => $integration->getId()]);
        if (!$record) {
            return;
        }

        $record->connectionEstablished = true;
        $record->save();
    }

    public function save(IntegrationModel $model, IntegrationInterface $integration, bool $triggerEvents = false): bool
    {
        try {
            $integration->onBeforeSave();
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        $isNew = !$model->id;

        if ($isNew && $integration instanceof BaseSolspaceAIIntegration) {
            $existingAiIntegrations = $this->getAllIntegrations(Type::TYPE_AI);
            foreach ($existingAiIntegrations as $existingModel) {
                try {
                    $existingIntegration = $existingModel->getIntegrationObject();
                } catch (IntegrationNotFoundException) {
                    continue;
                }

                if ($existingIntegration instanceof BaseSolspaceAIIntegration) {
                    $model->addError(
                        'integration',
                        Freeform::t('Only one SolspaceAI integration is allowed.')
                    );

                    return false;
                }
            }
        }

        $beforeSaveEvent = new SaveEvent($model, $integration, $isNew);
        if ($triggerEvents) {
            $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);
        }

        $this->updateModelFromIntegration($model, $integration);

        if ($isNew) {
            $record = new IntegrationRecord();
        } else {
            $record = IntegrationRecord::findOne(['id' => $model->id]);

            if (!$record) {
                throw new IntegrationException(
                    Freeform::t('Integration with ID {id} not found', ['id' => $model->id])
                );
            }
        }

        $record->enabled = $model->enabled;
        $record->legacy = $model->legacy;
        $record->connectionEstablished = $model->connectionEstablished;
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

                $model->uid = $record->uid;

                if ($isNew) {
                    $model->id = $record->id;
                    $model->uid = $record->uid;
                    $integration->setId($record->id);
                }

                $transaction?->commit();

                if ($triggerEvents) {
                    $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($model, $integration, $isNew));
                }

                $this->cacheIntegrationModel($model);

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

            $this->clearIntegrationModelCache();

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            $transaction?->rollBack();

            throw $exception;
        }
    }

    public function decryptModelValues(IntegrationModel $model): void
    {
        if (!$model->class) {
            return;
        }

        $properties = $this->propertyProvider->getEditableProperties($model->class, $model);
        foreach ($properties as $property) {
            if (!$property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
                continue;
            }

            $value = $model->metadata[$property->handle] ?? null;
            $isEnvVariable = StringHelper::isEnvVariable($value);
            if (!$isEnvVariable && $value) {
                $value = SecurityHelper::decrypt($value);
            }

            $model->metadata[$property->handle] = $value;
        }
    }

    public function parsePostedModelData(IntegrationModel $model, ?array $modifiedValues = null): void
    {
        $editableProperties = $this->propertyProvider->getEditableProperties($model->class);
        foreach ($editableProperties as $property) {
            $handle = $property->handle;
            $value = $model->metadata[$handle] ?? null;

            if (null !== $modifiedValues && !\in_array($handle, $modifiedValues, true)) {
                continue;
            }

            $isEncrypted = $property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED);
            $isEnvVariable = StringHelper::isEnvVariable($value);

            if ($value && $isEncrypted && !$isEnvVariable) {
                $model->metadata[$property->handle] = SecurityHelper::encrypt($value);
            }

            if ($property->hasFlag(IntegrationInterface::FLAG_READONLY)) {
                unset($model->metadata[$property->handle]);
            }
        }
    }

    public function updateModelFromIntegration(IntegrationModel $model, IntegrationInterface $integration): void
    {
        $editableProperties = $this->propertyProvider->getEditableProperties($model->class);
        $reflection = new \ReflectionClass($model->class);
        foreach ($editableProperties as $property) {
            if ($property->hasFlag(IntegrationInterface::FLAG_READONLY, IntegrationInterface::FLAG_INSTANCE_ONLY)) {
                continue;
            }

            $handle = $property->handle;
            $instanceProperty = $reflection->getProperty($handle);

            $accessible = $instanceProperty->isPublic();
            $instanceProperty->setAccessible(true);

            $value = $instanceProperty->getValue($integration);

            $instanceProperty->setAccessible($accessible);

            if (!$value && $property->required && !$property->visibilityFilters) {
                $model->addError(
                    'metadata.'.$handle,
                    Freeform::t('{key} is required', ['key' => $property->label])
                );

                continue;
            }

            $value = $this->processValueForSaving($property, $value);

            $model->metadata[$property->handle] = $value;
        }
    }

    public function processValueForSaving(Property $property, mixed $value): mixed
    {
        if ($property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
            $isEnvVariable = StringHelper::isEnvVariable($value);
            if (!$isEnvVariable) {
                $value = SecurityHelper::encrypt($value);
            }
        }

        if ($property->transformer instanceof TransformerInterface) {
            $value = $property->transformer->reverseTransform($value);
        }

        return $value;
    }

    public function getFirstForForm(
        ?Form $form = null,
        ?string $type = null,
        ?bool $enabled = null,
        ?callable $filter = null
    ): ?IntegrationInterface {
        $integrations = $this->getForForm($form, $type, $enabled, $filter);
        $first = reset($integrations);

        return $first ?: null;
    }

    public function getForForm(
        ?Form $form = null,
        ?string $type = null,
        ?bool $enabled = null,
        ?callable $filter = null
    ): array {
        static $cache;
        if (null === $cache) {
            $cache = [];
        }

        $freeformEdition = Freeform::getInstance()->edition;

        $key = $this->getCacheKey($form, $type, $enabled, $filter);

        if (!isset($cache[$key])) {
            $isClassType = class_exists($type) || interface_exists($type);

            $integrations = $this->getAllIntegrations($isClassType ? null : $type);

            // Only classes that match class type
            if ($isClassType) {
                $integrations = array_filter(
                    $integrations,
                    static fn (IntegrationModel $model) => is_a($model->class, $type, true)
                );
            }

            $integrations = array_filter(
                $integrations,
                static fn (IntegrationModel $model) => $model->enabled
            );

            $integrationIds = array_map(
                static fn (IntegrationModel $model) => $model->id,
                $integrations
            );

            $query = FormIntegrationRecord::find()
                ->where(['formId' => $form?->getId() ?? null])
                ->andWhere(['IN', 'integrationId', $integrationIds])
                ->indexBy('integrationId')
            ;

            /** @var FormIntegrationRecord[] $formIntegrationRecords */
            $formIntegrationRecords = $query->all();

            $integrations = $this->applyFormOverrides($integrations, $formIntegrationRecords);

            $integrationObjects = array_map(
                static fn (IntegrationModel $record) => $record->getIntegrationObject(),
                $integrations
            );

            if (null !== $enabled) {
                $integrationObjects = array_filter(
                    $integrationObjects,
                    static fn (IntegrationInterface $integration) => $integration->isEnabled() === $enabled
                );
            }

            if ($filter) {
                $integrationObjects = array_filter($integrationObjects, $filter);
            }

            $eligibleIntegrationObjects = array_filter(
                $integrationObjects,
                static fn (IntegrationInterface $integration) => $integration->getTypeDefinition()->editionCheck($freeformEdition),
            );

            $cache[$key] = $eligibleIntegrationObjects;
        }

        return $cache[$key];
    }

    /**
     * Applies per-form overrides.
     *
     * Models returned by getAllIntegrations() are cached and shared across every getForForm() call within a request.
     * Cloned each modal before per-form override is applied, so that one form's override (e.g. a disabled captcha)
     * cannot leak into the shared model and affect the resolution of other forms.
     *
     * @param IntegrationModel[]      $integrations
     * @param FormIntegrationRecord[] $formIntegrationRecords indexed by integration id
     *
     * @return IntegrationModel[]
     *
     * @throws \Exception
     */
    public function applyFormOverrides(array $integrations, array $formIntegrationRecords): array
    {
        foreach ($integrations as $key => $integration) {
            $integration = clone $integration;
            $integrations[$key] = $integration;

            $metadata = [];

            $formIntegration = $formIntegrationRecords[$integration->id] ?? null;
            if ($formIntegration) {
                $metadata = JsonHelper::decode($formIntegration->metadata ?? '{}', true);

                $enabledOverride = $formIntegration->enabled;
            }

            if (!$formIntegration) {
                if (isset($integration->metadata['enabledByDefault'])) {
                    $enabledOverride = (bool) $integration->metadata['enabledByDefault'];
                } else {
                    $enabledOverride = false;
                }
            }

            $integration->instanceId = $formIntegration?->id;
            $integration->instanceUid = $formIntegration?->uid ?? StringHelper::UUID();
            $integration->enabled = $enabledOverride;
            $integration->metadata = array_merge(
                $integration->metadata,
                $metadata,
            );
        }

        return $integrations;
    }

    public function processIntegrationJob(int $formId, ?int $submissionId, array $postedData, string $type): void
    {
        $freeform = Freeform::getInstance();
        $edition = $freeform->edition;

        $form = $freeform->forms->getFormById($formId);
        if (!$form) {
            return;
        }

        $submission = $freeform->submissions->getSubmissionById($submissionId);
        if ($submission) {
            if ($submission->isSpam) {
                return;
            }

            $form->setSubmission($submission);
        }

        $event = new ProcessPostedValuesEvent($form, $submission, $postedData);
        Event::trigger(FormJobInterface::class, FormJobInterface::EVENT_PROCESS_POSTED_DATA, $event);

        $form->valuesFromArray($event->getValues());

        /** @var IntegrationInterface[]|PushableInterface $integrations */
        $integrations = $this->getForForm($form, $type, true);
        foreach ($integrations as $integration) {
            if (!$integration instanceof PushableInterface) {
                continue;
            }

            if (!$integration->getTypeDefinition()->editionCheck($edition)) {
                continue;
            }

            if (!$this->integrationRuleValidator->isPassing($integration, $form)) {
                continue;
            }

            $client = $this->clientProvider->getAuthorizedClient($integration);
            $type = $integration->getTypeDefinition();
            $logger = $this->loggerProvider->getLogger($integration);

            try {
                $logger->info('Pushing data to '.$type->shortName, ['form' => $form->getHandle()]);
                $integration->push($form, $client);
            } catch (\Exception $exception) {
                $event = new FailedRequestEvent($form, $integration, $exception);
                Event::trigger(
                    IntegrationInterface::class,
                    IntegrationInterface::EVENT_ON_FAILED_REQUEST,
                    $event,
                );

                if (!$event->isValid) {
                    continue;
                }

                if ($event->isRetry()) {
                    $client = $this->clientProvider->getAuthorizedClient($integration);

                    try {
                        $integration->push($form, $client);
                    } catch (\Exception) {
                    }
                }
            }
        }
    }

    protected function getQuery(?string $type = null): Query
    {
        $query = (new Query())
            ->select(
                [
                    'integration.id',
                    'integration.uid',
                    'integration.enabled',
                    'integration.legacy',
                    'integration.connectionEstablished',
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

        if ($type) {
            $query->andWhere(['type' => $type]);
        }

        return $query;
    }

    protected function createIntegrationModel(array $data): IntegrationModel
    {
        return new IntegrationModel($data);
    }

    private function cacheIntegrationModel(IntegrationModel $model): void
    {
        if (null !== $model->id) {
            $this->cache->set((string) $model->id, $model, self::PREFIX_ID);
        }

        if (null !== $model->uid && '' !== $model->uid) {
            $this->cache->set($model->uid, $model, self::PREFIX_UID);
        }

        if (null !== $model->handle && '' !== $model->handle) {
            $this->cache->set($model->handle, $model, self::PREFIX_HANDLE);
        }
    }

    private function clearIntegrationModelCache(): void
    {
        $this->cache->clear();
    }

    private function getCacheKey(?Form $form, ?string $type, ?bool $enabled, ?callable $filter = null): string
    {
        $formId = $form?->getId() ?? '0';
        $type ??= IntegrationInterface::class;
        $enabled = $enabled ? '1' : '0';
        $filter = $filter ? spl_object_hash((object) $filter) : '0';

        return HashHelper::sha1(
            \sprintf(
                '%s-%s-%s-%s',
                $formId,
                $type,
                $enabled,
                $filter
            )
        );
    }
}
