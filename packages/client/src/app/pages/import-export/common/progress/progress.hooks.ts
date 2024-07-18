import { useEffect, useRef, useState } from 'react';

type Callback = (event: MessageEvent) => void;
type Listener = [string, Callback];
type ListenerAttacher = (eventName: string, callback: Callback) => void;

type ReturnType = {
  progress: {
    active: boolean;
    displayProgress: boolean;
    showDone: boolean;
    progress: [number, number];
    total: [number, number];
    info: string | undefined;
    errors: string[];
  };
  triggerProgress: (url?: string) => void;
  clearProgress: () => void;
  attachListener: ListenerAttacher;
};

export const useProgressEvent = (): ReturnType => {
  const source = useRef<EventSource>();
  const [url, setUrl] = useState<string>();

  const [active, setActive] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [total, setTotal] = useState<[number, number]>([0, 0]);
  const [info, setInfo] = useState<string>();
  const [errors, setErrors] = useState<string[]>([]);
  const [listeners, setListeners] = useState<Array<Listener>>([]);

  const triggerProgress = (url?: string): void => {
    setUrl(url);
  };

  const clearProgress = (): void => {
    setUrl(undefined);
    setProgress([0, 0]);
    setTotal([0, 0]);

    setActive(true);
    setInfo(undefined);
  };

  const attachListener: ListenerAttacher = (eventName, callback): void => {
    setListeners((prev) => [...(prev || []), [eventName, callback]]);
  };

  const attachListeners = (source: EventSource): void => {
    source.onopen = () => {
      setDisplayProgress(true);
    };

    source.onerror = () => {
      console.error('An error occurred during import');
      source.close();
      setActive(false);
      setDisplayProgress(false);
    };

    source.addEventListener('progress', (event) => {
      const progress = parseInt(event.data);
      setProgress((prev) => [prev[0] + progress, prev[1] + progress]);
    });

    source.addEventListener('total', (event) => {
      setTotal([parseInt(event.data), 0]);
      setErrors([]);
    });

    source.addEventListener('info', (event) => {
      setInfo(event.data);
    });

    source.addEventListener('err', (event) => {
      setErrors((prev) => [...prev, JSON.parse(event.data)]);
    });

    source.addEventListener('reset', (event) => {
      setTotal((prev) => [prev[0], parseInt(event.data)]);
      setProgress((prev) => [prev[0], 0]);
    });

    source.addEventListener('exit', () => {
      source.close();
      setDisplayProgress(false);
      setActive(false);
      setShowDone(true);
      setTimeout(() => {
        setShowDone(false);
      }, 5000);
    });

    listeners.forEach(([eventName, callback]) => {
      source.addEventListener(eventName, callback);
    });
  };

  useEffect(() => {
    if (source.current) {
      source.current.close();
    }

    if (!url) {
      return;
    }

    source.current = new EventSource(url);
    attachListeners(source.current);
  }, [url]);

  return {
    progress: {
      active,
      displayProgress,
      showDone,
      progress,
      total,
      info,
      errors,
    },
    triggerProgress,
    clearProgress,
    attachListener,
  };
};
