<?php

namespace Solspace\Freeform\Library\Integrations\Editors;

use Solspace\Freeform\Library\Integrations\Links\FormLinkProvider;
use Solspace\Freeform\Variables\FreeformVariable;
use Twig\Markup;

class EditorFormRenderer
{
    public function renderContent(mixed $content, array $properties = []): Markup
    {
        // Only our empty, canonical placeholders are interpreted. Authored HTML
        // and Twig remain untouched; this is not a template evaluator.
        $html = preg_replace_callback(
            '/<div data-freeform-form="([1-9][0-9]*)"><\/div>/',
            fn (array $match) => $this->renderForm($match[1], $properties),
            (string) $content,
        );

        return new Markup($html, \Craft::$app->charset);
    }

    public function renderForm(mixed $id, array $properties = []): string
    {
        if (!\is_int($id) && !\is_string($id)) {
            return '';
        }

        $provider = \Craft::$container->get(FormLinkProvider::class);
        $selected = $provider->getForm('freeform:'.$id);
        if (!$selected) {
            return '';
        }

        $instanceId = 'editor-'.bin2hex(random_bytes(8));
        $properties['fieldIdPrefix'] = $instanceId.'-';
        $properties['attributes']['id'] = 'freeform-'.$instanceId;
        $form = (new FreeformVariable())->form($selected->getId(), $properties, $instanceId);

        return (string) $form?->render();
    }
}
