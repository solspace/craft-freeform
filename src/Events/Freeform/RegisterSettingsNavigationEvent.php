<?php

namespace Solspace\Freeform\Events\Freeform;

use Solspace\Freeform\Events\ArrayableEvent;

class RegisterSettingsNavigationEvent extends ArrayableEvent
{
    /** @var array */
    private $navigation;

    /**
     * NavigationEvent constructor.
     *
     * @param array $navigation
     */
    public function __construct(array $navigation)
    {
        $this->navigation = $navigation;

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['navigation'];
    }

    /**
     * @return array
     */
    public function getNavigation(): array
    {
        return $this->navigation;
    }

    /**
     * @param string      $handle
     * @param string      $title
     * @param string|null $afterHandle
     *
     * @return RegisterSettingsNavigationEvent
     */
    public function addNavigationItem(string $handle, string $title, string $afterHandle = null): RegisterSettingsNavigationEvent
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
