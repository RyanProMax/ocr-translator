import { Form, Switch } from '@arco-design/web-react';

import useOCR from 'src/renderer/hooks/useOCR';
import { OCRType } from 'src/renderer/server';

const FormItem = Form.Item;

export default () => {
  const [form] = Form.useForm();
  const { currentOCR, changeCurrentOCR } = useOCR();

  return (
    <div className='settings-OCR__form-wrapper'>
      <p className='settings-OCR__form-desc'>
        本地OCR，免费使用，依赖自身电脑性能
      </p>
      <Form
        form={form}
        autoComplete='off'
        labelAlign='left'
        labelCol={{
          span: 5,
        }}
        wrapperCol={{
          span: 19,
        }}
        className='settings-OCR__form'
      >
        <FormItem label='使用本地OCR' >
          <Switch
            checked={currentOCR === OCRType.Tesseract}
            checkedText='ON'
            uncheckedText='OFF'
            onChange={(value) => {
              changeCurrentOCR(value ? OCRType.Tesseract : OCRType.Baidu);
            }}
          />
        </FormItem>
      </Form>
    </div>
  );
};
