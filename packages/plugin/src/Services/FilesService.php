<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\elements\Asset;
use craft\errors\InvalidFsException;
use craft\errors\InvalidSubpathException;
use craft\errors\UploadFailedException;
use craft\helpers\ArrayHelper;
use craft\helpers\Assets;
use craft\helpers\Assets as AssetsHelper;
use craft\helpers\ConfigHelper;
use craft\helpers\Db;
use craft\helpers\FileHelper;
use craft\models\Volume;
use craft\models\VolumeFolder;
use craft\web\UploadedFile;
use GuzzleHttp\Exception\GuzzleException;
use Solspace\Freeform\Bundles\Fields\Validation\Helpers\FileUploadValidationHelper;
use Solspace\Freeform\Bundles\Form\Security\FormSecret;
use Solspace\Freeform\Events\Files\UploadEvent;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\FileUploads\FileUploadHandlerInterface;
use Solspace\Freeform\Library\FileUploads\FileUploadResponse;
use Solspace\Freeform\Library\FileUploads\ImageUploadProcessor;
use Solspace\Freeform\Library\Security\RemoteFileDownloader;
use Solspace\Freeform\Records\UnfinalizedFileRecord;
use yii\base\ErrorException;
use yii\base\Exception;

class FilesService extends BaseService implements FileUploadHandlerInterface
{
    public const CLEANUP_CACHE_KEY = 'freeform_file_cleanup_cache_key';
    public const CACHE_TTL = 3600; // 1 hour

    public const EVENT_BEFORE_UPLOAD = 'beforeUpload';
    public const EVENT_AFTER_UPLOAD = 'afterUpload';

    /**
     * Uploads a file and flags it as "unfinalized"
     * It will be finalized only after the form has been submitted fully
     * All unfinalized files will be deleted after a certain amount of time.
     *
     * @throws InvalidSubpathException|\Throwable
     */
    public function uploadFile(FileUploadField $field, Form $form): ?FileUploadResponse
    {
        if (!$field->getAssetSourceId()) {
            return null;
        }

        if ($form->isGraphQLPosted()) {
            return $this->uploadGraphQL($field, $form);
        }

        if (!$_FILES || !isset($_FILES[$field->getHandle()])) {
            return null;
        }

        if (!is_countable($_FILES[$field->getHandle()]['name'])) {
            return null;
        }

        $uploadedFileCount = \count($_FILES[$field->getHandle()]['name']);

        $sampleIndexes = [];
        if ($field->isSampleDataEnabled()) {
            $samples = new SampleFileService($this);
            $entries = (new FileUploadValidationHelper($this))->normalizeFilesInput($_FILES[$field->getHandle()]);
            foreach ($entries as $index => $entry) {
                if ($samples->isSampleUpload($field, $entry)) {
                    $sampleIndexes[$index] = true;
                }
            }
            if ($sampleIndexes && \count($sampleIndexes) === $uploadedFileCount) {
                return new FileUploadResponse([]);
            }
        }

        $beforeUploadEvent = new UploadEvent($field);
        $this->trigger(self::EVENT_BEFORE_UPLOAD, $beforeUploadEvent);

        if (!$beforeUploadEvent->isValid) {
            return null;
        }

        $folder = $this->getFileUploadFolder($form, $field);

        $uploadedAssetIds = $errors = [];
        for ($i = 0; $i < $uploadedFileCount; ++$i) {
            if (isset($sampleIndexes[$i])) {
                continue;
            }
            $uploadedFile = UploadedFile::getInstanceByName($field->getHandle()."[{$i}]");

            if (!$uploadedFile) {
                continue;
            }

            $asset = $this->saveUploadedFileToFolder($uploadedFile, $folder, $errors, $field);
            if ($asset) {
                $assetId = $asset->id;
                $this->markAssetUnfinalized($assetId);

                $uploadedAssetIds[] = $assetId;
            }
        }

        $field->setValue($uploadedAssetIds);

        $this->trigger(self::EVENT_AFTER_UPLOAD, new UploadEvent($field));

        return new FileUploadResponse($uploadedAssetIds, $errors);
    }

