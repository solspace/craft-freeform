<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\FileUploadTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;

class FileUploadField extends AbstractField implements MultipleValueInterface, FileUploadInterface
{
    const DEFAULT_MAX_FILESIZE_KB = 2048;
    const DEFAULT_FILE_COUNT      = 1;

    use MultipleValueTrait;
    use FileUploadTrait;

    /** @var array */
    protected $fileKinds;

    /** @var int */
    protected $maxFileSizeKB;

    /** @var int */
    protected $fileCount;

    /**
     * Cache for handles meant for preventing duplicate file uploads when calling ::validate() and ::uploadFile()
     * Stores the assetID once as value for handle key
     *
     * @var array
     */
    private static $filesUploaded = [];

    /**
     * Contains any errors for a given upload field
     *
     * @var array
     */
    private static $filesUploadedErrors = [];

    /**
     * @return string
     */
    public static function getFieldType(): string
    {
        return self::TYPE_FILE;
    }

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_FILE;
    }

    /**
     * @return array
     */
    public function getFileKinds(): array
    {
        if (!is_array($this->fileKinds)) {
            return [];
        }

        return $this->fileKinds;
    }

    /**
     * @return int
     */
    public function getMaxFileSizeKB(): int
    {
        return $this->maxFileSizeKB ?: self::DEFAULT_MAX_FILESIZE_KB;
    }

    /**
     * @return int
     */
    public function getFileCount(): int
    {
        return $this->fileCount <= 1 ? 1 : (int) $this->fileCount;
    }

    /**
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        return '<input '
            . $this->getInputAttributesString()
            . $this->getAttributeString('name', $this->getHandle() . '[]')
            . $this->getAttributeString('type', $this->getType())
            . $this->getAttributeString('id', $this->getIdAttribute())
            . $this->getParameterString('multiple', $this->getFileCount() > 1)
            . $this->getRequiredAttribute()
            . $attributes->getInputAttributesAsString()
            . '/>';
    }

    /**
     * Validate the field and add error messages if any
     *
     * @return array
     */
    protected function validate(): array
    {
        $uploadErrors = [];

        if (!array_key_exists($this->handle, self::$filesUploaded)) {
            $exists = isset($_FILES[$this->handle]) && !empty($_FILES[$this->handle]['name']) && !$this->isHidden();

            if ($exists && !\is_array($_FILES[$this->handle]['name'])) {
                $_FILES[$this->handle]['name']     = [$_FILES[$this->handle]['name']];
                $_FILES[$this->handle]['tmp_name'] = [$_FILES[$this->handle]['tmp_name']];
                $_FILES[$this->handle]['error']    = [$_FILES[$this->handle]['error']];
                $_FILES[$this->handle]['size']     = [$_FILES[$this->handle]['size']];
                $_FILES[$this->handle]['type']     = [$_FILES[$this->handle]['type']];
            }

            if ($exists && $_FILES[$this->handle]['name'][0]) {
                $fileCount = count($_FILES[$this->handle]['name']);

                if ($fileCount > $this->getFileCount()) {
                    $uploadErrors[] = $this->translate(
                        'Tried uploading {count} files. Maximum {max} files allowed.',
                        ['max' => $this->getFileCount(), 'count' => $fileCount]
                    );
                }

                foreach ($_FILES[$this->handle]['name'] as $index => $name) {
                    $extension       = pathinfo($name, PATHINFO_EXTENSION);
                    $mime            = mime_content_type($_FILES[$this->handle]['tmp_name'][$index]);
                    $validExtensions = $this->getValidExtensions();

                    if (empty($_FILES[$this->handle]['tmp_name'][$index])) {
                        $errorCode = $_FILES[$this->handle]['error'][$index];

                        switch ($errorCode) {
                            case UPLOAD_ERR_INI_SIZE:
                            case UPLOAD_ERR_FORM_SIZE:
                                $uploadErrors[] = $this->translate('File size too large');
                                break;

                            case UPLOAD_ERR_PARTIAL:
                                $uploadErrors[] = $this->translate('The file was only partially uploaded');
                                break;
                        }
                        $uploadErrors[] = $this->translate('Could not upload file');
                    }

                    // Check for the correct file extension
                    if (!in_array(strtolower($extension), $validExtensions, true)) {
                        $uploadErrors[] = $this->translate(
                            "'{extension}' is not an allowed file extension",
                            ['extension' => $extension]
                        );
                    }
                    elseif ($mime) {
                        $mimeExtension = $this->mime2ext(strtolower($mime));
                        // Check for the correct mime type
                        if ($mimeExtension) {
                            if (!in_array($mimeExtension, $validExtensions, true)) {
                                $uploadErrors[] = $this->translate(
                                    "'{mime}' is not an allowed file format",
                                    ['mime' => $mime]
                                );
                            }
                        }
                        else {
                            $uploadErrors[] = $this->translate(
                                "Unknown file type"
                            );
                        }
                    }
                    else {
                        $uploadErrors[] = $this->translate(
                            "Unable to verify file format"
                        );
                    }

                    $fileSizeKB = ceil($_FILES[$this->handle]['size'][$index] / 1024);
                    if ($fileSizeKB > $this->getMaxFileSizeKB()) {
                        $uploadErrors[] = $this->translate(
                            'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                            ['fileSize' => $fileSizeKB, 'maxFileSize' => $this->getMaxFileSizeKB()]
                        );
                    }
                }

            } else if ($this->isRequired() && !$this->isHidden()) {
                $uploadErrors[] = $this->translate('This field is required');
            }

            // if there are errors - prevent the file from being uploaded
            if ($uploadErrors || $this->isHidden()) {
                self::$filesUploaded[$this->handle] = null;
            }

            self::$filesUploadedErrors[$this->handle] = $uploadErrors;
        }

        return self::$filesUploadedErrors[$this->handle];
    }

    /**
     * Attempt to upload the file to its respective location
     *
     * @return array|null - asset IDs
     * @throws FileUploadException
     */
    public function uploadFile()
    {
        if (!array_key_exists($this->handle, self::$filesUploaded)) {
            $response = $this->getForm()->getFileUploadHandler()->uploadFile($this, $this->getForm());

            self::$filesUploaded[$this->handle]       = null;
            self::$filesUploadedErrors[$this->handle] = [];

            if ($response) {
                $errors = $this->getErrors() ?: [];

                if ($response->getAssetIds() || empty($response->getErrors())) {
                    $this->values                       = $response->getAssetIds();
                    self::$filesUploaded[$this->handle] = $response->getAssetIds();

                    return $this->values;
                }

                if ($response->getErrors()) {
                    $this->errors                             = array_merge($errors, $response->getErrors());
                    self::$filesUploadedErrors[$this->handle] = $this->errors;
                    throw new FileUploadException(implode('. ', $response->getErrors()));
                }

                $this->errors                             = array_merge($errors, $response->getErrors());
                self::$filesUploadedErrors[$this->handle] = $this->errors;
                throw new FileUploadException($this->translate('Could not upload file'));
            }

            return null;
        }

        if (!empty(self::$filesUploadedErrors[$this->handle])) {
            $this->errors = self::$filesUploadedErrors[$this->handle];
        }

        return self::$filesUploaded[$this->handle];
    }

    /**
     * Returns an array of all valid file extensions for this field
     *
     * @return array
     */
    private function getValidExtensions(): array
    {
        $allFileKinds = $this->getForm()->getFileUploadHandler()->getFileKinds();

        $selectedFileKinds = $this->getFileKinds();

        $allowedExtensions = [];
        if ($selectedFileKinds) {
            foreach ($selectedFileKinds as $kind) {
                if (array_key_exists($kind, $allFileKinds)) {
                    $allowedExtensions = array_merge($allowedExtensions, $allFileKinds[$kind]);
                }
            }
        } else {
            $allowedExtensions = \Craft::$app->getConfig()->getGeneral()->allowedFileExtensions;
        }

        return $allowedExtensions;
    }


    /**
     * Returns an the file extension for the provided mime type
     *
     * @return array
     */
     function mime2ext($mime) {
         $mime_map = [
             'video/3gpp2'                                                               => '3g2',
             'video/3gp'                                                                 => '3gp',
             'video/3gpp'                                                                => '3gp',
             'application/x-compressed'                                                  => '7zip',
             'audio/x-acc'                                                               => 'aac',
             'audio/ac3'                                                                 => 'ac3',
             'application/postscript'                                                    => 'ai',
             'audio/x-aiff'                                                              => 'aif',
             'audio/aiff'                                                                => 'aif',
             'audio/x-au'                                                                => 'au',
             'video/x-msvideo'                                                           => 'avi',
             'video/msvideo'                                                             => 'avi',
             'video/avi'                                                                 => 'avi',
             'application/x-troff-msvideo'                                               => 'avi',
             'application/macbinary'                                                     => 'bin',
             'application/mac-binary'                                                    => 'bin',
             'application/x-binary'                                                      => 'bin',
             'application/x-macbinary'                                                   => 'bin',
             'image/bmp'                                                                 => 'bmp',
             'image/x-bmp'                                                               => 'bmp',
             'image/x-bitmap'                                                            => 'bmp',
             'image/x-xbitmap'                                                           => 'bmp',
             'image/x-win-bitmap'                                                        => 'bmp',
             'image/x-windows-bmp'                                                       => 'bmp',
             'image/ms-bmp'                                                              => 'bmp',
             'image/x-ms-bmp'                                                            => 'bmp',
             'application/bmp'                                                           => 'bmp',
             'application/x-bmp'                                                         => 'bmp',
             'application/x-win-bitmap'                                                  => 'bmp',
             'application/cdr'                                                           => 'cdr',
             'application/coreldraw'                                                     => 'cdr',
             'application/x-cdr'                                                         => 'cdr',
             'application/x-coreldraw'                                                   => 'cdr',
             'image/cdr'                                                                 => 'cdr',
             'image/x-cdr'                                                               => 'cdr',
             'zz-application/zz-winassoc-cdr'                                            => 'cdr',
             'application/mac-compactpro'                                                => 'cpt',
             'application/pkix-crl'                                                      => 'crl',
             'application/pkcs-crl'                                                      => 'crl',
             'application/x-x509-ca-cert'                                                => 'crt',
             'application/pkix-cert'                                                     => 'crt',
             'text/css'                                                                  => 'css',
             'text/x-comma-separated-values'                                             => 'csv',
             'text/comma-separated-values'                                               => 'csv',
             'application/vnd.msexcel'                                                   => 'csv',
             'application/x-director'                                                    => 'dcr',
             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   => 'docx',
             'application/x-dvi'                                                         => 'dvi',
             'message/rfc822'                                                            => 'eml',
             'application/x-msdownload'                                                  => 'exe',
             'video/x-f4v'                                                               => 'f4v',
             'audio/x-flac'                                                              => 'flac',
             'video/x-flv'                                                               => 'flv',
             'image/gif'                                                                 => 'gif',
             'application/gpg-keys'                                                      => 'gpg',
             'application/x-gtar'                                                        => 'gtar',
             'application/x-gzip'                                                        => 'gzip',
             'application/mac-binhex40'                                                  => 'hqx',
             'application/mac-binhex'                                                    => 'hqx',
             'application/x-binhex40'                                                    => 'hqx',
             'application/x-mac-binhex40'                                                => 'hqx',
             'text/html'                                                                 => 'html',
             'image/x-icon'                                                              => 'ico',
             'image/x-ico'                                                               => 'ico',
             'image/vnd.microsoft.icon'                                                  => 'ico',
             'text/calendar'                                                             => 'ics',
             'application/java-archive'                                                  => 'jar',
             'application/x-java-application'                                            => 'jar',
             'application/x-jar'                                                         => 'jar',
             'image/jp2'                                                                 => 'jp2',
             'video/mj2'                                                                 => 'jp2',
             'image/jpx'                                                                 => 'jp2',
             'image/jpm'                                                                 => 'jp2',
             'image/jpeg'                                                                => 'jpeg',
             'image/pjpeg'                                                               => 'jpeg',
             'application/x-javascript'                                                  => 'js',
             'application/json'                                                          => 'json',
             'text/json'                                                                 => 'json',
             'application/vnd.google-earth.kml+xml'                                      => 'kml',
             'application/vnd.google-earth.kmz'                                          => 'kmz',
             'text/x-log'                                                                => 'log',
             'audio/x-m4a'                                                               => 'm4a',
             'application/vnd.mpegurl'                                                   => 'm4u',
             'audio/midi'                                                                => 'mid',
             'application/vnd.mif'                                                       => 'mif',
             'video/quicktime'                                                           => 'mov',
             'video/x-sgi-movie'                                                         => 'movie',
             'audio/mpeg'                                                                => 'mp3',
             'audio/mpg'                                                                 => 'mp3',
             'audio/mpeg3'                                                               => 'mp3',
             'audio/mp3'                                                                 => 'mp3',
             'video/mp4'                                                                 => 'mp4',
             'video/mpeg'                                                                => 'mpeg',
             'application/oda'                                                           => 'oda',
             'audio/ogg'                                                                 => 'ogg',
             'video/ogg'                                                                 => 'ogg',
             'application/ogg'                                                           => 'ogg',
             'application/x-pkcs10'                                                      => 'p10',
             'application/pkcs10'                                                        => 'p10',
             'application/x-pkcs12'                                                      => 'p12',
             'application/x-pkcs7-signature'                                             => 'p7a',
             'application/pkcs7-mime'                                                    => 'p7c',
             'application/x-pkcs7-mime'                                                  => 'p7c',
             'application/x-pkcs7-certreqresp'                                           => 'p7r',
             'application/pkcs7-signature'                                               => 'p7s',
             'application/pdf'                                                           => 'pdf',
             'application/octet-stream'                                                  => 'pdf',
             'application/x-x509-user-cert'                                              => 'pem',
             'application/x-pem-file'                                                    => 'pem',
             'application/pgp'                                                           => 'pgp',
             'application/x-httpd-php'                                                   => 'php',
             'application/php'                                                           => 'php',
             'application/x-php'                                                         => 'php',
             'text/php'                                                                  => 'php',
             'text/x-php'                                                                => 'php',
             'application/x-httpd-php-source'                                            => 'php',
             'image/png'                                                                 => 'png',
             'image/x-png'                                                               => 'png',
             'application/powerpoint'                                                    => 'ppt',
             'application/vnd.ms-powerpoint'                                             => 'ppt',
             'application/vnd.ms-office'                                                 => 'ppt',
             'application/msword'                                                        => 'doc',
             'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
             'application/x-photoshop'                                                   => 'psd',
             'image/vnd.adobe.photoshop'                                                 => 'psd',
             'audio/x-realaudio'                                                         => 'ra',
             'audio/x-pn-realaudio'                                                      => 'ram',
             'application/x-rar'                                                         => 'rar',
             'application/rar'                                                           => 'rar',
             'application/x-rar-compressed'                                              => 'rar',
             'audio/x-pn-realaudio-plugin'                                               => 'rpm',
             'application/x-pkcs7'                                                       => 'rsa',
             'text/rtf'                                                                  => 'rtf',
             'text/richtext'                                                             => 'rtx',
             'video/vnd.rn-realvideo'                                                    => 'rv',
             'application/x-stuffit'                                                     => 'sit',
             'application/smil'                                                          => 'smil',
             'text/srt'                                                                  => 'srt',
             'image/svg+xml'                                                             => 'svg',
             'image/svg'                                                                 => 'svg',
             'application/x-shockwave-flash'                                             => 'swf',
             'application/x-tar'                                                         => 'tar',
             'application/x-gzip-compressed'                                             => 'tgz',
             'image/tiff'                                                                => 'tiff',
             'text/plain'                                                                => 'txt',
             'text/x-vcard'                                                              => 'vcf',
             'application/videolan'                                                      => 'vlc',
             'text/vtt'                                                                  => 'vtt',
             'audio/x-wav'                                                               => 'wav',
             'audio/wave'                                                                => 'wav',
             'audio/wav'                                                                 => 'wav',
             'application/wbxml'                                                         => 'wbxml',
             'video/webm'                                                                => 'webm',
             'audio/x-ms-wma'                                                            => 'wma',
             'application/wmlc'                                                          => 'wmlc',
             'video/x-ms-wmv'                                                            => 'wmv',
             'video/x-ms-asf'                                                            => 'wmv',
             'application/xhtml+xml'                                                     => 'xhtml',
             'application/excel'                                                         => 'xl',
             'application/msexcel'                                                       => 'xls',
             'application/x-msexcel'                                                     => 'xls',
             'application/x-ms-excel'                                                    => 'xls',
             'application/x-excel'                                                       => 'xls',
             'application/x-dos_ms_excel'                                                => 'xls',
             'application/xls'                                                           => 'xls',
             'application/x-xls'                                                         => 'xls',
             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'         => 'xlsx',
             'application/vnd.ms-excel'                                                  => 'xlsx',
             'application/xml'                                                           => 'xml',
             'text/xml'                                                                  => 'xml',
             'text/xsl'                                                                  => 'xsl',
             'application/xspf+xml'                                                      => 'xspf',
             'application/x-compress'                                                    => 'z',
             'application/x-zip'                                                         => 'zip',
             'application/zip'                                                           => 'zip',
             'application/x-zip-compressed'                                              => 'zip',
             'application/s-compressed'                                                  => 'zip',
             'multipart/x-zip'                                                           => 'zip',
             'text/x-scriptzsh'                                                          => 'zsh',
         ];

         return isset($mime_map[$mime]) === true ? $mime_map[$mime] : false;
     }

}
