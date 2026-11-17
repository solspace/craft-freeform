<?php

namespace Solspace\Freeform\Library\Resources;

use CraftCms\Cms\Support\Facades\InputNamespace;
use CraftCms\Cms\Support\Html;
use Solspace\Freeform\Freeform;

final class EnvironmentControl
{
    public static function render(array $config, string $input, string $kind = 'text'): string
    {
        $id = InputNamespace::namespaceId($config['id']).'-env-help';
        $message = 'boolean' === $kind
            ? Freeform::t('Choose an environment variable with a boolean value: yes/no, true/false, on/off, or 0/1.')
            : Freeform::t('Type $ to choose an environment variable.');
        $button = Html::tag('button', '.ENV', [
            'type' => 'button',
            'id' => $id,
            'class' => 'freeform-env-badge',
            'aria' => ['label' => Freeform::t('Environment variable support')],
        ]);
        $tooltip = Html::tag('craft-tooltip', Html::encode($message), [
            'for' => $id,
            'invoker-relation' => 'description',
        ]);

        return Html::tag('div', $input.$button.$tooltip, ['class' => 'freeform-env-control freeform-env-control--'.$kind]);
    }
}