    public function getTableCellUploadedFiles(string $tableHandle, int $rowIndex, int $columnIndex): array
    {
        if (!isset($_FILES[$tableHandle])) {
            return [];
        }

        $name = $_FILES[$tableHandle]['name'][$rowIndex][$columnIndex] ?? null;
        if (null === $name || '' === $name || [] === $name) {
            return [];
        }

        $uploadedFiles = [];
        if (\is_array($name)) {
            foreach (array_keys($name) as $fileIndex) {
                $uploadedFile = UploadedFile::getInstanceByName(
                    "{$tableHandle}[{$rowIndex}][{$columnIndex}][{$fileIndex}]"
                );

                if ($uploadedFile) {
                    $uploadedFiles[] = $uploadedFile;
                }
            }
        } else {
            $uploadedFile = UploadedFile::getInstanceByName(
                "{$tableHandle}[{$rowIndex}][{$columnIndex}]"
            );
            if ($uploadedFile) {
                $uploadedFiles[] = $uploadedFile;
            }
        }

        return $uploadedFiles;
    }

    public function uploadTableCellFile(
        UploadedFile $uploadedFile,
        Form $form,
        int $assetSourceId,
        ?string $uploadLocation
    ): FileUploadResponse {
        try {
            $folder = $this->getFolderBySourceAndPath($assetSourceId, $uploadLocation, $form);
            if (!$folder) {
                return new FileUploadResponse(null, []);
            }

            $errors = [];
            $asset = $this->saveUploadedFileToFolder($uploadedFile, $folder, $errors);
            if (!$asset) {
                return new FileUploadResponse(null, $errors);
            }

            $this->markAssetUnfinalized($asset->id);

            return new FileUploadResponse([$asset->id]);
        } catch (\Throwable $e) {
            return new FileUploadResponse(null, [$e->getMessage()]);
        }
    }

    /**
     * Uploads a base64 encoded file and flags it as "unfinalized"
     * It will be finalized only after the form has been submitted fully
     * All unfinalized files will be deleted after a certain amount of time.
     *
     * @throws InvalidSubpathException
     * @throws Exception
     * @throws GuzzleException|\Throwable
     */
    public function uploadGraphQL(FileUploadField $field, Form $form): ?FileUploadResponse
    {
        $errors = [];
        $uploadedAssetIds = [];

        $handle = $field->getHandle();
        $arguments = $form->getGraphQLArguments();
        if (!$arguments || !isset($arguments[$handle])) {
            return null;
        }

        $beforeUploadEvent = new UploadEvent($field);
        $this->trigger(self::EVENT_BEFORE_UPLOAD, $beforeUploadEvent);
        if (!$beforeUploadEvent->isValid) {
            return null;
        }

        $folder = $this->getFileUploadFolder($form, $field);
        $validExtensions = array_map('strtolower', $this->getValidExtensions($field));
        $remoteFileDownloader = new RemoteFileDownloader();

        foreach ($arguments[$handle] as $fileUpload) {
            $asset = null;
            $response = null;
            $filename = null;
            $tempPath = null;

            try {
                if (!empty($fileUpload['fileData'])) {
                    if (empty($fileUpload['filename'])) {
                        throw new \InvalidArgumentException(Freeform::t('Invalid file data provided'));
                    }

                    $sourceFilename = $fileUpload['filename'];
                } elseif (!empty($fileUpload['url'])) {
                    $url = $fileUpload['url'];

                    if (empty($fileUpload['filename'])) {
                        $path = parse_url($url, \PHP_URL_PATH);
                        $sourceFilename = pathinfo((string) $path, \PATHINFO_BASENAME);
                    } else {
                        $sourceFilename = $fileUpload['filename'];
                    }
                } else {
                    continue;
                }

                $extension = pathinfo($sourceFilename, \PATHINFO_EXTENSION);
                if (!\in_array(strtolower($extension), $validExtensions, true)) {
                    throw new \InvalidArgumentException(
                        Freeform::t(
                            "'{extension}' is not an allowed file extension",
                            ['extension' => $extension]
                        )
                    );
                }

                $filename = Assets::prepareAssetName($sourceFilename);
                $extension = pathinfo($filename, \PATHINFO_EXTENSION);
                if (!\in_array(strtolower($extension), $validExtensions, true)) {
                    throw new \InvalidArgumentException(
                        Freeform::t(
                            "'{extension}' is not an allowed file extension",
                            ['extension' => $extension]
                        )
                    );
                }

                if (!empty($fileUpload['fileData'])) {
                    $tempPath = $this->moveToBase64FileTempFolder($fileUpload, $extension);
                } else {
                    $tempPath = AssetsHelper::tempFilePath($extension);
                    $remoteFileDownloader->download(
                        $url,
                        $tempPath,
                        $field->getMaxFileSizeBytes(),
                    );
                }

                $originalPath = $tempPath;

                try {
                    [$tempPath, $filename] = $this->preparePhoto($tempPath, $filename, $field);
                } finally {
                    if ($originalPath !== $tempPath && is_file($originalPath)) {
                        @unlink($originalPath);
                    }
                }

                $asset = new Asset();
                $asset->kind = AssetsHelper::getFileKindByExtension($filename);
                $asset->tempFilePath = $tempPath;
                $asset->filename = $filename;
                $asset->setScenario(Asset::SCENARIO_CREATE);
                $asset->newFolderId = $folder->id;
                $asset->setVolumeId($folder->volumeId);
                $asset->avoidFilenameConflicts = true;
                $asset->uploaderId = \Craft::$app->getUser()->getId();

                $response = \Craft::$app->getElements()->saveElement($asset);
            } catch (\Throwable $e) {
                $errors[] = $e->getMessage();
            } finally {
                if ($tempPath && is_file($tempPath)) {
                    @unlink($tempPath);
                }
            }

            if ($response) {
                $assetId = $asset->id;
                $this->markAssetUnfinalized($assetId);

                $uploadedAssetIds[] = $assetId;
            } elseif ($asset) {
                $errors = array_merge($errors, $asset->getErrors());
            }
        }

        $field->setValue($uploadedAssetIds);

        $this->trigger(self::EVENT_AFTER_UPLOAD, new UploadEvent($field));

        return new FileUploadResponse($uploadedAssetIds, $errors);
    }

