<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\web\View;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Implementations\ContentField;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'Template',
    typeShorthand: 'builder-template',
    iconPath: __DIR__.'/../Icons/html.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/builder-template.ejs',
)]
class BuilderTemplateField extends ContentField
{
    #[Input\Select(
        label: 'Template',
        instructions: 'A Twig file from the Builder Templates directory in Freeform settings.',
        emptyOption: 'Choose a template',
        options: BuilderTemplateOptions::class,
    )]
    protected string $template = '';

    public function getType(): string
    {
        return 'builder-template';
    }

    public function getTemplate(): string
    {
        return $this->template;
    }

    protected function getInputHtml(): string
    {
        $settings = Freeform::getInstance()->settings->getSettingsModel();
        if (!$this->template || !\array_key_exists($this->template, $settings->listBuilderTemplates())) {
            return '';
        }

        $directory = trim((string) $settings->builderTemplateDirectory, '/');

        return \Craft::$app->view->renderTemplate($directory.'/'.$this->template, [
            'form' => $this->getForm(),
            'field' => $this,
            'fields' => $this->getForm()->getLayout()->getFields()->getStorableFields(),
            'allFields' => $this->getForm()->getLayout()->getFields(),
        ], View::TEMPLATE_MODE_SITE);
    }
}
