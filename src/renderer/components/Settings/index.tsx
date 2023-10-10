import usePackageJson from 'src/renderer/hooks/usePackageJson';

import './index.less';

export default () => {
  const packageJson = usePackageJson();

  return (
    <div className='settings'>
      {JSON.stringify(packageJson)}
    </div >
  );
};
