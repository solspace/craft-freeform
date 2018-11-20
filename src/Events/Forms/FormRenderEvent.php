<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormRenderEvent extends Event
{
    /** @var Form */
    private $form;

    /** @var string[] */
    private $outputChunks;

    /**
     * FormRenderEvent constructor.
     *
     * @param Form $form
     */
    public function __construct(Form $form)
    {
        $this->form         = $form;
        $this->outputChunks = [];

        parent::__construct([]);
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
    public function getCompiledOutput(): string
    {
        return implode("\n", $this->outputChunks);
    }

    /**
     * @param string $value
     *
     * @return FormRenderEvent
     */
    public function appendToOutput(string $value): FormRenderEvent
    {
        $this->outputChunks[] = $value;

        return $this;
    }

    /**
     * @param string $value
     *
     * @return FormRenderEvent
     */
    public function appendJsToOutput(string $value): FormRenderEvent
    {
        $this->outputChunks[] = "<script>$value</script>";

        return $this;
    }

    /**
     * @param string $url
     *
     * @return FormRenderEvent
     */
    public function appendExternalJsToOutput(string $url): FormRenderEvent
    {
        $this->outputChunks[] = "<script src=\"$url\"></script>";

        return $this;
    }

    /**
     * @param string $value
     *
     * @return FormRenderEvent
     */
    public function appendCssToOutput(string $value): FormRenderEvent
    {
        $this->outputChunks[] = "<style>$value</style>";

        return $this;
    }
}