    public function extractBase64String(array $fileUpload): ?array
    {
        $fileDataString = ArrayHelper::remove($fileUpload, 'fileData');

        if (preg_match('/^data:((?<type>[a-z0-9]+\/[a-z0-9\+\.\-]+);)?base64,(?<data>.+)/i', $fileDataString, $matches)) {
            return $matches;
        }

        return null;
    }

    /**
     * @throws InvalidSubpathException
     */
    public function getFileUploadFolder(Form $form, FileUploadInterface $field): ?VolumeFolder
    {
        return $this->getFolderBySourceAndPath(
            $field->getAssetSourceId(),
            $field->getDefaultUploadLocation(),
            $form,
        );
    }

    public function getFolderBySourceAndPath(?int $assetSourceId, ?string $uploadLocation, Form $form): ?VolumeFolder
    {
        if (!$assetSourceId) {
            return null;
        }

        $assetService = \Craft::$app->assets;
        if (!$uploadLocation) {
            return $assetService->getRootFolderByVolumeId($assetSourceId);
        }

        return $this->getFolder($assetSourceId, $uploadLocation, $form);
    }

    /**
     * @throws Exception
     */
    public function moveToBase64FileTempFolder(array $fileUpload, string $extension): string
    {
        $matches = $this->extractBase64String($fileUpload);

        $fileData = base64_decode($matches['data']);

        $tempPath = AssetsHelper::tempFilePath($extension);

        file_put_contents($tempPath, $fileData);

        return $tempPath;
    }

