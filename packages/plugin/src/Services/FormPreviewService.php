<?php

namespace Solspace\Freeform\Services;

use craft\web\View;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PreviewAssetHelper;
use Solspace\Freeform\Library\Helpers\PreviewState;

class FormPreviewService
{
    public function getSampleTemplateOptions(): array
    {
        return array_map(static fn ($template) => [
            'value' => $template->getFileName(),
            'label' => $template->getName(),
        ], Freeform::getInstance()->settings->getSolspaceFormTemplates());
    }

    public function render(Form $form, int $page = 0, array $values = [], bool $advance = false, mixed $templateOverride = null): array
    {
        $settings = $form->getSettings()->getGeneral();
        $sample = PreviewState::resolveTemplateOverride($templateOverride, Freeform::getInstance()->settings->getSolspaceFormTemplates());
        $formattingTemplate = $sample?->getFileName() ?? $settings->formattingTemplate;
        $templates = $this->getTemplates();
        $template = $sample ? false : ($templates[$formattingTemplate] ?? null);
        if (null === $template) {
            throw new \InvalidArgumentException('Select an existing formatting template and save the form before previewing.');
        }

        $pages = $form->getLayout()->getPages();
        if (!$pages->getByIndex($page)) {
            throw new \InvalidArgumentException('Form page not found.');
        }

        $available = $form->isAvailable();
        $form->setPreview();
        $handles = PreviewState::apply($form, PreviewState::validateValues($values));
        $form->getProperties()->set(Form::PROPERTY_PAGE_INDEX, $page);
        $pages->setCurrent($page);
        $form->getSettings()->getBehavior()->ajax = false;

        if ($advance) {
            $validator = \Craft::$container->get(RuleValidator::class);
            $next = PreviewState::nextPage($form, $validator);
            if (null === $next) {
                return ['complete' => true, 'page' => $page];
            }
            $page = $next;
            $form->getProperties()->set(Form::PROPERTY_PAGE_INDEX, $page);
            $pages->setCurrent($page);
        }

        $channel = bin2hex(random_bytes(16));

        [$html, $bundledAssets] = $this->withIsolatedAssets(function () use ($form, $sample, $formattingTemplate, $template, $settings, $channel, $handles, $pages, $page) {
            // Only a server-resolved bundled path may override the saved template.
            // Its full path also prevents custom templates with matching names from
            // shadowing the requested sample. The form's saved settings stay intact.
            $markup = $form->render(['disable' => true, 'formattingTemplate' => $sample?->getFilePath() ?? $formattingTemplate]);
            // Yii removes registered bundles during endBody(). Capture their local
            // assets after rendering the form and before rendering the outer page.
            $bundledAssets = $this->getBundledAssets();

            $html = \Craft::$app->getView()->renderPageTemplate('freeform-embed/preview', [
                'form' => $form,
                'formMarkup' => $markup,
                'formattingTemplate' => $formattingTemplate,
                'isCustomFormattingTemplate' => $template,
                'cssUrls' => PreviewAssetHelper::parse($settings->previewCssUrls),
                'jsUrls' => PreviewAssetHelper::parse($settings->previewJsUrls),
                'isDark' => PreviewState::isDark($formattingTemplate, $template),
                'previewConfigJson' => json_encode([
                    'channel' => $channel,
                    'parentOrigin' => \Craft::$app->getRequest()->getHostInfo(),
                    'handles' => $handles,
                    'hasNextPage' => null !== $pages->getByIndex($page + 1),
                ], \JSON_HEX_TAG | \JSON_HEX_AMP | \JSON_HEX_APOS | \JSON_HEX_QUOT),
                'previewScript' => file_get_contents(__DIR__.'/../Resources/js/external/preview.js'),
            ], View::TEMPLATE_MODE_SITE);

            return [$html, $bundledAssets];
        });

        // Custom templates remain trusted server-side Twig. Never expose the CP
        // session's CSRF token to their browser scripts, even if they render it.
        $csrf = \Craft::$app->getRequest()->getCsrfToken(false);
        if ($csrf) {
            $html = str_replace([$csrf, trim(json_encode($csrf), '"')], '', $html);
        }

        return [
            'html' => $this->isolate($html, \Craft::$app->getConfig()->getGeneral()->csrfTokenName, $bundledAssets),
            'pages' => array_map(static fn ($item) => $item->getLabel(), iterator_to_array($pages)),
            'available' => $available,
            'page' => $page,
            'channel' => $channel,
            'complete' => false,
        ];
    }

