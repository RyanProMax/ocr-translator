import classnames from 'classnames';
import './Tips.less';

export type ITips = {
  type: 'info' | 'error'
  message: string
}

export default ({ type, message }: ITips) => {
  return (
    <div className={classnames('tips', `tips--${type}`, {
      'tips--hidden': !message
    })}>
      {message}
    </div>
  );
};
