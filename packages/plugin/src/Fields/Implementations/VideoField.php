<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Translatable;

#[Type(name: 'Video', typeShorthand: 'video', iconPath: __DIR__.'/Icons/video.svg', previewTemplatePath: __DIR__.'/PreviewTemplates/video.ejs')]
class VideoField extends ContentField
{
    #[Translatable]
    #[Input\Text(label: 'Video URL', instructions: 'Paste a YouTube or Vimeo video URL. The player loads on the published form; the builder and Preview show a placeholder.', order: 6)]
    protected string $url = '';

    #[Translatable]
    #[Input\Text(label: 'Video Title', instructions: 'A descriptive title for visitors using assistive technology.', order: 7)]
    protected string $videoTitle = 'Video';

    #[Input\Select(label: 'Aspect Ratio', order: 8, options: ['landscape' => 'Widescreen (16:9)', 'photo' => 'Standard (4:3)', 'square' => 'Square (1:1)', 'portrait' => 'Portrait (9:16)'])]
    protected string $aspectRatio = 'landscape';

    #[Input\Select(label: 'Alignment', order: 9, options: ['left' => 'Left', 'center' => 'Center', 'right' => 'Right'])]
    protected string $alignment = 'left';

    #[Input\Integer(label: 'Maximum Width', instructions: 'Use 0 to fill the available width. Videos shrink to fit smaller screens.', order: 10, min: 0, max: 4000, unit: 'px')]
    protected int $maximumWidth = 0;

    #[Input\Select(label: 'Playback', order: 11, options: ['manual' => 'Click to play', 'autoplay' => 'Autoplay (muted)'])]
    protected string $playback = 'manual';

    #[Input\Select(label: 'Player Controls', order: 12, options: ['show' => 'Show', 'hide' => 'Hide'])]
    protected string $playerControls = 'show';

    #[Input\Select(label: 'Loop', order: 13, options: ['once' => 'Play once', 'loop' => 'Loop'])]
    protected string $loopPlayback = 'once';

    #[Input\Integer(label: 'Start Time', instructions: 'Use 0 to start at the beginning.', order: 14, min: 0, max: 86400, unit: 'seconds')]
    protected int $startTime = 0;

    public function getFrameStyle(): string
    {
        $width = max(0, min(4000, $this->maximumWidth));
        $ratio = ['landscape' => '16 / 9', 'photo' => '4 / 3', 'square' => '1 / 1', 'portrait' => '9 / 16'][$this->aspectRatio] ?? '16 / 9';
        $left = \in_array($this->alignment, ['center', 'right'], true) ? 'auto' : '0';
        $right = 'right' === $this->alignment ? '0' : 'auto';

        return 'width:100%;max-width:'.($width ? $width.'px' : '100%').';margin-left:'.$left.';margin-right:'.$right.';aspect-ratio:'.$ratio.';box-sizing:border-box;';
    }

    public function getType(): string
    {
        return 'video';
    }

    public function getEmbedUrl(): ?string
    {
        $url = trim($this->getTranslationTable()->get('url', $this->url));
        if (preg_match('/[\x00-\x20\x7f\\\]/', $url)) {
            return null;
        }
        $parts = parse_url($url);
        if (!$parts || 'https' !== strtolower($parts['scheme'] ?? '') || isset($parts['user']) || isset($parts['pass']) || (isset($parts['port']) && 443 !== $parts['port'])) {
            return null;
        }
        $host = strtolower($parts['host'] ?? '');
        $path = trim($parts['path'] ?? '', '/');
        parse_str($parts['query'] ?? '', $query);
        if (\in_array($host, ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be', 'www.youtu.be'], true)) {
            $id = \in_array($host, ['youtu.be', 'www.youtu.be'], true) ? $path : ('watch' === $path ? ($query['v'] ?? '') : (preg_match('~^(?:embed|shorts|live)/([^/]+)$~D', $path, $matches) ? $matches[1] : ''));

            return \is_string($id) && preg_match('/^[a-zA-Z0-9_-]{11}$/D', $id) ? $this->playbackUrl('https://www.youtube-nocookie.com/embed/'.$id, 'youtube', $id) : null;
        }
        if (\in_array($host, ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'], true) && preg_match('~^(?:video/)?([0-9]+)(?:/([a-zA-Z0-9]+))?$~D', $path, $matches)) {
            $hash = $query['h'] ?? ($matches[2] ?? '');

            return $this->playbackUrl('https://player.vimeo.com/video/'.$matches[1].(\is_string($hash) && preg_match('/^[a-zA-Z0-9]+$/D', $hash) ? '?h='.$hash : ''), 'vimeo');
        }

        return null;
    }

    protected function getInputHtml(): string
    {
        $url = $this->getEmbedUrl();
        if (!$url) {
            return '';
        }
        $title = $this->getTranslationTable()->get('videoTitle', $this->videoTitle);
        $style = $this->getFrameStyle();
        if ($this->getForm()->isPreview()) {
            return Html::tag('div', Html::tag('strong', Html::encode($title)).Html::tag('span', Html::encode(\Craft::t('freeform', 'Video player loads on the published form.'))), [
                'class' => 'freeform-video-placeholder',
                'style' => $style.'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;background:#e2e8f0;color:#334155;border-radius:6px;',
            ]);
        }

        return Html::tag('iframe', '', [
            'src' => $url,
            'title' => $title,
            'style' => $style.'display:block;border:0;',
            'loading' => 'lazy',
            'allow' => ('autoplay' === $this->playback ? 'autoplay; ' : '').'fullscreen; picture-in-picture; encrypted-media',
            'allowfullscreen' => true,
            'referrerpolicy' => 'strict-origin-when-cross-origin',
        ]);
    }

    private function playbackUrl(string $url, string $provider, ?string $id = null): string
    {
        $parameters = [];
        if ('hide' === $this->playerControls) {
            $parameters['controls'] = 0;
        }
        if ('autoplay' === $this->playback) {
            $parameters['autoplay'] = 1;
            $parameters['youtube' === $provider ? 'mute' : 'muted'] = 1;
        }
        if ('loop' === $this->loopPlayback) {
            $parameters['loop'] = 1;
            if ('youtube' === $provider) {
                $parameters['playlist'] = $id;
            }
        }
        $start = max(0, min(86400, $this->startTime));
        if ($start && 'youtube' === $provider) {
            $parameters['start'] = $start;
        }
        if ($parameters) {
            $url .= (str_contains($url, '?') ? '&' : '?').http_build_query($parameters, '', '&', \PHP_QUERY_RFC3986);
        }

        return $url.($start && 'vimeo' === $provider ? '#t='.$start.'s' : '');
    }
}
