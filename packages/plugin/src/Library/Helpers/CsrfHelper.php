<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\web\Request;

class CsrfHelper
{
    public static function validateToken(Request $request, mixed $submitted): bool
    {
        // Headless controllers perform their own validation. Craft 6's adapter
        // validateCsrfToken() assumes Laravel has already validated the request.
        $expected = $request->getCsrfToken();

        return \is_string($submitted)
            && '' !== $submitted
            && \is_string($expected)
            && '' !== $expected
            && hash_equals($expected, $submitted);
    }
}
