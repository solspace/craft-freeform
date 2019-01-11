<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\CssObject;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\ExternalJavascriptObject;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\FormRenderObjectInterface;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\JavascriptObject;
use Solspace\Freeform\Library\DataObjects\FormRenderObject\StringObject;

class FormRenderEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var FormRenderObjectInterface[] */
    private $renderObjects;

    /**
     * FormRenderEvent constructor.
     *
     * @param Form $form
     */
    public function __construct(Form $form)
    {
        $this->form          = $form;
        $this->renderObjects = [];

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['form', 'renderObjects'];
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return string
     */
    public function getOrAttachOutputToView(): string
    {
        $isFooter = Freeform::getInstance()->settings->isFooterScripts();

        $output = '';
        foreach ($this->renderObjects as $object) {
            $output .= $object->getFormattedValueOrAttachToView($isFooter) ?? '';
        }

        return $output;
    }

    /**
     * @param string $value
     * @param array  $replacements
     *
     * @return FormRenderEvent
     */
    public function appendToOutput(string $value, array $replacements = []): FormRenderEvent
    {
        $this->renderObjects[] = new StringObject($value, $replacements);

        return $this;
    }

    /**
     * @param string $value
     * @param array  $replacements
     *
     * @return FormRenderEvent
     */
    public function appendJsToOutput(string $value, array $replacements = []): FormRenderEvent
    {
        $this->renderObjects[] = new JavascriptObject($value, $replacements);

        return $this;
    }

    /**
     * @param string $url
     * @param array  $replacements
     *
     * @return FormRenderEvent
     */
    public function appendExternalJsToOutput(string $url, array $replacements = []): FormRenderEvent
    {
        $this->renderObjects[] = new ExternalJavascriptObject($url, $replacements);

        return $this;
    }

    /**
     * @param string $value
     * @param array  $replacements
     *
     * @return FormRenderEvent
     */
    public function appendCssToOutput(string $value, array $replacements = []): FormRenderEvent
    {
        $this->renderObjects[] = new CssObject($value, $replacements);

        return $this;
    }
}
