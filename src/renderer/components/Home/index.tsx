import { useEffect, useState } from 'react';
import { round } from 'lodash-es';
import classnames from 'classnames';
import log from 'electron-log/renderer';

import { ipcRenderer, loadStream } from 'src/renderer/utils';
import useDrag from 'src/renderer/hooks/useDrag';
import { Channels } from 'src/common/constant';
import { server } from 'src/renderer/servers/Server';

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

  const onClickIcon = async (type: Icon) => {
    homeLogger.info('onClickIcon', type);
    switch (type) {
      case Icon.ScreenCapture: {
        return ipcRenderer.send(Channels.CropScreenShow);
      }
      case Icon.TriggerStart: {
        if (!start) {
          const result = await ipcRenderer.invoke(Channels.GetScreenSource);
          homeLogger.info('invoke GetScreenSource', result);
          const { errorMessage, data } = result;
          if (errorMessage) {
            setTips({ type: 'error', message: `Error: ${errorMessage}` });
          } else {
            const { id, bounds } = data;
            server.startLooper({
              video: await loadStream(id),
              timeout: 200,
              bounds,
              onSuccess: ({
                result, captureCost, looperCost, ocrCost, translatorCost
              }) => {
                setContent(result.map(text => ({
                  text,
                  fontSize: 16
                })));
                setTips({
                  type: 'info',
                  message: `cost ${round(looperCost / 1000, 2)}s` +
                    `(capture: ${captureCost}ms,` +
                    `OCR: ${ocrCost}ms,` +
                    `translator: ${translatorCost}ms)`
                });
              },
              onError: error => {
                setTips({
                  type: 'error',
                  message: `Error: ${error}`,
                });
              }
            });
            setStart(true);
          }
        } else {
          // stop
          server.stopLooper();
          setStart(false);
          setContent(DEFAULT_TEXT);
          setTips(DEFAULT_TIPS);
        }
        return;
      }
      case Icon.Close: {
        return ipcRenderer.send(Channels.Quit);
      }
      case Icon.Settings: {
        return ipcRenderer.send(Channels.OpenSettings);
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