    /**
     * @throws \Throwable
     * @throws InvalidSubpathException
     */
    public function uploadDragAndDropFile(FileDragAndDropField $field, Form $form): ?Asset
    {
        if (!$field->getAssetSourceId()) {
            return null;
        }

        if (!$_FILES || !isset($_FILES[$field->getHandle()])) {
            return null;
        }

        if (is_countable($_FILES[$field->getHandle()]['name'])) {
            return null;
        }

        // Upload restrictions must hold even when page or conditional validation is skipped.
        $file = $_FILES[$field->getHandle()];
        if ((new SampleFileService($this))->isSampleUpload($field, $file)) {
            $field->addError(Freeform::t('Sample files are ignored on submission.'));

            return null;
        }
        $validationHelper = new FileUploadValidationHelper($this);
        $validationHelper->validateFileEntry(
            $file,
            $this->getValidExtensions($field),
            $field->getMaxFileSizeKB(),
            static fn (string $message) => $field->addError($message),
        );

        if (!$field->isValid() || \UPLOAD_ERR_OK !== (int) ($file['error'] ?? \UPLOAD_ERR_NO_FILE)) {
            return null;
        }

        $beforeUploadEvent = new UploadEvent($field);
        $this->trigger(self::EVENT_BEFORE_UPLOAD, $beforeUploadEvent);

        if (!$beforeUploadEvent->isValid) {
            return null;
        }

        $folder = $this->getFileUploadFolder($form, $field);

        $errors = [];
        $uploadedFile = UploadedFile::getInstanceByName($field->getHandle());
        if (!$uploadedFile) {
            return null;
        }

        $asset = null;
        $uploadedSuccessfully = false;

        try {
            $asset = $this->saveUploadedFileToFolder($uploadedFile, $folder, $errors, $field);
            $uploadedSuccessfully = null !== $asset;
        } catch (\Throwable $e) {
            $errors[] = $e->getMessage();
        }

        if ($uploadedSuccessfully) {
            $assetId = $asset->id;
            $formToken = FormSecret::get($form);

            $this->markAssetUnfinalized($assetId, $field, $formToken);
        } elseif ($asset) {
            $errors = array_merge($errors, $asset->getErrorSummary());
            $asset = null;
        }

        if (\count($errors)) {
            $field->addErrors($errors);
        }

        $this->trigger(self::EVENT_AFTER_UPLOAD, new UploadEvent($field));

        return $asset;
    }

    public function _volumeIdBySourceKey(string $sourceKey)
    {
        $parts = explode(':', $sourceKey, 2);

        if (2 !== \count($parts)) {
            return null;
        }

        /** @var null|Volume $volume */
        $volume = \Craft::$app->getVolumes()->getVolumeByUid($parts[1]);

        return $volume ? $volume->id : null;
    }

    /**
     * Stores the unfinalized assetId in the database
     * So that it can be deleted later if the form hasn't been finalized.
     *
     * @param mixed $assetId
     */
    public function markAssetUnfinalized($assetId, ?FileUploadField $field = null, ?string $formToken = null): void
    {
        $record = new UnfinalizedFileRecord();
        $record->assetId = $assetId;
        $record->fieldHandle = $field?->getHandle();
        $record->formToken = $formToken;
        $record->save(false);
    }

    /**
     * Remove all unfinalized assets which are older than the TTL
     * specified in settings.
     */
    public function cleanUpUnfinalizedAssets(int $ageInMinutes): int
    {
        if (!\Craft::$app->db->tableExists(UnfinalizedFileRecord::TABLE)) {
            return 0;
        }

        if ($ageInMinutes <= 0) {
            return 0;
        }

        $mutex = \Craft::$app->getMutex();

        $deletedAssets = 0;
        if ($mutex->acquire(self::CLEANUP_CACHE_KEY, 30)) {
            try {
                $date = new \DateTime("-{$ageInMinutes} minutes");
                $date->setTimezone(new \DateTimeZone('UTC'));

                $assetIds = (new Query())
                    ->select(['assetId'])
                    ->from(UnfinalizedFileRecord::TABLE)
                    ->where(['<', '{{%freeform_unfinalized_files}}.[[dateCreated]]', Db::prepareDateForDb($date)])
                    ->column()
                ;

                foreach ($assetIds as $assetId) {
                    try {
                        $isDeleted = \Craft::$app
                            ->getElements()
                            ->deleteElementById($assetId, Asset::class, hardDelete: true)
                        ;

                        \Craft::$app
                            ->db
                            ->createCommand()
                            ->delete(UnfinalizedFileRecord::TABLE, ['assetId' => $assetId])
                            ->execute()
                        ;

                        if ($isDeleted) {
                            ++$deletedAssets;
                        }
                    } catch (\Exception) {
                    }
                }
            } finally {
                $mutex->release(self::CLEANUP_CACHE_KEY);
            }
        }

        return $deletedAssets;
    }

    /**
     * Get a serializable array of asset sources containing
     * their ID, name and type.
     */
    public function getAssetSources(): array
    {
        $volumes = \Craft::$app->volumes->getAllVolumes();
        $assetSources = [];
        foreach ($volumes as $source) {
            $assetSources[] = [
                'id' => (int) $source->id,
                'name' => $source->name,
                'type' => 'volume',
            ];
        }

        return $assetSources;
    }