    public function isolate(string $html, string $csrfName, array $bundledAssets = []): string
    {
        $document = new \DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);

        try {
            $document->loadHTML('<?xml encoding="UTF-8">'.$html, \LIBXML_NONET);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        $xpath = new \DOMXPath($document);
        foreach ($xpath->query('//base | //iframe | //object | //embed | //meta[@http-equiv]') as $node) {
            $node->parentNode->removeChild($node);
        }
        foreach ($xpath->query('//input') as $input) {
            if (\in_array($input->getAttribute('name'), [$csrfName, 'action', 'formHash', 'freeform_payload', 'freeform-action'], true)) {
                $input->parentNode->removeChild($input);
            }
        }
        foreach ($xpath->query('//form') as $node) {
            $node->setAttribute('action', 'about:blank');
        }
        foreach ($xpath->query('//*[@formaction]') as $node) {
            $node->removeAttribute('formaction');
        }

        // The date-picker loads its assets dynamically, so they are absent
        // from the markup scanned below. Allow only the files its inputs need.
        [$scripts, $styles] = $this->getDatepickerSources($xpath);
        $images = [];
        $fonts = [];
        foreach ($xpath->query('//script | //link | //img') as $node) {
            $attribute = 'link' === $node->nodeName ? 'href' : 'src';
            $url = $node->getAttribute($attribute);
            $asset = $bundledAssets[explode('?', $url, 2)[0]] ?? null;
            if (null !== $asset) {
                // A file BOM is an encoding marker, not inline CSS/JS content.
                $asset = preg_replace('/^\xEF\xBB\xBF/', '', $asset);
            }
            if (null !== $asset && 'script' === $node->nodeName) {
                $node->removeAttribute('src');
                $node->removeAttribute('integrity');
                $node->appendChild($document->createTextNode(str_ireplace('</script', '<\/script', $asset)));
                $url = '';
            } elseif (null !== $asset && 'link' === $node->nodeName && 'stylesheet' === strtolower($node->getAttribute('rel'))) {
                $style = $document->createElement('style');
                $style->appendChild($document->createTextNode(str_ireplace('</style', '<\/style', $asset)));
                $node->parentNode->replaceChild($style, $node);

                continue;
            }
            if (!$url && 'script' === $node->nodeName) {
                // Hash inline template/runtime scripts rather than granting all
                // inline code or eval permission inside the frame.
                $scripts[] = "'sha256-".base64_encode(hash('sha256', $node->textContent, true))."'";

                continue;
            }
            if (!$url) {
                continue;
            }
            if (str_starts_with($url, '/') && !str_starts_with($url, '//')) {
                $url = \Craft::$app->getRequest()->getHostInfo().$url;
            }
            if (!PreviewAssetHelper::isAllowed($url)) {
                $node->parentNode->removeChild($node);

                continue;
            }

            $node->setAttribute($attribute, $url);
            $node->setAttribute('crossorigin', 'anonymous');
            $node->setAttribute('referrerpolicy', 'no-referrer');
            if ('script' === $node->nodeName) {
                $scripts[] = $url;
            } elseif ('img' === $node->nodeName) {
                $images[] = $url;
                $node->removeAttribute('srcset');
            } elseif ('stylesheet' === strtolower($node->getAttribute('rel'))) {
                $styles[] = $url;
                $parts = parse_url($url);
                $fonts[] = 'https://'.$parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '');
            } else {
                $node->parentNode->removeChild($node);
            }
        }

