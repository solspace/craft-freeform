<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\CssObject;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\ExternalJavascriptObject;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\FormRenderObjectInterface;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\HtmlObject;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\JavascriptObject;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\StringObject;
use yii\web\View;

class FormRenderEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var FormRenderObjectInterface[] */
    private $renderObjects;

    /** @var bool */
    private $manualScriptLoading;

    public function __construct(Form $form, bool $manualScriptLoading = false)
    {
        $this->form = $form;
        $this->renderObjects = [];

        $this->manualScriptLoading = $manualScriptLoading;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['form', 'renderObjects'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getOrAttachOutputToView(): string
    {
        $isFooter = Freeform::getInstance()->settings->isFooterScripts();
        $isForm = Freeform::getInstance()->settings->isFormScripts();

        $output = '';
        foreach ($this->renderObjects as $object) {
            if ($isFooter) {
                $object->attachToView();
            }

            if ($isForm || $object instanceof StringObject) {
                $output .= $object->getOutput();
            }
        }

        return $output;
    }

    public function getOutput(): string
    {
        $output = '';
        foreach ($this->renderObjects as $object) {
            $output .= $object->getOutput();
        }

        return $output;
    }

    public function appendToOutput(string $value, array $replacements = []): self
    {
        $this->renderObjects[] = new StringObject($value, $replacements);

        return $this;
    }

    public function appendHtmlToOutput(string $value, int $position = View::POS_END): self
    {
        $this->renderObjects[] = new HtmlObject($value, [], $position);

        return $this;
    }

    public function appendJsToOutput(
        string $value,
        array $replacements = [],
        int $position = View::POS_END,
        array $options = []
    ): self {
        $this->renderObjects[] = new JavascriptObject($value, $replacements, $options, $position);

        return $this;
    }

    public function appendExternalJsToOutput(string $url, array $replacements = []): self
    {
        $this->renderObjects[] = new ExternalJavascriptObject($url, $replacements);

        return $this;
    }

    public function appendCssToOutput(string $value, array $replacements = []): self
    {
        $this->renderObjects[] = new CssObject($value, $replacements);

        return $this;
    }

    public function isManualScriptLoading(): bool
    {
        return $this->manualScriptLoading;
    }

    public function isNoScriptRenderEnabled(): bool
    {
        $isFooter = Freeform::getInstance()->settings->isFooterScripts();
        $isForm = Freeform::getInstance()->settings->isFormScripts();

        return !$isFooter && !$isForm;
    }
}
