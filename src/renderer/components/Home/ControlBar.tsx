// import log from 'electron-log/renderer';
// const homeLogger = log.scope('home');

import classnames from 'classnames';

export default ({ show }: {
  show: boolean
}) => {
  return (
    <div className={classnames('home-control-bar', {
      'home-control-bar--hidden': !show
    })}>
      X
    </div>
  );
};
