<?php

namespace Solspace\Freeform\Events\Forms;

use craft\web\View;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\FileHelper;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;

class RenderTagEvent extends ArrayableEvent implements FormEventInterface
{
    public const POSITION_BEGINNING = 'beginning';
    public const POSITION_END = 'end';

    private const ELEMENT_SCRIPT = 'script';
    private const ELEMENT_STYLE = 'style';

    private static array $addedScriptCache = [];

    /** @var string[] */
    private array $chunks = [];

    private array $scripts = [];
    private array $styles = [];

    public function __construct(
        private Form $form,
        private bool $generateTag = true,
        private bool $collectScripts = false,
        private bool $collectAllScripts = false,
    ) {
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

    public function isGenerateTag(): bool
    {
        return $this->generateTag;
    }

    public function isCollectAllScripts(): bool
    {
        return $this->collectAllScripts;
    }

    public function getChunks(): array
    {
        return $this->chunks;
    }

    public function getScripts(): array
    {
        return $this->scripts;
    }

    public function getStyles(): array
    {
        return $this->styles;
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

    public function addScript(string $filePath, array $attributes = []): self
    {
        return $this->addLoadableElement($filePath, attributes: $attributes);
    }

    public function addStylesheet(string $filePath, array $attributes = []): self
    {
        return $this->addLoadableElement($filePath, self::ELEMENT_STYLE, $attributes);
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
        ?string $filePath = null,
        string $type = self::ELEMENT_SCRIPT,
        array $attributes = [],
    ): self {
        if ($this->isScriptsDisabled() && !$this->collectScripts) {
            return $this;
        }

        $isAbsolute = FileHelper::isAbsolute($filePath);
        if ($isAbsolute) {
            $fullPath = $filePath;
        } else {
            $fullPath = \Craft::getAlias('@freeform/Resources/'.$filePath);
        }

        if ($isAbsolute) {
            $chunk = \Craft::$app->assetManager->getPublishedUrl($fullPath, true);
        } else {
            $chunk = \Craft::$app->assetManager->getPublishedUrl('@freeform-resources', true, $filePath);
        }

        match ($type) {
            self::ELEMENT_SCRIPT => $this->scripts[] = $chunk,
            self::ELEMENT_STYLE => $this->styles[] = $chunk,
        };

        $this->scripts = array_unique($this->scripts);
        $this->styles = array_unique($this->styles);

        if (\in_array($fullPath, self::$addedScriptCache, true)) {
            return $this;
        }

        self::$addedScriptCache[] = $fullPath;

        $view = \Craft::$app->getView();
        $insertType = $this->getSettingsService()->scriptInsertType();
        $insertLocation = $this->getSettingsService()->getSettingsModel()->scriptInsertLocation;

        $attributesObject = Attributes::fromArray($attributes);

        if (self::ELEMENT_SCRIPT === $type) {
            [$wrapOpen, $wrapClose] = ['<script type="text/javascript"'.$attributesObject.'>', '</script>'];
            $tag = '<script type="text/javascript" src="%s"'.$attributesObject.'></script>';
        } else {
            [$wrapOpen, $wrapClose] = ['<style type="text/css"'.$attributesObject.'>', '</style>'];
            $tag = '<link rel="stylesheet" type="text/css" href="%s"'.$attributesObject.' />';
        }

        $position = match ($insertLocation) {
            Settings::SCRIPT_INSERT_LOCATION_HEADER => View::POS_BEGIN,
            Settings::SCRIPT_INSERT_LOCATION_FOOTER => View::POS_END,
            default => null,
        };

        if (Settings::SCRIPT_INSERT_TYPE_INLINE === $insertType) {
            $chunk = file_get_contents($fullPath);

            if (Settings::SCRIPT_INSERT_LOCATION_FORM === $insertLocation) {
                $this->addChunk($wrapOpen.$chunk.$wrapClose);

                return $this;
            }

            if (self::ELEMENT_SCRIPT === $type) {
                $view->registerJs($chunk, $position);
            } else {
                $view->registerCss($chunk, array_merge(['position' => $position], $attributes));
            }

            return $this;
        }

        $inserter = match ($type) {
            self::ELEMENT_SCRIPT => [$view, 'registerJsFile'],
            self::ELEMENT_STYLE => [$view, 'registerCssFile'],
        };

        if (Settings::SCRIPT_INSERT_LOCATION_FORM === $insertLocation) {
            return $this->addChunk(sprintf($tag, $chunk));
        }

        $inserter($chunk, array_merge(['position' => $position], $attributes));

        return $this;
    }
}
