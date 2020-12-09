<?php

namespace Solspace\Freeform\Events\Freeform;

use Solspace\Freeform\Events\ArrayableEvent;

class RegisterSettingsNavigationEvent extends ArrayableEvent
{
    /** @var array */
    private $navigation;

    /**
     * NavigationEvent constructor.
     */
    public function __construct(array $navigation)
    {
        $this->navigation = $navigation;

        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['navigation'];
    }

    public function getNavigation(): array
    {
        return $this->navigation;
    }

    public function addNavigationItem(string $handle, string $title, string $afterHandle = null): self
    {
        $item = ['title' => $title];

        if (null !== $afterHandle && isset($this->navigation[$afterHandle])) {
            $modifiedArray = [];
            foreach ($this->navigation as $key => $value) {
                $modifiedArray[$key] = $value;
                if ($key === $afterHandle) {
                    $modifiedArray[$handle] = $item;
                }
            }

            $this->navigation = $modifiedArray;
        } else {
            $this->navigation[$handle] = $item;
        }

        return $this;
    }
}
