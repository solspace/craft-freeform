<?php

namespace Solspace\Freeform\Events\Freeform;

use Solspace\Freeform\Events\ArrayableEvent;

class RegisterCpSubnavItemsEvent extends ArrayableEvent
{
    /** @var array */
    private $subnavItems;

    /**
     * CpNavEvent constructor.
     */
    public function __construct(array $subnavItems)
    {
        $this->subnavItems = $subnavItems;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['subnavItems'];
    }

    /**
     * @return $this
     */
    public function addSubnavItem(string $handle, string $label, string $url, string $afterHandle = null)
    {
        $item = [
            'label' => $label,
            'url' => $url,
        ];

        if (null !== $afterHandle && isset($this->subnavItems[$afterHandle])) {
            $modifiedArray = [];
            foreach ($this->subnavItems as $key => $value) {
                $modifiedArray[$key] = $value;
                if ($key === $afterHandle) {
                    $modifiedArray[$handle] = $item;
                }
            }

            $this->subnavItems = $modifiedArray;
        } else {
            $this->subnavItems[$handle] = $item;
        }

        return $this;
    }

    public function getSubnavItems(): array
    {
        return $this->subnavItems;
    }
}