    public function getAssetUrlsFromIds(array $ids): array
    {
        $urls = [];
        foreach ($ids as $id) {
            if ($id && is_numeric($id)) {
                $asset = \Craft::$app->assets->getAssetById($id);
                if ($asset) {
                    $urls[] = $asset->getUrl();
                }
            }
        }

        return $urls;
    }

    public function getAssetMetadataFromIds(array $ids): array
    {
        $metadata = [];
        foreach ($ids as $id) {
            if ($id && is_numeric($id)) {
                $asset = \Craft::$app->assets->getAssetById($id);
                if ($asset) {
                    $data = [
                        'id' => $asset->id,
                        'filename' => $asset->filename,
                        'url' => $asset->getUrl(),
                        'size' => $asset->size,
                        'kind' => $asset->kind,
                    ];

                    if ('image' === $asset->kind) {
                        $data['dimensions'] = [
                            'width' => $asset->width,
                            'height' => $asset->height,
                        ];
                    }

                    $metadata[] = $data;
                }
            }
        }

        return $metadata;
    }

    /**
     * Get a key-value list of asset sources, indexed by ID.
     */
    public function getAssetSourceList(): array
    {
        $volumes = \Craft::$app->volumes->getAllVolumes();
        $assetSources = [];
        foreach ($volumes as $source) {
            $assetSources[(int) $source->id] = $source->name;
        }

        return $assetSources;
    }

    /**
     * Returns an array of all file kinds
     * [type => [ext, ext, ..]
     * I.e. ["image" => ["gif", "png", "jpg", "jpeg", ..]].
     */
    public function getFileKinds(): array
    {
        $fileKinds = Assets::getAllowedFileKinds();

        return array_map(
            static fn ($extensions) => $extensions['extensions'],
            $fileKinds
        );
    }

    /**
     * Returns an array of all valid file extensions for this field.
     */
    public function getValidExtensions(FileUploadField $field): array
    {
        $allFileKinds = $this->getFileKinds();
        $selectedFileKinds = $field->getFileKinds();

        $allowedExtensions = [];
        if ($selectedFileKinds) {
            foreach ($selectedFileKinds as $kind) {
                if (isset($allFileKinds[$kind])) {
                    $allowedExtensions = array_merge($allowedExtensions, $allFileKinds[$kind]);
                }
            }
        } else {
            $allowedExtensions = \Craft::$app->getConfig()->getGeneral()->allowedFileExtensions;
        }

        // HEIC is accepted only as input for conversion to an already allowed JPEG output.
        // It is never added to Craft's global allowed extensions or stored as an original.
        $allowedExtensions = array_map('strtolower', $allowedExtensions);
        if ($field->isOptimizeImages() && array_intersect(['jpg', 'jpeg'], $allowedExtensions)
            && (!$selectedFileKinds || \in_array('image', $selectedFileKinds, true))) {
            $allowedExtensions = array_merge($allowedExtensions, ['heic', 'heif']);
        }

        return array_values(array_unique($allowedExtensions));
    }

    /** Immediate preview for the newly uploaded optimized photo, including private volumes. */
    public function getOptimizedPhotoPreview(Asset $asset, FileUploadField $field): ?string
    {
        if (!$field->isOptimizeImages() || !\in_array(strtolower($asset->getExtension()), ['jpg', 'jpeg'], true)) {
            return null;
        }
        $source = $preview = null;

        try {
            $source = $asset->getCopyOfFile();
            [$preview] = (new ImageUploadProcessor())->process($source, $asset->getFilename(), 320, 75, 65536);

            return 'data:image/jpeg;base64,'.base64_encode(file_get_contents($preview));
        } catch (\Throwable) {
            // A preview failure must not turn an already saved upload into an error.
            return null;
        } finally {
            foreach (array_unique(array_filter([$source, $preview])) as $path) {
                if (is_file($path)) {
                    @unlink($path);
                }
            }
        }
    }