        $policy = "default-src 'none'; base-uri 'none'; form-action 'none'; connect-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; "
            .'script-src '.($scripts ? implode(' ', array_unique($scripts)) : "'none'").'; '
            ."style-src 'unsafe-inline' ".implode(' ', array_unique($styles)).'; '
            .'img-src data: blob: '.implode(' ', array_unique($images)).'; '
            .'font-src data: '.implode(' ', array_unique($fonts)).';';
        $meta = $document->createElement('meta');
        $meta->setAttribute('http-equiv', 'Content-Security-Policy');
        $meta->setAttribute('content', $policy);
        $head = $document->getElementsByTagName('head')->item(0);
        $head->insertBefore($meta, $head->firstChild);

        return $document->saveHTML();
    }

    private function getDatepickerSources(\DOMXPath $xpath): array
    {
        $pickers = $xpath->query('//form[@data-freeform and @data-scripts-datepicker]//*[@data-datepicker and @data-datepicker-enabled and not(@data-datepicker-enabled="0") and not(@data-datepicker-enabled="false")]');
        if (!$pickers->length) {
            return [[], []];
        }

        $base = 'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/';
        $scripts = [$base.'flatpickr.min.js'];
        foreach ($pickers as $picker) {
            $locale = $picker->getAttribute('data-datepicker-locale');
            // Never turn a template attribute into an arbitrary script URL.
            if (!\in_array($locale, ['default', 'en'], true) && preg_match('/^[a-z]{2,3}(?:-[a-z]{2,3})?$/D', $locale)) {
                $scripts[] = $base.'l10n/'.$locale.'.js';
            }
        }

        return [$scripts, [$base.'flatpickr.min.css']];
    }

    private function withIsolatedAssets(callable $render): mixed
    {
        $view = \Craft::$app->getView();
        // CP bundles are already registered before this API action runs. Only
        // assets registered by the formatting template belong in the frame.
        $previous = [];
        foreach (['assetBundles', 'js', 'jsFiles', 'css', 'cssFiles', 'metaTags', 'linkTags'] as $property) {
            $previous[$property] = $view->{$property};
            $view->{$property} = [];
        }
        $view->startScriptBuffer();
        $view->startHtmlBuffer();

        try {
            return $render();
        } finally {
            $view->clearScriptBuffer();
            $view->clearHtmlBuffer();
            foreach ($previous as $property => $value) {
                $view->{$property} = $value;
            }
        }
    }

    private function getTemplates(): array
    {
        $service = Freeform::getInstance()->settings;
        $templates = [];
        foreach ($service->getSolspaceFormTemplates() as $template) {
            $templates[$template->getFileName()] = false;
        }
        foreach ($service->getCustomFormTemplates() as $template) {
            $templates[$template->getFileName()] = true;
        }

        return $templates;
    }

    private function getBundledAssets(): array
    {
        $assets = [];
        $root = realpath(__DIR__.'/../templates/_templates/formatting').\DIRECTORY_SEPARATOR;
        foreach (\Craft::$app->getView()->assetBundles as $bundle) {
            if (!$bundle || !$bundle->sourcePath) {
                continue;
            }
            $source = realpath(\Craft::getAlias($bundle->sourcePath));
            if (!$source || !str_starts_with($source.\DIRECTORY_SEPARATOR, $root)) {
                continue;
            }
            foreach (array_merge($bundle->js, $bundle->css) as $asset) {
                $asset = \is_array($asset) ? $asset[0] : $asset;
                $path = realpath($source.'/'.$asset);
                if (!$path || !str_starts_with($path, $root) || !\in_array(pathinfo($path, \PATHINFO_EXTENSION), ['js', 'css'], true)) {
                    continue;
                }
                $assets[rtrim($bundle->baseUrl, '/').'/'.$asset] = file_get_contents($path);
            }
        }

        return $assets;
    }
}
