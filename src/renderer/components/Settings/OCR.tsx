import { Form, Radio, Input } from '@arco-design/web-react';
import { useEffect, useRef } from 'react';
import useOCR from 'src/renderer/hooks/useOCR';
import { OCRType } from 'src/renderer/server';

const FormItem = Form.Item;

export default () => {
  const [form] = Form.useForm();
  const secretRef = useRef<any>();
  const { type, getOCRSecret, setOCRSecret } = useOCR();

  const onChangeType = (value: OCRType) => {
    console.log('value', value);
  };

  const onChangeForm = (changeValue: Record<string, unknown>) => {
    secretRef.current = {
      ...secretRef.current,
      ...changeValue,
    };
    return setOCRSecret(secretRef.current);
  };

  useEffect(() => {
    (async () => {
      const OCRSecret = await getOCRSecret();
      if (OCRSecret) {
        secretRef.current = OCRSecret;
        form.setFieldsValue({
          client_id: OCRSecret.client_id,
          client_secret: OCRSecret.client_secret,
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
