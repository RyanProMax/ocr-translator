import { useEffect, useState } from 'react';
import { OCRType } from '../server';
import { getUserStore, setUserStore } from '../utils';

const storeKey = 'currentOCR';
const defaultOCRType = OCRType.Tesseract;

export default () => {
  const [currentOCR, setCurrentOCR] = useState(defaultOCRType);

  const changeCurrentOCR = (type: OCRType) => {
    setCurrentOCR(type);
    setUserStore(storeKey, type);
  };

  useEffect(() => {
    (async () => {
      const storeCurrentOCR = (await getUserStore(storeKey)) || defaultOCRType;
      if (storeCurrentOCR !== currentOCR) {
        changeCurrentOCR(storeCurrentOCR);
      }
    })();
  }, []);

  return { currentOCR, changeCurrentOCR };
};
