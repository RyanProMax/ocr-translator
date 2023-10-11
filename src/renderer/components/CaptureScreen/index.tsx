import useDrag from 'src/renderer/hooks/useDrag';
import './index.less';

export default () => {
  const { mouseEvent } = useDrag();
  return (
    <div {...mouseEvent} className='capture-screen' />
  );
};
