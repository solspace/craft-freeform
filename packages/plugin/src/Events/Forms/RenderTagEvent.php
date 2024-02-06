<?php

namespace Solspace\Freeform\Events\Forms;

use craft\helpers\UrlHelper;
use craft\web\View;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;

class RenderTagEvent extends ArrayableEvent implements FormEventInterface
{
    public const POSITION_BEGINNING = 'beginning';
    public const POSITION_END = 'end';

    private const ELEMENT_SCRIPT = 'script';
    private const ELEMENT_STYLE = 'style';

    /** @var string[] */
    private array $chunks = [];

    public function __construct(private Form $form)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'chunks'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getChunks(): array
    {
        return $this->chunks;
    }

    public function addChunk(string $chunk, array $variables = [], $position = self::POSITION_END): self
    {
        static $isolatedTwig;

        if (!empty($variables)) {
            if (null === $isolatedTwig) {
                $isolatedTwig = new IsolatedTwig();
            }

            $chunk = $isolatedTwig->render($chunk, $variables);
        }

        if (self::POSITION_BEGINNING === $position) {
            array_unshift($this->chunks, $chunk);

            return $this;
        }

        if (is_numeric($position)) {
            array_splice($this->chunks, $position, 0, $chunk);

            return $this;
        }

        $this->chunks[] = $chunk;

        return $this;
    }

    public function addScript(?string $filePath, ?string $url, array $attributes = []): self
    {
        return $this->addLoadableElement($filePath, $url, attributes: $attributes);
    }

    public function addStylesheet(?string $filePath, ?string $url, array $attributes = []): self
    {
        return $this->addLoadableElement($filePath, $url, self::ELEMENT_STYLE, $attributes);
    }

    public function getChunksAsString(): string
    {
        return StringHelper::implodeRecursively("\n", $this->chunks);
    }

    public function isScriptsDisabled(): bool
    {
        return $this->getSettingsService()->isManualScripts();
    }

    public function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }

    private function addLoadableElement(
        ?string $filePath,
        ?string $url,
        string $type = self::ELEMENT_SCRIPT,
        array $attributes = [],
    ): self {
        if ($this->isScriptsDisabled()) {
            return $this;
        }

        $view = \Craft::$app->getView();
        $insertType = $this->getSettingsService()->scriptInsertType();
        $insertLocation = $this->getSettingsService()->getSettingsModel()->scriptInsertLocation;

        // Make a string out of passed attributes
        $attributes = array_map(
            fn ($key, $value) => $key.'="'.$value.'"',
            array_keys($attributes),
            $attributes
        );
        $attributes = $attributes ? ' '.implode(' ', $attributes) : '';

        if (self::ELEMENT_SCRIPT === $type) {
            [$wrapOpen, $wrapClose] = ['<script type="text/javascript"'.$attributes.'>', '</script>'];
            $tag = '<script type="text/javascript" src="%s"'.$attributes.'></script>';
        } else {
            [$wrapOpen, $wrapClose] = ['<style type="text/css"'.$attributes.'>', '</style>'];
            $tag = '<link rel="stylesheet" type="text/css" href="%s"'.$attributes.' />';
        }

        $position = match ($insertLocation) {
            Settings::SCRIPT_INSERT_LOCATION_HEADER => View::POS_BEGIN,
            Settings::SCRIPT_INSERT_LOCATION_FOOTER => View::POS_END,
            default => null,
        };

        if (Settings::SCRIPT_INSERT_TYPE_INLINE === $insertType && $filePath) {
            $chunk = file_get_contents($filePath);

            if (Settings::SCRIPT_INSERT_LOCATION_FORM === $insertLocation) {
                $this->addChunk($wrapOpen.$chunk.$wrapClose);

                return $this;
            }

            if (self::ELEMENT_SCRIPT === $type) {
                $view->registerJs($chunk, $position);
            } else {
                $view->registerCss($chunk, ['position' => $position]);
            }

            return $this;
        }

        $inserter = match ($type) {
            self::ELEMENT_SCRIPT => [$view, 'registerJsFile'],
            self::ELEMENT_STYLE => [$view, 'registerCssFile'],
        };

        if (Settings::SCRIPT_INSERT_TYPE_FILES === $insertType && $filePath) {
            $chunk = \Craft::$app->assetManager->getPublishedUrl($filePath, true);

            if (Settings::SCRIPT_INSERT_LOCATION_FORM === $insertLocation) {
                return $this->addChunk(sprintf($tag, $chunk));
            }

            $inserter($chunk, ['position' => $position]);

            return $this;
        }

        if (Settings::SCRIPT_INSERT_TYPE_POINTERS === $insertType && $url) {
            $hash = null;
            if ($filePath) {
                $hash = substr(sha1_file($filePath), 0, 5);
            }

            $chunk = UrlHelper::siteUrl($url, ['v' => $hash]);

            if (Settings::SCRIPT_INSERT_LOCATION_FORM === $insertLocation) {
                return $this->addChunk(sprintf($tag, $chunk));
            }

            $inserter($chunk, ['position' => $position]);

            return $this;
        }

        return $this;
    }
}
