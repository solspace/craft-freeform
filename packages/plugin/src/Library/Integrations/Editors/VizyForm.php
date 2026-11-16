<?php

namespace Solspace\Freeform\Library\Integrations\Editors;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\ExternalIntegrations;
use verbb\vizy\base\EditorGroup;
use verbb\vizy\base\Node;
use verbb\vizy\base\RenderContext;

class VizyForm extends Node
{
    public static ?string $type = 'freeformForm';

    public static function moduleId(): string
    {
        return 'solspace/freeform/form';
    }

    public static function label(): string
    {
        return Freeform::t('Freeform Form');
    }

    public static function icon(): ?string
    {
        return (new ExternalIntegrations())->getIconSvg();
    }

    public static function group(): ?string
    {
        return EditorGroup::Extensions;
    }

    public static function normalizeAttrs(array $attrs, RenderContext $ctx): array
    {
        $id = filter_var($attrs['formId'] ?? null, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        return ['formId' => $id ?: null];
    }

    public static function renderOccurrenceHtml(string $children, array $resolvedAttrs, RenderContext $ctx): ?string
    {
        return \Craft::$container->get(EditorFormRenderer::class)->renderForm($resolvedAttrs['formId'] ?? null);
    }
}
