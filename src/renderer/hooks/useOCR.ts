import { useMemo, useState } from 'react';
import { BaiduApp } from '../servers/Baidu';
import { OCRType } from '../servers/Server';
import { getUserStore, setUserStore } from '../utils';

export default () => {
  const [type, setType] = useState(OCRType.Baidu);

  const secretKey = useMemo(() => {
    switch (type) {
      case OCRType.Baidu: return BaiduApp.OCR;
      default: return false;
    }
  }, [type]);

  const getOCRSecret = () => {
    return getUserStore(secretKey);
  };

  const setOCRSecret = async (updateValue: BaiduOCRSecret) => {
    const prevValue = await getOCRSecret();
    return setUserStore(secretKey, {
      ...prevValue,
      ...updateValue,
    });
  };

  return { type, setType, getOCRSecret, setOCRSecret };
};
