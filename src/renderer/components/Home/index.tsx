import { useCallback, useEffect, useRef, useState } from 'react';
import { round, throttle } from 'lodash-es';
import classnames from 'classnames';
import log from 'electron-log/renderer';

import { ipcRenderer, loadStream } from 'src/renderer/utils';
import { ServerConfig, TranslatorType, server } from 'src/renderer/server';
import { Channels } from 'src/common/constant';

import useDrag from 'src/renderer/hooks/useDrag';
import useSettings from 'src/renderer/hooks/useSettings';
import useOCR from 'src/renderer/hooks/useOCR';
import useTranslator from 'src/renderer/hooks/useTranslator';
import useMode, { Mode } from 'src/renderer/hooks/useMode';

import ControlBar, { Icon } from './ControlBar';
import Tips from './Tips';
import { DEFAULT_STYLE, DEFAULT_TEXT, DEFAULT_TIPS, LooperStatus } from './constant';

import './index.less';

const homeLogger = log.scope('home');

export default () => {
  const { currentMode, toggleMode } = useMode();
  const { cursorEnter, mouseEvent } = useDrag();
  const { currentOCR } = useOCR();
  const { currentTranslator } = useTranslator();
  useSettings(useCallback((_, data) => {
    serverConfigRef.current = {
      ...serverConfigRef.current,
      ...data,
    };
  }, []));

  const serverConfigRef = useRef<Partial<ServerConfig>>({
    ocrType: currentOCR,
    translatorType: currentTranslator,
  });
  const [content, setContent] = useState(DEFAULT_TEXT);
  const [tips, setTips] = useState(DEFAULT_TIPS);
  const [isResize, setIsResize] = useState(false);
  const [looperStatus, setLooperStatus] = useState(LooperStatus.Stop);
  const showControlBar = cursorEnter || isResize;

  const showResultTips = (startResult: ServiceStartResult) => {
    const {
      result, looperCost, captureCost, ocrCost, translatorCost
    } = startResult;
    setContent(result.map(text => ({
      text,
      style: DEFAULT_STYLE,
    })));
    return setTips({
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
  };

  const toggleStart = async () => {
    switch (looperStatus) {
      case LooperStatus.Stop: {
        setLooperStatus(LooperStatus.Loading);
        if (!serverConfigRef.current.video) {
          const result = await ipcRenderer.invoke(Channels.GetScreenSource);
          homeLogger.info('invoke GetScreenSource', result);
          const { errorMessage, data } = result;
          if (errorMessage) {
            setLooperStatus(LooperStatus.Stop);
            throw new Error(errorMessage);
          }
          const { id, bounds } = data;
          const video = await loadStream(id);
          serverConfigRef.current = {
            ...serverConfigRef.current,
            video, bounds,
          };
        }
        server.update(serverConfigRef.current);
        if (currentMode === Mode.Manual) {
          const startResult = await server.start();
          showResultTips(startResult);
          setLooperStatus(LooperStatus.Stop);
        } else {
          server.startLooper({
            timeout: 200,
            onSuccess: (startResult) => {
              showResultTips(startResult);
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

  const onClickIcon = (type: Icon, ...args: unknown[]) => {
    try {
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
        case Icon.Switch: {
          return toggleMode(args[0] as boolean);
        }
        default: return;
      }
    } catch (e) {
      homeLogger.error(e);
      setTips({
        type: 'error',
        message: `Error: ${(e as any).message}`,
      });
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
        currentMode={currentMode}
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
