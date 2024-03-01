<?php

namespace Solspace\Freeform\Events\Freeform;

use yii\base\Event;

class RegisterCpSubnavItemsEvent extends Event
{
    public function __construct(
        private array $nav,
        private array $subNavItems,
    ) {
        parent::__construct();
    }

    public function addToNav(string $handle, $value): self
    {
        $this->nav[$handle] = $value;

        return $this;
    }

    public function addSubnavItem(string $handle, string $label, string $url, string $afterHandle = null, ?array $extraOptions = null): self
    {
        $item = [
            'label' => $label,
            'url' => $url,
        ];

        if (null !== $extraOptions) {
            $item = array_merge($item, $extraOptions);
        }

        if (null !== $afterHandle && isset($this->subnavItems[$afterHandle])) {
            $modifiedArray = [];
            foreach ($this->subnavItems as $key => $value) {
                $modifiedArray[$key] = $value;
                if ($key === $afterHandle) {
                    $modifiedArray[$handle] = $item;
                }
            }

            $this->subNavItems = $modifiedArray;
        } else {
            $this->subNavItems[$handle] = $item;
        }

        return $this;
    }

    public function getNav(): array
    {
        return $this->nav;
    }

    public function getSubnavItems(): array
    {
        return $this->subNavItems;
    }
}
