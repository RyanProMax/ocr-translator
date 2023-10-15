import { useEffect, useState } from 'react';

import { getUserStore, setUserStore } from '../utils';

export enum Mode {
  Auto = 'Auto',
  Manual = 'Manual',
}

const storeKey = 'currentMode';
const defaultMode = Mode.Manual;

export default () => {
  const [currentMode, setCurrentMode] = useState(defaultMode);

  const changeCurrentMode = (mode: Mode) => {
    setCurrentMode(mode);
    setUserStore(storeKey, mode);
  };

  const toggleMode = (value: boolean) => {
    return changeCurrentMode(value ? Mode.Auto : Mode.Manual);
  };

  useEffect(() => {
    (async () => {
      const storeCurrentMode = (await getUserStore(storeKey)) || defaultMode;
      if (storeCurrentMode !== currentMode) {
        changeCurrentMode(storeCurrentMode);
      }
    })();
  }, []);

  return { currentMode, toggleMode };
};
