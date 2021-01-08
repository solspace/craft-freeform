<?php

namespace Solspace\Freeform\Library\Connections;

use craft\base\Element;
use craft\base\ElementInterface;
use craft\fields\BaseRelationField;
use craft\models\FieldLayout;
use Solspace\Commons\Configurations\BaseConfiguration;
use Solspace\Freeform\Events\Connections\ConnectEvent;
use Solspace\Freeform\Events\Connections\ValidateEvent;
use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Connections\Transformers\TransformerInterface;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;
use Solspace\Freeform\Library\Exceptions\Connections\ConnectionException;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Services\MailerService;
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
     * @throws ConnectionException
     * @throws \ReflectionException
     * @throws \Solspace\Commons\Exceptions\Configurations\ConfigurationException
     *
     * @return ConnectionInterface
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

    public function getType(): string
    {
        return $this->castToString($this->type);
    }

    public function getMapping(): array
    {
        return $this->castToArray($this->mapping, false);
    }

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

            if (!\Craft::$app->elements->saveElement($element, true, true, true)) {
                $this->attachErrors($result, $element);
            } else {
                $this->afterConnect($element, $result, $transformers);
                Event::trigger($this, self::EVENT_AFTER_CONNECT, $event);
                Event::on(
                    MailerService::class,
                    MailerService::EVENT_BEFORE_RENDER,
                    function (RenderEmailEvent $event) use ($element) {
                        $value = $event->getFieldValue('element');
                        if (null === $value) {
                            $value = $element;
                        } elseif (\is_array($value)) {
                            $value[] = $element;
                        } else {
                            $value = [$value, $element];
                        }

                        $event->setFieldValue('element', $value);
                    }
                );
            }
        }

        return $result;
    }

    /**
     * Return a list of field handles that should have their errors suppressed for
     * e.g. - title, slug, description, etc.
     */
    protected static function getSuppressableErrorFieldHandles(): array
    {
        return [];
    }

    protected function beforeValidate(Element $element, array $transformers)
    {
    }

    protected function afterConnect(Element $element, ConnectionResult $result, array $keyValuePairs)
    {
    }

    protected function beforeConnect(Element $element, ConnectionResult $result, array $transformers)
    {
    }

    protected function attachErrors(ConnectionResult $result, Element $element)
    {
        $reflectionClass = new \ReflectionClass($this);

        $errors = $element->getErrors();
        foreach ($errors as $field => $fieldErrors) {
            if (\in_array($field, static::getSuppressableErrorFieldHandles(), true)) {
                Freeform::getInstance()->logger
                    ->getLogger(FreeformLogger::ELEMENT_CONNECTION)
                    ->error(implode(', ', $fieldErrors), ['connection' => $reflectionClass->getShortName()])
                ;

                continue;
            }

            if (isset($this->getMapping()[$field])) {
                foreach ($fieldErrors as $error) {
                    $result->addFieldError($this->getMapping()[$field], $error);
                }
            } else {
                $result->addFormErrors($fieldErrors);
            }
        }
    }

    /**
     * @param TransformerInterface[] $transformers
     */
    protected function applyRelations(ElementInterface $element, array $transformers)
    {
        $fieldLayout = $element->getFieldLayout();
        if (null === $fieldLayout) {
            $fieldLayout = new FieldLayout();
        }

        foreach ($transformers as $transformer) {
            $field = $fieldLayout->getFieldByHandle($transformer->getCraftFieldHandle());

            if ($field instanceof BaseRelationField) {
                $value = $transformer->transformValueFor($field);
                \Craft::$app->relations->saveRelations($field, $element, $value);
            }
        }
    }

    abstract protected function buildElement(array $keyValueMap): Element;
}
