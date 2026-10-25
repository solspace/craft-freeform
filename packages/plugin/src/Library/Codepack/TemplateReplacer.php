<?php

namespace Solspace\Freeform\Library\Codepack;

class TemplateReplacer
{
    private string $sourceDir;
    private string $sourceDirName;
    private string $targetDir;
    private string $targetDirName;

    public function __construct(
        string $filePath,
        string $solspaceTemplateDir,
        string $customTemplateDir,
        ?string $targetName = null,
    ) {
        $this->sourceDir = \dirname($solspaceTemplateDir.\DIRECTORY_SEPARATOR.$filePath);
        $this->sourceDirName = basename($this->sourceDir);
        $this->targetDirName = $targetName ?? basename($this->sourceDir);
        $this->targetDir = $customTemplateDir;
    }

    public function replace(): string
    {
        $newPath = $this->targetDir.\DIRECTORY_SEPARATOR.$this->targetDirName;
        if (file_exists($newPath)) {
            throw new \InvalidArgumentException('A formatting template with that name already exists.');
        }

        $this->copy($this->sourceDir, $newPath);

        return $this->targetDirName;
    }

    private function copy(string $source, string $destination): void
    {
        if (!is_dir($destination)) {
            mkdir($destination, 0777, true);
        }

        $dir = opendir($source);

        while (($file = readdir($dir)) !== false) {
            if (str_starts_with($file, '.')) {
                continue;
            }

            $sourcePath = $source.\DIRECTORY_SEPARATOR.$file;
            $destinationPath = $destination.\DIRECTORY_SEPARATOR.$file;

            if (is_dir($sourcePath)) {
                $this->copy($sourcePath, $destinationPath);
            } else {
                copy($sourcePath, $destinationPath);
                $this->replaceFilePaths($destinationPath);
            }
        }

        closedir($dir);
    }

    private function replaceFilePaths(string $filePath): void
    {
        $craftTemplateDir = \Craft::$app->path->getSiteTemplatesPath();
        $slimTargetDir = str_replace($craftTemplateDir.\DIRECTORY_SEPARATOR, '', $this->targetDir);

        $content = file_get_contents($filePath);

        $modifiedContent = str_replace(
            'freeform/_templates/formatting/'.$this->sourceDirName,
            $slimTargetDir.\DIRECTORY_SEPARATOR.$this->targetDirName,
            $content
        );

        $modifiedContent = preg_replace(
            '/{% do view\.registerAssetBundle\([^%]+\) %}/',
            <<<EOT
                {# CSS overrides #}
                {% set cssPath = view.assetManager.publishedUrl('@templates/{$slimTargetDir}/{$this->targetDirName}/_main.css', true) %}
                {% do view.registerCssFile(cssPath) %}

                {# JS overrides #}
                {% set jsPath = view.assetManager.publishedUrl('@templates/{$slimTargetDir}/{$this->targetDirName}/_main.js', true) %}
                {% do view.registerJsFile(jsPath) %}
                EOT,
            $modifiedContent,
        );

        file_put_contents($filePath, $modifiedContent);
    }
}
