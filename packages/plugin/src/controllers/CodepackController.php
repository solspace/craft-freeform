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

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Codepack\CodePack;
use Solspace\Freeform\Library\Codepack\Exceptions\CodepackException;
use Solspace\Freeform\Library\Codepack\Exceptions\FileObject\FileObjectException;
use Solspace\Freeform\Library\Codepack\Exceptions\Manifest\ManifestNotPresentException;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Resources\Bundles\CodepackBundle;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class CodepackController extends BaseController
{
    public const FLASH_VAR_KEY = 'codepack_prefix';

    public function init(): void
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        parent::init();
    }

    /**
     * Show CodePack contents
     * Provide means to prefix the CodePack.
     *
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     * @throws CodepackException
     */
    public function actionListContents(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->view->registerAssetBundle(CodepackBundle::class);

        $codePack = $this->getCodepack();

        $postInstallPrefix = \Craft::$app->session->getFlash(self::FLASH_VAR_KEY);
        if ($postInstallPrefix) {
            return $this->renderTemplate(
                'freeform/codepack/_post_install',
                [
                    'codePack' => $codePack,
                    'prefix' => CodePack::getCleanPrefix($postInstallPrefix),
                ]
            );
        }

        $settingsService = $this->getSettingsService();
        $readOnly = !$settingsService->isAllowAdminEdit();

        return $this->renderTemplate(
            'freeform/codepack',
            [
                'codePack' => $codePack,
                'prefix' => 'freeform-demo',
                'readOnly' => $readOnly,
                'templatesExist' => $this->templatesDirectoryExists('freeform-demo'),
            ]
        );
    }

    public function actionInstall(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        if (!$this->getSettingsService()->isAllowAdminEdit()) {
            throw new ForbiddenHttpException('Changes to these settings aren’t permitted in this environment.');
        }

        $prefix = $this->getPostedPrefix();

        $codePack = $this->getCodepack();
        if ($codePack instanceof Response) {
            return $codePack;
        }

        try {
            $codePack->install($prefix);
        } catch (FileObjectException|IOExceptionInterface $exception) {
            $message = strip_tags(str_replace('<br>', ' ', $exception->getMessage()));
            if (\Craft::$app->request->getAcceptsJson()) {
                return $this->asJson(['success' => false, 'message' => $message]);
            }

            return $this->renderTemplate(
                'freeform/codepack',
                [
                    'codePack' => $codePack,
                    'prefix' => $prefix,
                    'exceptionMessage' => $message,
                    'readOnly' => false,
                    'templatesExist' => $this->templatesDirectoryExists($prefix),
                ]
            );
        }

        if (\Craft::$app->request->getAcceptsJson()) {
            return $this->asJson([
                'success' => true,
                'html' => $this->view->renderTemplate('freeform/codepack/_success', [
                    'codePack' => $codePack,
                    'prefix' => $prefix,
                ]),
            ]);
        }

        \Craft::$app->session->setFlash(self::FLASH_VAR_KEY, $prefix);

        return $this->redirectToPostedUrl();
    }

    public function actionCheckDestination(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        $this->requirePostRequest();

        return $this->asJson([
            'templatesExist' => $this->templatesDirectoryExists($this->getPostedPrefix()),
        ]);
    }

    protected function getCodepack(): CodePack|Response
    {
        try {
            $codePack = new CodePack(__DIR__.'/../codepack');
        } catch (ManifestNotPresentException $exception) {
            return $this->renderTemplate('freeform/codepack/_no_codepacks');
        }

        return $codePack;
    }

    private function getPostedPrefix(): string
    {
        $prefix = \Craft::$app->request->post('prefix');
        if (!\is_string($prefix) || !preg_match('/^[\pL\pN][\pL\pN._-]*$/u', $prefix)) {
            throw new BadRequestHttpException(\Craft::t('freeform', 'Enter a folder name using letters, numbers, hyphens, underscores, or dots. Start with a letter or number.'));
        }

        return $prefix;
    }

    private function templatesDirectoryExists(string $prefix): bool
    {
        $directory = \Craft::$app->getPath()->getSiteTemplatesPath().'/'.$prefix;
        clearstatcache(true, $directory);

        return is_dir($directory);
    }
}
