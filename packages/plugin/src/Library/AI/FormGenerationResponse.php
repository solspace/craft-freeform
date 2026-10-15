<?php

namespace Solspace\Freeform\Library\AI;

use Solspace\Freeform\Freeform;

final class FormGenerationResponse
{
    public static function requireComplete(?string $reason, array $options): void
    {
        if (!empty($options['require_complete']) && \in_array(strtolower($reason ?? ''), ['length', 'max_tokens'], true)) {
            throw new FormGenerationException(Freeform::t('The AI response was cut short by its output limit. Try fewer pages or a smaller section. No form was saved.'));
        }
    }
}
