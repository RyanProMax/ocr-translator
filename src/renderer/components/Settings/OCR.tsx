import { Form, Radio, Input } from '@arco-design/web-react';
import { useEffect, useRef, useState } from 'react';

import { ocrInstance, OCRType } from 'src/renderer/utils/OCR';

const FormItem = Form.Item;

export default () => {
  const [form] = Form.useForm();
  const [type] = useState(ocrInstance.type);
  const secretRef = useRef<any>();

  const onChangeType = (value: OCRType) => {
    console.log('value', value);
  };

  const onChangeForm = (changeValue: Record<string, unknown>) => {
    secretRef.current = {
      ...secretRef.current,
      ...changeValue,
    };
    ocrInstance.setSecret(secretRef.current);
  };

  useEffect(() => {
    (async () => {
      const secret = await ocrInstance.getSecret();
      if (secret) {
        secretRef.current = secret;
        form.setFieldsValue({
          client_id: secret.client_id,
          client_secret: secret.client_secret,
        });
      }
    })();
  }, []);

  return (
    <div className='settings-main-content settings-OCR'>
      <Form
        form={form}
        autoComplete='off'
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 16,
        }}
        onChange={onChangeForm}
        className='settings-OCR__form'
      >
        <FormItem label='Type'>
          <Radio.Group
            type='button'
            options={Object.entries(OCRType).map(([key, value]) => ({
              label: key,
              value,
              disabled: value !== OCRType.Baidu
            }))}
            value={type}
            onChange={onChangeType}
          />
        </FormItem>
        <FormItem label='client_id' field='client_id'>
          <Input.Password
            defaultVisibility={false}
            placeholder='please enter your client_id.'
          />
        </FormItem>
        <FormItem label='client_secret' field='client_secret'>
          <Input.Password
            defaultVisibility={false}
            placeholder='please enter your client_secret.'
          />
        </FormItem>
      </Form>
    </div>
  );
};
