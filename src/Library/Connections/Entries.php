<?php

namespace Solspace\Freeform\Library\Connections;

use craft\base\Element;
use craft\elements\Entry;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;

class Entries extends AbstractConnection
{
    /** @var int */
    protected $section;

    /** @var int */
    protected $entryType;

    /** @var bool */
    protected $disabled = false;

    /**
     * @return array
     */
    protected static function getSuppressableErrorFieldHandles(): array
    {
        return ['slug'];
    }

    /**
     * @return int
     */
    public function getSection(): int
    {
        return $this->castToInt($this->section);
    }

    /**
     * @return int
     */
    public function getEntryType(): int
    {
        return $this->castToInt($this->entryType);
    }

    /**
     * @return bool
     */
    public function isDisabled(): bool
    {
        return $this->castToBool($this->disabled, false);
    }

    /**
     * @param array $keyValuePairs
     *
     * @return Element
     */
    protected function buildElement(array $keyValuePairs): Element
    {
        $entry = new Entry([
            'sectionId' => $this->getSection(),
            'typeId'    => $this->getEntryType(),
        ]);

        foreach ($keyValuePairs as $key => $value) {
            $entry->{$key} = $value;
        }

        if (!$entry->slug) {
            $entry->slug = $entry->title;
        }

        $entry->siteId  = \Craft::$app->sites->currentSite->id;
        $entry->enabled = !$this->isDisabled();

        return $entry;
    }

    /**
     * @param Element|Entry $element
     * @param array         $keyValuePairs
     */
    protected function beforeValidate(Element $element, array $keyValuePairs)
    {
        $type = $element->getType();

        if (!$type->hasTitleField && !$element->title) {
            // If no title is present - generate one to remove errors
            $element->title = sha1(uniqid('', true) . time());
            $element->slug  = $element->title;
        }
    }

    protected function beforeConnect(Element $element, ConnectionResult $result, array $keyValuePairs)
    {
    }
}
