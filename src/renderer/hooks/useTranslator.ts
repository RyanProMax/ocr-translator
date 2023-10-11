import { useMemo, useState } from 'react';
import { BaiduApp } from '../servers/Baidu';
import { TranslatorType } from '../servers/Server';
import { getUserStore, setUserStore } from '../utils';

export default () => {
  const [type, setType] = useState(TranslatorType.Baidu);

  const secretKey = useMemo(() => {
    switch (type) {
      case TranslatorType.Baidu: return BaiduApp.Translator;
      default: return false;
    }
  }, [type]);

  const getTranslatorSecret = () => {
    return getUserStore(secretKey);
  };

  const setTranslatorSecret = async (updateValue: BaiduOCRSecret) => {
    const prevValue = await getTranslatorSecret();
    return setUserStore(secretKey, {
      ...prevValue,
      ...updateValue,
    });
  };

  return { type, setType, getTranslatorSecret, setTranslatorSecret };
};
