<?php

namespace Solspace\Freeform\Library\Connections;

use craft\base\Element;
use craft\base\ElementInterface;
use craft\models\FieldLayout;
use Solspace\Calendar\Elements\Event;
use Solspace\Freeform\Library\Connections\Transformers\AbstractFieldTransformer;
use Solspace\Freeform\Library\Connections\Transformers\TransformerInterface;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;

class CalendarEvents extends AbstractConnection
{
    /** @var int */
    protected $calendar;

    /** @var bool */
    protected $disabled;

    /** @var bool */
    protected $allDay;

    /**
     * {@inheritDoc}
     */
    public function isConnectable(): bool
    {
        return null !== $this->getCalendar();
    }

    /**
     * @return null|int
     */
    public function getCalendar()
    {
        return $this->castToInt($this->calendar);
    }

    /**
     * @return null|bool
     */
    public function isDisabled()
    {
        return $this->castToBool($this->disabled);
    }

    /**
     * @return null|bool
     */
    public function isAllDay()
    {
        return $this->castToBool($this->allDay);
    }

    protected static function getSuppressableErrorFieldHandles(): array
    {
        return [];
    }

    /**
     * @param TransformerInterface[] $transformers
     */
    protected function buildElement(array $transformers, ElementInterface $element = null): Element
    {
        if ($element instanceof Event) {
            $event = $element;
        } else {
            $event = new Event([
                'calendarId' => $this->getCalendar(),
            ]);
        }

        $fieldLayout = $event->getFieldLayout();
        if (null === $fieldLayout) {
            $fieldLayout = new FieldLayout();
        }

        foreach ($transformers as $transformer) {
            $field = $fieldLayout->getFieldByHandle($transformer->getCraftFieldHandle());

            $event->{$transformer->getCraftFieldHandle()} = $transformer->transformValueFor($field);
        }

        $currentSiteId = \Craft::$app->sites->currentSite->id;

        $event->siteId = $currentSiteId;
        $event->allDay = $this->isAllDay();
        $event->enabled = !$this->isDisabled();

        return $event;
    }

    /**
     * @param Element|Event $element
     */
    protected function beforeValidate(Element $element, array $transformers)
    {
        $calendar = $element->getCalendar();
        if (!$calendar->hasTitleField && !$element->title) {
            // If no title is present - generate one to remove errors
            $element->title = sha1(uniqid('', true).time());
        }
    }

    protected function beforeConnect(Element $element, ConnectionResult $result, array $transformers)
    {
    }

    /**
     * @param AbstractFieldTransformer[] $keyValuePairs
     */
    protected function afterConnect(Element $element, ConnectionResult $result, array $keyValuePairs)
    {
        $this->applyRelations($element, $keyValuePairs);
    }
}
