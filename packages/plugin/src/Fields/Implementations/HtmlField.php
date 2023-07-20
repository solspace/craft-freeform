<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Traits\SingleStaticValueTrait;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Models\Settings;

#[Type(
    name: 'HTML',
    typeShorthand: 'html',
    iconPath: __DIR__.'/Icons/html.svg',
)]
class HtmlField extends AbstractField implements DefaultFieldInterface, InputOnlyInterface, NoStorageInterface
{
    use SingleStaticValueTrait;

    #[Input\Boolean(
        label: 'Allow Twig',
        instructions: 'Used to enable Twig in HTML blocks',
    )]
    protected bool $twig = false;

    public function isTwig(): bool
    {
        return $this->twig;
    }

    public function getType(): string
    {
        return self::TYPE_HTML;
    }

    public function getInputHtml(): string
    {
        if ($this->isTwig()) {
            if (\Craft::$app->request->getIsCpRequest()) {
                return $this->getValue();
            }

            /** @var Settings $settings */
            $settings = Freeform::getInstance()->getSettings();
            if ($settings->twigInHtml) {
                $variables = [
                    'form' => $this->getForm(),
                    'fields' => $this->getForm()->getLayout()->getFields()->getStorableFields(),
                    'allFields' => $this->getForm()->getLayout()->getFields(),
                ];

                if ($settings->twigInHtmlIsolatedMode) {
                    return (new IsolatedTwig())->render($this->getValue(), $variables);
                }

                return \Craft::$app->view->renderString($this->getValue(), $variables);
            }
        }

        return $this->getValue();
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }
}
