<?php

namespace Solspace\Freeform\Services\Headless\Profile;

use craft\elements\User;
use Solspace\Freeform\Form\Form;

interface ContextProviderInterface
{
    /**
     * Whether the requester may load the manifest for this profile.
     *
     * @param array<string, mixed> $properties Validated allow-listed properties
     */
    public function canAccessManifest(Form $form, array $properties, ?User $user): bool;

    /**
     * Whether the requester may submit through this profile.
     *
     * @param array<string, mixed> $properties Validated allow-listed properties
     */
    public function canSubmit(Form $form, array $properties, ?User $user): bool;

    /**
     * Safe default values to expose in the manifest.
     *
     * @param array<string, mixed> $properties Validated allow-listed properties
     *
     * @return array<string, mixed> field handle => value
     */
    public function getDefaultValues(Form $form, array $properties, ?User $user): array;

    /**
     * Field handles that should be hidden in the manifest.
     *
     * @param array<string, mixed> $properties Validated allow-listed properties
     *
     * @return string[]
     */
    public function getHiddenFieldHandles(Form $form, array $properties, ?User $user): array;

    /**
     * Field handles that should be read-only in the manifest.
     *
     * @param array<string, mixed> $properties Validated allow-listed properties
     *
     * @return string[]
     */
    public function getLockedFieldHandles(Form $form, array $properties, ?User $user): array;
}
