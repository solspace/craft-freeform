import type Freeform from '@components/front-end/plugin/freeform';

export type FreeformOptions = {
  ajax?: boolean;
  disableReset?: boolean;
  disableSubmit?: boolean;
  autoScroll?: boolean;
  scrollToAnchor?: boolean;
  scrollOffset?: number;
  scrollElement?: HTMLElement | Window | null;
  showProcessingSpinner?: boolean;
  showProcessingText?: boolean;
  processingText?: string;
  prevButtonName?: string;

  skipHtmlReload: boolean;

  successBannerMessage?: string;
  errorBannerMessage?: string;

  errorClassBanner?: string;
  errorClassList?: string;
  errorClassField?: string;
  successClassBanner?: string;

  removeMessages?: () => void;
  renderSuccess?: () => void;
  renderFormErrors?: (errors: string[]) => void;
  renderFieldErrors?: (errors: Record<string, string[]>) => void;
};

export type FreeformHandlerConstructor = new (freeform: Freeform) => FreeformHandler;

export interface FreeformHandler {
  reload: () => void;
}

export type FreeformEventParameters<T> = {
  bubbles?: boolean;
  cancelable?: boolean;
} & T;

declare global {
  interface Window {
    freeform: {
      captchas?: {
        loaders: Map<string, (event?: Event) => void>;
        listeners: WeakSet<HTMLFormElement>;
        loaderPromises: Map<string, Promise<void>>;
      };
    };
  }
}
