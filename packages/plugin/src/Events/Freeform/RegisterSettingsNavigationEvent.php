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

    public function fields(): array
    {
        return ['navigation'];
    }

    public function getNavigation(): array
    {
        return $this->navigation;
    }

    public function addHeader(string $handle, string $title, ?string $afterHandle = null): self
    {
        $item = ['heading' => $title];

        $this->insertItem($handle, $item, $afterHandle);

        return $this;
    }

    public function addNavigationItem(string $handle, string $title, ?string $afterHandle = null): self
    {
        $item = ['title' => $title];

        $this->insertItem($handle, $item, $afterHandle);

        return $this;
    }

    private function insertItem(string $handle, array $item, ?string $afterHandle = null)
    {
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
    }
}
