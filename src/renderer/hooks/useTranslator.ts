import { useEffect, useState } from 'react';
import { TranslatorType } from '../server';
import { getUserStore, setUserStore } from '../utils';

const storeKey = 'currentTranslator';
const defaultOCRType = TranslatorType.Baidu;

export default () => {
  const [currentTranslator, setCurrentTranslator] = useState(defaultOCRType);

  const changeCurrentTranslator = (type: TranslatorType) => {
    setCurrentTranslator(type);
    setUserStore(storeKey, type);
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