    private function saveUploadedFileToFolder(
        UploadedFile $uploadedFile,
        VolumeFolder $folder,
        array &$errors,
        ?FileUploadField $field = null,
    ): ?Asset {
        $asset = null;
        $tempPath = null;
        $processedPath = null;

        try {
            $filename = Assets::prepareAssetName($uploadedFile->name);
            $asset = new Asset();

            try {
                $tempPath = $uploadedFile->saveAsTempFile();
            } catch (ErrorException $e) {
                throw new UploadFailedException(0, null, $e);
            }

            [$processedPath, $filename] = $this->preparePhoto($tempPath, $filename, $field);
            $asset->kind = AssetsHelper::getFileKindByExtension($filename);
            $asset->tempFilePath = $processedPath;
            $asset->filename = $filename;
            $asset->setScenario(Asset::SCENARIO_CREATE);
            $asset->setVolumeId($folder->volumeId);
            $asset->newFolderId = $folder->id;
            $asset->avoidFilenameConflicts = true;
            $asset->uploaderId = \Craft::$app->getUser()->getId();

            $saved = \Craft::$app->getElements()->saveElement($asset);
            if ($saved) {
                return $asset;
            }
        } catch (Exception|\Throwable $e) {
            $errors[] = $e->getMessage();
        } finally {
            foreach (array_unique(array_filter([$tempPath, $processedPath])) as $path) {
                if (is_file($path)) {
                    @unlink($path);
                }
            }
        }

        if ($asset) {
            $errors = array_merge($errors, $asset->getErrorSummary(true));
        }

        return null;
    }

    private function preparePhoto(string $path, string $filename, ?FileUploadField $field): array
    {
        if (!$field || !$field->isOptimizeImages() || !ImageUploadProcessor::handles($filename)) {
            return [$path, $filename];
        }

        $allowed = $this->getValidExtensions($field);
        if (!array_intersect(['jpg', 'jpeg'], $allowed)) {
            throw new \RuntimeException(Freeform::t('Photo optimization requires JPEG uploads to be allowed.'));
        }
        $sourceBytes = filesize($path);
        $craftLimit = ConfigHelper::sizeInBytes(\Craft::$app->getConfig()->getGeneral()->maxUploadFileSize);
        if (!$sourceBytes || $sourceBytes > min($field->getMaxFileSizeBytes(), $craftLimit)) {
            throw new \RuntimeException(Freeform::t('The original file exceeds the maximum upload size.'));
        }

        try {
            [$processedPath, $processedName] = (new ImageUploadProcessor())->process(
                $path,
                $filename,
                $field->getImageMaxDimension(),
                $field->getImageQuality(),
                min($field->getImageMaxSizeKB() * 1024, $field->getMaxFileSizeBytes(), $craftLimit),
            );
            if (!\in_array('jpg', $allowed, true)) {
                $processedName = pathinfo($processedName, \PATHINFO_FILENAME).'.jpeg';
            }

            return [$processedPath, $processedName];
        } catch (\RuntimeException $exception) {
            throw new \RuntimeException(Freeform::t($exception->getMessage()), 0, $exception);
        }
    }

    private function getFolder($volumeId, string $subpath, Form $form): ?VolumeFolder
    {
        $assetsService = \Craft::$app->getAssets();

        $rootFolder = $assetsService->getRootFolderByVolumeId($volumeId);
        if (null === $volumeId || null === $rootFolder) {
            throw new InvalidFsException();
        }

        $subpath = trim($subpath, '/');
        if ('' === $subpath) {
            return $rootFolder;
        }

        try {
            $renderedSubpath = \Craft::$app->view->renderString($subpath, ['form' => $form]);
        } catch (\Throwable $e) {
            throw new InvalidSubpathException($subpath, null, 0, $e);
        }

        if (
            '' === $renderedSubpath
            || trim($renderedSubpath, '/') != $renderedSubpath
            || str_contains($renderedSubpath, '//')
        ) {
            throw new InvalidSubpathException($subpath);
        }

        $segments = explode('/', $renderedSubpath);
        foreach ($segments as &$segment) {
            $segment = FileHelper::sanitizeFilename($segment, [
                'asciiOnly' => \Craft::$app->getConfig()->getGeneral()->convertFilenamesToAscii,
            ]);
        }

        unset($segment);
        $subpath = implode('/', $segments);

        $folder = $assetsService->findFolder([
            'volumeId' => $volumeId,
            'path' => $subpath.'/',
        ]);

        // Ensure that the folder exists
        if (!$folder) {
            $volume = \Craft::$app->getVolumes()->getVolumeById($volumeId);
            $folder = $assetsService->ensureFolderByFullPathAndVolume($subpath, $volume);
        }

        return $folder;
    }
}
