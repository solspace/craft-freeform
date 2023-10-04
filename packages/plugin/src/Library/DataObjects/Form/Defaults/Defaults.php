<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults;

use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\CategoryInterface;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Notifications\Notifications;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\Settings;

class Defaults implements \IteratorAggregate, \JsonSerializable
{
    public bool $previewHtml = false;
    public bool $twigInHtml = false;
    public bool $twigIsolation = true;
    public bool $includeSampleTemplates = true;

    public Notifications $notifications;
    public Settings $settings;

    public function __construct(array $config = [])
    {
        $this->previewHtml = (bool) ($config['previewHtml'] ?? true);
        $this->twigInHtml = (bool) ($config['twigInHtml'] ?? true);
        $this->twigIsolation = (bool) ($config['twigIsolation'] ?? true);
        $this->includeSampleTemplates = (bool) ($config['includeSampleTemplates'] ?? true);

        $this->notifications = new Notifications($config['notifications'] ?? []);
        $this->settings = new Settings($config['settings'] ?? []);
    }

    public function getIterator(): \ArrayIterator
    {
        $reflection = new \ReflectionClass($this);
        $properties = $reflection->getProperties();

        $categories = [];
        foreach ($properties as $property) {
            if ($property->getType()->isBuiltin()) {
                continue;
            }

            if (!is_a($property->getType()->getName(), CategoryInterface::class, true)) {
                continue;
            }

            $categories[$property->getName()] = $property->getValue($this);
        }

        return new \ArrayIterator($categories);
    }

    public function jsonSerialize(): array
    {
        return [
            'previewHtml' => $this->previewHtml,
            'twigInHtml' => $this->twigInHtml,
            'twigIsolation' => $this->twigIsolation,
            'includeSampleTemplates' => $this->includeSampleTemplates,
            'notifications' => $this->notifications->jsonSerialize(),
            'settings' => $this->settings->jsonSerialize(),
        ];
    }
}
