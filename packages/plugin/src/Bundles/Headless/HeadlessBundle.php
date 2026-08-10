<?php

namespace Solspace\Freeform\Bundles\Headless;

use Solspace\Freeform\Bundles\Form\Context\Request\HeadlessRequestContext;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Headless\HeadlessAccessService;
use Solspace\Freeform\Services\Headless\HeadlessDraftService;
use Solspace\Freeform\Services\Headless\HeadlessResponseHelper;
use Solspace\Freeform\Services\Headless\HeadlessSubmitService;
use Solspace\Freeform\Services\Headless\Manifest\ManifestConditionalSerializer;
use Solspace\Freeform\Services\Headless\Manifest\ManifestExtensionResolver;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;
use Solspace\Freeform\Services\Headless\Manifest\ManifestLayoutSerializer;
use Solspace\Freeform\Services\Headless\ManifestService;
use Solspace\Freeform\Services\Headless\MultipartRequestParser;
use Solspace\Freeform\Services\Headless\Profile\HeadlessProfileRegistry;
use Solspace\Freeform\Services\Headless\Profile\ProfileAccessService;
use Solspace\Freeform\Services\Headless\Profile\ProfilePropertyExtractor;

class HeadlessBundle extends FeatureBundle
{
    public function __construct()
    {
        $this->registerServices();
        \Craft::$container->get(HeadlessRequestContext::class);
    }

    private function registerServices(): void
    {
        $container = \Craft::$container;

        $container->setSingleton(HeadlessProfileRegistry::class);
        $container->setSingleton(ProfilePropertyExtractor::class);
        $container->setSingleton(ProfileAccessService::class);
        $container->setSingleton(HeadlessAccessService::class);
        $container->setSingleton(HeadlessResponseHelper::class);
        $container->setSingleton(MultipartRequestParser::class);
        $container->setSingleton(ManifestLayoutSerializer::class);
        $container->setSingleton(ManifestExtensionResolver::class);
        $container->setSingleton(FormSecuritySerializer::class);
        $container->setSingleton(ManifestFieldSerializer::class);
        $container->setSingleton(ManifestConditionalSerializer::class);
        $container->setSingleton(ManifestService::class);
        $container->setSingleton(HeadlessDraftService::class);
        $container->setSingleton(HeadlessSubmitService::class);
        $container->setSingleton(HeadlessRequestContext::class);
    }
}
