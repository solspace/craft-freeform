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

namespace Solspace\Freeform\Library\Integrations;

use craft\helpers\App;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Pro\DatetimeField;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Database\IntegrationHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

abstract class AbstractIntegration implements IntegrationInterface
{
    public function __construct(
        private ?int $id,
        private string $handle,
        private string $name,
        private \DateTime $lastUpdate,
        array $properties,
        private LoggerInterface $logger,
        private TranslatorInterface $translator,
        private IntegrationHandlerInterface $handler,
        private PropertyProvider $propertyProvider,
    ) {
        $this->processProperties($properties);
    }

    /**
     * Check if it's possible to connect to the API.
     *
     * @throws IntegrationException
     */
    abstract public function checkConnection(): bool;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getLastUpdate(): \DateTime
    {
        return $this->lastUpdate;
    }

    /**
     * Returns the MailingList service provider short name
     * i.e. - MailChimp, Constant Contact, etc...
     */
    public function getServiceProvider(): string
    {
        return (new \ReflectionClass($this))->getShortName();
    }

    /**
     * A method that initiates the authentication.
     */
    abstract public function initiateAuthentication();

    /**
     * Perform anything necessary before this integration is saved.
     */
    public function onBeforeSave()
    {
    }

    /**
     * @return array|bool|string
     */
    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field)
    {
        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = $field->getValue();
        } else {
            $value = $field->getValueAsString(false);
        }

        switch ($fieldObject->getType()) {
            case FieldObject::TYPE_NUMERIC:
                return (int) preg_replace('/\D/', '', $value) ?: '';

            case FieldObject::TYPE_FLOAT:
                return (float) preg_replace('/[^0-9,.]/', '', $value) ?: '';

            case FieldObject::TYPE_DATE:
                if ($field instanceof DatetimeField) {
                    $carbon = $field->getCarbon();
                    if ($carbon) {
                        return $carbon->toDateString();
                    }
                }

                return (string) $value;

            case FieldObject::TYPE_DATETIME:
                if ($field instanceof DatetimeField) {
                    $carbon = $field->getCarbon();
                    if ($carbon) {
                        return $carbon->toAtomString();
                    }
                }

                return (string) $value;

            case FieldObject::TYPE_TIMESTAMP:
            case FieldObject::TYPE_MICROTIME:
                if ($field instanceof DatetimeField) {
                    $carbon = $field->getCarbonUtc();
                    if ($carbon) {
                        if (DatetimeField::DATETIME_TYPE_DATE === $field->getDateTimeType()) {
                            $carbon->setTime(0, 0);
                        }

                        $timestamp = $carbon->getTimestamp();
                        if (FieldObject::TYPE_MICROTIME === $fieldObject->getType()) {
                            $timestamp *= 1000;
                        }

                        return $timestamp;
                    }
                }

                return (int) $value;

            case FieldObject::TYPE_BOOLEAN:
                return (bool) $value;

            case FieldObject::TYPE_ARRAY:
                if (!\is_array($value)) {
                    $value = [$value];
                }

                return $value;

            case FieldObject::TYPE_STRING:
            default:
                return (string) $value;
        }
    }

    protected function getHandler(): IntegrationHandlerInterface
    {
        return $this->handler;
    }

    protected function getLogger(): LoggerInterface
    {
        return $this->logger;
    }

    protected function getTranslator(): TranslatorInterface
    {
        return $this->translator;
    }

    protected function getProcessedValue(mixed $value): bool|string|null
    {
        return App::parseEnv($value);
    }

    abstract protected function getApiRootUrl(): string;

    /**
     * Returns a combined URL of api root + endpoint.
     */
    final protected function getEndpoint(string $endpoint): string
    {
        $root = rtrim($this->getApiRootUrl(), '/');
        $endpoint = ltrim($endpoint, '/');

        return "{$root}/{$endpoint}";
    }

    private function processProperties(array $properties = []): void
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        $classProperties = $this->propertyProvider->getEditableProperties(static::class);
        foreach ($classProperties as $property) {
            $handle = $property->handle;
            if (!\array_key_exists($handle, $properties)) {
                continue;
            }

            $value = $properties[$handle];
            if ($property->hasFlag(self::FLAG_ENCRYPTED)) {
                $value = \Craft::$app->security->decryptByKey(base64_decode($value), $securityKey);
            }

            $this->{$handle} = $value;
        }
    }
}
