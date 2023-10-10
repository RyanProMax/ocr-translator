import { Configuration } from '@rspack/cli';
import path from 'path';
import fse from 'fs-extra';
import keyBy from 'lodash/keyBy';

import { Pages } from '../common/constant';
import { removeFileExtname } from '../main/utils';

const htmlTemplate = path.join(__dirname, 'template.html');
const entryDir = path.join(__dirname, 'entry');
const files = fse.readdirSync(entryDir);
const entry = keyBy(
  files.map(f => path.join(entryDir, f)),
  filePath => removeFileExtname(filePath)
);
const html = Object.values(Pages).map(filename => ({
  template: htmlTemplate,
  filename,
  chunks: [removeFileExtname(filename)],
}));

const baseConfiguration: Configuration = {
  entry,
  resolve: {
    tsConfigPath: path.resolve(process.cwd(), './tsconfig.json'),
  },
  builtins: {
    html,
    pluginImport: [
      {
        libraryName: '@arco-design/web-react',
        libraryDirectory: 'es',
        style: true,
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.less$/,
        use: ['less-loader'],
        type: 'css',
      },
    ],
  }
};

export default baseConfiguration;
