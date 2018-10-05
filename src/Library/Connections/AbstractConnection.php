<?php

namespace Solspace\Freeform\Library\Connections;

use craft\base\Element;
use Solspace\Commons\Configurations\BaseConfiguration;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;
use Solspace\Freeform\Library\Exceptions\Connections\ConnectionException;
use Solspace\Freeform\Library\Logging\FreeformLogger;

abstract class AbstractConnection extends BaseConfiguration implements ConnectionInterface
{
    /** @var string */
    protected $type;

    /** @var array */
    protected $mapping;

    /**
     * @param array $configuration
     *
     * @return ConnectionInterface
     * @throws ConnectionException
     * @throws \ReflectionException
     * @throws \Solspace\Commons\Exceptions\Configurations\ConfigurationException
     */
    public static function create(array $configuration)
    {
        if (!isset($configuration['type'])) {
            throw new ConnectionException(Freeform::t('Connection type not found'));
        }

        switch ($configuration['type']) {
            case 'entries':
                return new Entries($configuration);

            case 'users':
                return new Users($configuration);

            default:
                throw new ConnectionException(Freeform::t('Invalid type "{{type}}" supplied.', ['type' => $configuration['type']]));
        }
    }

    /**
     * Return a list of field handles that should have their errors suppressed for
     * e.g. - title, slug, description, etc
     *
     * @return array
     */
    protected static function getSuppressableErrorFieldHandles(): array
    {
        return [];
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this->castToString($this->type);
    }

    /**
     * @return array
     */
    public function getMapping(): array
    {
        return $this->castToArray($this->mapping, false);
    }


    /**
     * @param array $keyValuePairs
     *
     * @return ConnectionResult
     */
    public function validate(array $keyValuePairs): ConnectionResult
    {
        $result = new ConnectionResult();

        $element = $this->buildElement($keyValuePairs);

        $this->beforeValidate($element, $keyValuePairs);
        $element->validate();

        $this->attachErrors($result, $element);

        return $result;
    }

    /**
     * @param array $keyValuePairs
     *
     * @return ConnectionResult
     * @throws \Throwable
     * @throws \craft\errors\ElementNotFoundException
     * @throws \yii\base\Exception
     */
    public function connect(array $keyValuePairs): ConnectionResult
    {
        $result = $this->validate($keyValuePairs);
        if ($result->isSuccessful()) {
            $element = $this->buildElement($keyValuePairs);
            $this->beforeConnect($element, $result, $keyValuePairs);
            if (!\Craft::$app->elements->saveElement($element)) {
                $this->attachErrors($result, $element);
            } else {
                $this->afterConnect($element, $result, $keyValuePairs);
            }
        }

        return $result;
    }

    /**
     * @param Element $element
     * @param array   $keyValuePairs
     */
    protected function beforeValidate(Element $element, array $keyValuePairs)
    {
    }

    /**
     * @param Element          $element
     * @param ConnectionResult $result
     * @param array            $keyValuePairs
     */
    protected function afterConnect(Element $element, ConnectionResult $result, array $keyValuePairs)
    {
    }

    /**
     * @param Element          $element
     * @param ConnectionResult $result
     * @param array            $keyValuePairs
     */
    protected function beforeConnect(Element $element, ConnectionResult $result, array $keyValuePairs)
    {
    }

    /**
     * @param ConnectionResult $result
     * @param Element          $element
     */
    protected function attachErrors(ConnectionResult $result, Element $element)
    {
        $reflectionClass = new \ReflectionClass($this);

        $errors = $element->getErrors();
        foreach ($errors as $field => $fieldErrors) {
            if (\in_array($field, static::getSuppressableErrorFieldHandles(), true)) {
                Freeform::getInstance()->logger
                    ->getLogger(FreeformLogger::ELEMENT_CONNECTION)
                    ->error(implode(', ', $fieldErrors), ['connection' => $reflectionClass->getShortName()]);

                continue;
            }

            if (\array_key_exists($field, $this->getMapping())) {
                foreach ($fieldErrors as $error) {
                    $result->addFieldError($this->getMapping()[$field], $error);
                }
            } else {
                $result->addFormErrors($fieldErrors);
            }
        }
    }

    /**
     * @param array $keyValueMap
     *
     * @return Element
     */
    abstract protected function buildElement(array $keyValueMap): Element;
}
