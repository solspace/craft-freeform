<?php

namespace Solspace\Freeform\controllers\api\headless\spike;

use craft\web\Response;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Services\Headless\MultipartRequestParser;
use yii\web\ForbiddenHttpException;

/**
 * Dev-only spike endpoint for multipart parsing (Phase 1.9.3).
 * POST /freeform/api/headless/spike/multipart.
 */
class MultipartSpikeController extends BaseController
{
    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = true;

    public function actionIndex(): Response
    {
        if (!\Craft::$app->getConfig()->getGeneral()->devMode) {
            throw new ForbiddenHttpException('Spike endpoints are only available in dev mode.');
        }

        $this->requirePostRequest();

        $request = \Craft::$app->getRequest();
        $parser = \Craft::$container->get(MultipartRequestParser::class);

        $metadata = $parser->parseMetadata($request);
        $byHandle = $parser->extractFilesByHandle($request);

        $fileSummary = [];
        foreach ($byHandle as $handle => $files) {
            $fileSummary[$handle] = [
                'count' => \count($files['name'] ?? []),
                'names' => $files['name'] ?? [],
            ];
        }

        return $this->asJson([
            'spike' => '1.9.3-multipart',
            'contentType' => $request->getContentType(),
            'postKeys' => array_keys($request->post()),
            'metadata' => $metadata,
            'metadataParseSuccess' => null !== $metadata,
            'filesByHandle' => $fileSummary,
            'rawFiles' => $parser->describeRawFiles($request),
            'remapPreview' => array_keys($byHandle),
            'conclusion' => $this->buildConclusion($metadata, $byHandle),
        ]);
    }

    /**
     * @param null|array<string, mixed>           $metadata
     * @param array<string, array<string, array>> $byHandle
     *
     * @return array<string, mixed>
     */
    private function buildConclusion(?array $metadata, array $byHandle): array
    {
        $filesNamespace = $_FILES['files'] ?? null;
        $hasNamespace = \is_array($filesNamespace) && isset($filesNamespace['name']);

        return [
            'freeformJsonReadable' => null !== $metadata,
            'filesNamespacePresent' => $hasNamespace,
            'handlesExtracted' => array_keys($byHandle),
            'recommendation' => $hasNamespace && [] !== $byHandle
                ? 'Use MultipartRequestParser::remapFilesToFieldHandles() before Form::handleRequest().'
                : 'Send multipart with _freeform JSON and files[{handle}][] fields, then re-test.',
        ];
    }
}
