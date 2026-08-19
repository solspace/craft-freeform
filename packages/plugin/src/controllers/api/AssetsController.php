<?php

namespace Solspace\Freeform\controllers\api;

use craft\elements\Asset;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class AssetsController extends BaseApiController
{
    public function actionAssetUrls(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $assetIds = $this->request->get('ids');
        if (!$assetIds) {
            return $this->asJson([]);
        }

        $transform = $this->request->get('transform');

        $assetIds = explode(',', $assetIds);
        $assets = Asset::find()->id($assetIds)->all();

        $urls = [];
        foreach ($assets as $asset) {
            $urls[$asset->id] = [
                'title' => $asset->title,
                'src' => $asset->getUrl($transform),
                // 'srcset' => $asset->getSrcset([480, 720, 960, 1024, 1280, 1800], $transform)
            ];
        }

        return $this->asSerializedJson($urls);
    }

    public function actionCardThumbnail(int $assetId): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        /** @var Asset $asset */
        $asset = Asset::find()->id($assetId)->one();
        if (!$asset) {
            throw new NotFoundHttpException('Asset not found');
        }

        $stream = $asset->getStream();

        $response = \Craft::$app->getResponse();
        $response->headers->set('Content-Type', $asset->getMimeType());
        $response->format = Response::FORMAT_RAW;
        $response->stream = $stream;

        return $response->send();
    }

    protected function get(): array
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $ids = $this->request->get('ids');
        if ($ids) {
            $ids = explode(',', $ids);
        }

        $service = \Craft::$app->getAssets();
        $assets = Asset::find()->id($ids)->all();

        return array_map(
            static fn (Asset $asset) => [
                'id' => $asset->id,
                'uid' => $asset->uid,
                'title' => $asset->title,
                'filename' => $asset->filename,
                'url' => $asset->getUrl(),
                'editUrl' => $asset->getCpEditUrl(),
                'thumbUrl' => $service->getThumbUrl($asset, 30, 20),
                'size' => $asset->size,
                'kind' => $asset->kind,
                'dateModified' => $asset->dateModified?->format('c'),
            ],
            $assets
        );
    }
}
