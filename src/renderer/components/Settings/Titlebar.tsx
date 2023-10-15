import { IconClose } from '@arco-design/web-react/icon';

export default ({ title, onClose }: {
  title: string,
  onClose: () => unknown
}) => {
  return (
    <div className='settings-titlebar'>
      <span>{title}</span>
      <div className='settings-titlebar__icon-wrapper'>
        <div title='关闭' className='settings-titlebar__icon'>
          <IconClose onClick={onClose} />
        </div>
      </div>
    </div>
  );
};
