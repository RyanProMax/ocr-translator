import { useEffect, useState } from 'react';
import { TranslatorType } from '../server';
import { getUserStore, setUserStore, ipcRenderer } from '../utils';
import { Channels } from 'src/common/constant';

const storeKey = 'currentTranslator';
const defaultOCRType = TranslatorType.Baidu;

export default () => {
  const [currentTranslator, setCurrentTranslator] = useState(defaultOCRType);

  const changeCurrentTranslator = (type: TranslatorType) => {
    setCurrentTranslator(type);
    setUserStore(storeKey, type);
    ipcRenderer.send(Channels.Broadcast, Channels.UpdateSettings, {
      translatorType: type,
    });
  };

  useEffect(() => {
    (async () => {
      const storeCurrentTranslator = (await getUserStore(storeKey)) || defaultOCRType;
      if (storeCurrentTranslator !== currentTranslator) {
        changeCurrentTranslator(storeCurrentTranslator);
      }
    })();
  }, []);

  return { currentTranslator, changeCurrentTranslator };
};
