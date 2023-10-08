import useDrag from 'src/renderer/hooks/useDrag';
import './index.less';

export default () => {
  return (
    <div
      onMouseDown={() => useDrag(true)}
      onMouseUp={() => useDrag(false)}
      onContextMenu={() => useDrag(false)}
      className='capture-screen'
    >
    </div >
  );
};
