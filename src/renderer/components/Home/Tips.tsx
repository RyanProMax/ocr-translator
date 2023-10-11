import classnames from 'classnames';
import './Tips.less';

export default ({ type, message }: ITips) => {
  return (
    <div className={classnames('tips', `tips--${type}`, {
      'tips--hidden': !message
    })}>
      {message}
    </div>
  );
};
