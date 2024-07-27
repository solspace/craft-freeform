<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\FileHelper;
use yii\base\Event;

class CollectScriptsEvent extends Event
{
    private const ELEMENT_SCRIPT = 'script';
    private const ELEMENT_STYLE = 'style';

    private array $chunks = [];

    public function __construct(private array $manifest)
    {
        parent::__construct();
    }

    public function getHtml(): string
    {
        return implode("\r\n", $this->chunks);
    }

    public function addScript(array|string $key, string $filePath, ?array $attributes = null): self
    {
        return $this->addLoadableElement($key, $filePath, attributes: $attributes);
    }

    public function addStylesheet(array|string $key, string $filePath, ?array $attributes = null): self
    {
        return $this->addLoadableElement($key, $filePath, self::ELEMENT_STYLE, $attributes);
    }

    private function addLoadableElement(
        array|string $key,
        ?string $filePath = null,
        string $type = self::ELEMENT_SCRIPT,
        ?array $attributes = null,
    ): self {
        if (!\is_array($key)) {
            $key = [$key];
        }

        if (empty(array_intersect($key, $this->manifest))) {
            return $this;
        }

        $isAbsolute = FileHelper::isAbsolute($filePath);
        if ($isAbsolute) {
            $fullPath = $filePath;
        } else {
            $fullPath = \Craft::getAlias('@freeform/Resources/'.$filePath);
        }

        if ($isAbsolute) {
            $url = \Craft::$app->assetManager->getPublishedUrl($fullPath, true);
        } else {
            $url = \Craft::$app->assetManager->getPublishedUrl('@freeform-resources', true, $filePath);
        }

        $attributes = new Attributes($attributes ?? []);
        if (self::ELEMENT_SCRIPT === $type) {
            $chunk = "<script src=\"{$url}\"{$attributes}></script>";
        } else {
            $chunk = "<link rel=\"stylesheet\" href=\"{$url}\"{$attributes}>";
        }

        $this->chunks[] = $chunk;

        return $this;
    }
}
