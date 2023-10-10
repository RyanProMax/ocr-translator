import { useEffect, useState } from 'react';
import { pick } from 'lodash-es';

import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';

export default () => {
  const [packageJson, setPackageJson] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const _packageJson = await ipcRenderer.invoke(Channels.GetPackageJson);
      setPackageJson(_packageJson);
    })();
  }, []);

  console.log('packageJson', JSON.parse(packageJson));
  return pick(JSON.parse(packageJson), ['name', 'description', 'version', 'license']);
};
