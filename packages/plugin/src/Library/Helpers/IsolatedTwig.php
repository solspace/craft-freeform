<?php

namespace Solspace\Freeform\Library\Helpers;

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

class IsolatedTwig
{
    /** @var Environment */
    private $environment;

    public function __construct(string $templatePath = null)
    {
        if (null === $templatePath) {
            $templatePath = __DIR__.'/../../templates/';
        }

        $loader = new FilesystemLoader($templatePath);
        $this->environment = new Environment($loader, ['auto_reload' => true]);
    }

    public function render(string $template, array $variables = []): string
    {
        $template = $this->environment->createTemplate($template);

        return $template->render($variables);
    }
}
