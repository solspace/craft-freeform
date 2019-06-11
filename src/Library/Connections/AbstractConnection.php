<?php

namespace Solspace\Freeform\Library\Connections;

use craft\base\Element;
use Solspace\Commons\Configurations\BaseConfiguration;
use Solspace\Freeform\Events\Connections\ConnectEvent;
use Solspace\Freeform\Events\Connections\ValidateEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;
use Solspace\Freeform\Library\Exceptions\Connections\ConnectionException;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use yii\base\Event;

abstract class AbstractConnection extends BaseConfiguration implements ConnectionInterface
{
    const EVENT_BEFORE_VALIDATE = 'beforeValidate';
    const EVENT_AFTER_VALIDATE = 'afterValidate';
    const EVENT_BEFORE_CONNECT = 'beforeConnect';
    const EVENT_AFTER_CONNECT = 'afterConnect';

    /** @var Form */
    protected $form;

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
     * @param Form $form
     * @param array $transformers
     *
     * @return ConnectionResult
     */
    public function validate(Form $form, array $transformers): ConnectionResult
    {
        $result = new ConnectionResult();

        $element = $this->buildElement($transformers);

        $event = new ValidateEvent($form, $this, $element, $transformers);
        Event::trigger($this, self::EVENT_BEFORE_VALIDATE, $event);

        if (!$event->isValid) {
            return $result;
        }

        $this->beforeValidate($element, $transformers);
        $element->validate();

        Event::trigger($this, self::EVENT_AFTER_VALIDATE, $event);
        if (!$event->isValid) {
            return $result;
        }

        $this->attachErrors($result, $element);

        return $result;
    }

    /**
     * @param Form $form
     * @param array $transformers
     *
     * @return ConnectionResult
     * @throws \Throwable
     * @throws \craft\errors\ElementNotFoundException
     * @throws \yii\base\Exception
     */
    public function connect(Form $form, array $transformers): ConnectionResult
    {
        $result = $this->validate($form, $transformers);
        if ($result->isSuccessful()) {
            $element = $this->buildElement($transformers);
            $this->beforeConnect($element, $result, $transformers);

            $event = new ConnectEvent($form, $this, $element);
            Event::trigger($this, self::EVENT_BEFORE_CONNECT, $event);

            if (!$event->isValid) {
                return $result;
            }

            if (!\Craft::$app->elements->saveElement($element)) {
                $this->attachErrors($result, $element);
            } else {
                $this->afterConnect($element, $result, $transformers);
                Event::trigger($this, self::EVENT_AFTER_CONNECT, $event);
            }
        }

        return $result;
    }

    /**
     * @param Element $element
     * @param array   $transformers
     */
    protected function beforeValidate(Element $element, array $transformers)
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
     * @param array            $transformers
     */
    protected function beforeConnect(Element $element, ConnectionResult $result, array $transformers)
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
