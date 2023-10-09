import { useEffect, useRef, useState } from 'react';
import { Rectangle } from 'electron/renderer';
import classnames from 'classnames';
import { round } from 'lodash-es';
import log from 'electron-log/renderer';

import { captureVideo, ipcRenderer, loadStream } from 'src/renderer/utils';
import useDrag from 'src/renderer/hooks/useDrag';
import { Channels } from 'src/common/constant';
import { ocrInstance } from 'src/renderer/utils/OCR';
import { translation } from 'src/renderer/utils/Translation';

import ControlBar, { Icon } from './ControlBar';
import Tips, { ITips } from './Tips';

import './index.less';

const homeLogger = log.scope('home');

const DEFAULT_TEXT = [
  { text: 'Welcome to  OCR Translator.', fontSize: 20 },
  { text: '1. click [capture screen] icon', fontSize: 16 },
  { text: '2. select region', fontSize: 16 },
  { text: '3. click [start]', fontSize: 16 },
];

const DEFAULT_TIPS: ITips = { type: 'info', message: '' };

export default () => {
  const [content, setContent] = useState(DEFAULT_TEXT);
  const [tips, setTips] = useState<ITips>(DEFAULT_TIPS);
  const [cursorEnter, setCursorEnter] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const [start, setStart] = useState(false);
  const showControlBar = cursorEnter || isResize;
  const looperRef = useRef<{ start: boolean, timer: number | null }>({
    start: false,
    timer: null
  });

  const clearTimer = () => {
    if (looperRef.current.timer) {
      window.clearTimeout(looperRef.current.timer);
      looperRef.current.timer = null;
    }
  };

  // capture desktop stream
  const looper = async (params: {
    video: HTMLVideoElement,
    timeout?: number
    bounds?: Rectangle
  }) => {
    try {
      const startTime = Date.now();
      const { video, timeout = 0, bounds } = params;

      // capture frame
      const { base64 } = captureVideo({ video, bounds });
      const captureCost = Date.now() - startTime;

      // OCR
      const ocrStartTime = Date.now();
      const words_result = await ocrInstance.fetchOCR({
        image: base64
      });
      const ocrCost = Date.now() - ocrStartTime;

      // Translation
      if (words_result.length > 0) {
        const translationStartTime = Date.now();
        const trans_result = await translation.fetchTranslation({
          q: words_result.map(o => o.words).join(' '),
        });
        const translationCost = Date.now() - translationStartTime;
        setContent(trans_result.map(({ dst }) => ({
          text: dst,
          fontSize: 16
        })));

        const cost = Date.now() - startTime;
        console.log('looper cost', cost);
        setTips({
          type: 'info',
          message: `cost ${round(cost / 1000, 2)}s (capture: ${captureCost}ms, OCR: ${ocrCost}ms, translation: ${translationCost}ms)`
        });
      }
      if (timeout > 0 && looperRef.current.start) {
        clearTimer();
        looperRef.current.timer = window.setTimeout(() => {
          looper(params);
        }, timeout);
      }
    } catch (e) {
      homeLogger.error('looper error', e);
      setTips({
        type: 'error',
        message: `Error: ${(e as any).message}`,
      });
    }
  };

  const onClickIcon = async (type: Icon) => {
    homeLogger.info('onClickIcon', type);
    switch (type) {
      case Icon.ScreenCapture: {
        return ipcRenderer.send(Channels.CropScreenShow);
      }
      case Icon.TriggerStart: {
        if (!start) {
          looperRef.current.start = true;
          const result = await ipcRenderer.invoke(Channels.GetScreenSource);
          homeLogger.info('invoke GetScreenSource', result);
          const { errorMessage, data } = result;
          if (errorMessage) {
            setTips({ type: 'error', message: `Error: ${errorMessage}` });
          } else {
            setTips(DEFAULT_TIPS);
            const { id, bounds } = data;
            const video = await loadStream(id);
            looper({ video, timeout: 200, bounds });
            setStart(true);
          }
        } else {
          // stop
          looperRef.current.start = false;
          clearTimer();
          setStart(false);
          setContent(DEFAULT_TEXT);
          setTips(DEFAULT_TIPS);
        }
        return;
      }
      case Icon.Close: {
        return ipcRenderer.send(Channels.Quit);
      }
      case Icon.Setting: {
        return;
      }
      default: return;
    }
  };

  useEffect(() => {
    const handleResize = (_: Electron.IpcRendererEvent, _isResize: boolean) => {
      console.log('handleResize', handleResize);
      setIsResize(_isResize);
    };

    ipcRenderer.on(Channels.Resize, handleResize);

    return () => {
      ipcRenderer.removeListener(Channels.Resize, handleResize);
    };
  }, []);

  return (
    <div
      onMouseEnter={() => setCursorEnter(true)}
      onMouseLeave={() => setCursorEnter(false)}
      onMouseDown={() => useDrag(true)}
      onMouseUp={() => useDrag(false)}
      onContextMenu={() => useDrag(false)}
      className={classnames('home', {
        'home--show-control-bar': showControlBar
      })}
    >
      <ControlBar
        show={showControlBar}
        onClickIcon={onClickIcon}
      />
      <div className='home-content'>
        {content.map(({ text, fontSize }, idx) => (
          <span key={idx} className='home-content__item' style={{ fontSize }}>
            {text}
          </span>
        ))}
      </div>
      <Tips type={tips.type} message={tips.message} />
    </div>
  );
};
