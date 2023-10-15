import { useCallback, useEffect, useState } from 'react';
import { round, throttle } from 'lodash-es';
import classnames from 'classnames';
import log from 'electron-log/renderer';

import { ipcRenderer, loadStream } from 'src/renderer/utils';
import { TranslatorType, server } from 'src/renderer/server';
import { Channels } from 'src/common/constant';
import useDrag from 'src/renderer/hooks/useDrag';
import useBounds from 'src/renderer/hooks/useBounds';
import useOCR from 'src/renderer/hooks/useOCR';
import useTranslator from 'src/renderer/hooks/useTranslator';

import ControlBar, { Icon } from './ControlBar';
import Tips from './Tips';
import { DEFAULT_STYLE, DEFAULT_TEXT, DEFAULT_TIPS, LooperStatus } from './constant';

import './index.less';

const homeLogger = log.scope('home');

export default () => {
  const { cursorEnter, mouseEvent } = useDrag();
  const [content, setContent] = useState(DEFAULT_TEXT);
  const [tips, setTips] = useState(DEFAULT_TIPS);
  const [isResize, setIsResize] = useState(false);
  const [looperStatus, setLooperStatus] = useState(LooperStatus.Stop);
  const showControlBar = cursorEnter || isResize;
  useBounds(useCallback((bounds) => {
    server.update({ bounds });
  }, []));
  const { currentOCR } = useOCR();
  const { currentTranslator } = useTranslator();

  const toggleStart = async () => {
    switch (looperStatus) {
      case LooperStatus.Stop: {
        setLooperStatus(LooperStatus.Loading);
        const result = await ipcRenderer.invoke(Channels.GetScreenSource);
        homeLogger.info('invoke GetScreenSource', result);
        const { errorMessage, data } = result;
        if (errorMessage) {
          setTips({ type: 'error', message: `Error: ${errorMessage}` });
          setLooperStatus(LooperStatus.Stop);
        } else {
          const { id, bounds } = data;
          server.update({
            ocrType: currentOCR,
            translatorType: currentTranslator,
            bounds,
          });
          server.startLooper({
            video: await loadStream(id),
            timeout: 200,
            onSuccess: ({
              result, captureCost, looperCost, ocrCost, translatorCost
            }) => {
              setContent(result.map(text => ({
                text,
                style: DEFAULT_STYLE,
              })));
              setTips({
                type: 'info',
                message: `耗时: ${round(looperCost / 1000, 2)}s` +
                  ` (画面捕获: ${captureCost}ms,` +
                  (ocrCost > 0
                    ? ` 文字识别: ${ocrCost}ms,`
                    : ' 文字识别: 跳过,'
                  ) +
                  (server.translatorType === TranslatorType.None
                    ? ' 未启用翻译, 只展示文字识别结果'
                    : translatorCost > 0
                      ? ` 翻译: ${translatorCost}ms)`
                      : ' 翻译: 跳过'
                  )
              });
            },
            onError: error => {
              setTips({
                type: 'error',
                message: `Error: ${error}`,
              });
              server.stopLooper();
              setLooperStatus(LooperStatus.Stop);
            }
          });
          setLooperStatus(LooperStatus.Running);
        }
        break;
      }
      case LooperStatus.Running: {
        // stop
        server.stopLooper();
        setContent(DEFAULT_TEXT);
        setTips(DEFAULT_TIPS);
        setLooperStatus(LooperStatus.Stop);
        break;
      }
      default: break;
    }
  };

  const onClickIcon = (type: Icon) => {
    homeLogger.info('onClickIcon', type);
    switch (type) {
      case Icon.ScreenCapture: {
        return ipcRenderer.send(Channels.CropScreenShow);
      }
      case Icon.TriggerStart: {
        return toggleStart();
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
    const handleResize = throttle((_: Electron.IpcRendererEvent, _isResize: boolean) => {
      // console.log('handleResize', handleResize);
      setIsResize(_isResize);
    }, 50);

    ipcRenderer.on(Channels.Resize, handleResize);

    return () => {
      ipcRenderer.removeListener(Channels.Resize, handleResize);
    };
  }, []);

  return (
    <div {...mouseEvent} className={classnames('home', {
      'home--show-control-bar': showControlBar
    })}>
      <ControlBar
        show={showControlBar}
        looperStatus={looperStatus}
        onClickIcon={onClickIcon}
      />
      <div className='home-content'>
        {content.map(({ text, style }, idx) => (
          <span key={idx} className='home-content__item' style={style}>
            {text}
          </span>
        ))}
      </div>
      <Tips type={tips.type} message={tips.message} />
    </div>
  );
};
