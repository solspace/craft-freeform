<?php

namespace Solspace\Freeform\Library\Bundles;

interface BundleInterface
{
    /**
     * Set the priority of this bundle
     * The lower the priority, the faster it will be called from the stack.
     */
    public static function getPriority(): int;

    /**
     * Determines if the bundle should be enabled for FF Pro only.
     */
    public static function isProOnly(): bool;
}
