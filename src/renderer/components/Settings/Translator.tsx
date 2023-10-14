import { Form, Radio, Input } from '@arco-design/web-react';
import { useEffect, useRef } from 'react';
import useTranslator from 'src/renderer/hooks/useTranslator';
import { TranslatorType } from 'src/renderer/server';

const FormItem = Form.Item;

export default () => {
  const [form] = Form.useForm();
  const secretRef = useRef<any>();
  const { type, getTranslatorSecret, setTranslatorSecret } = useTranslator();

  const onChangeType = (value: TranslatorType) => {
    console.log('value', value);
  };

  const onChangeForm = (changeValue: Record<string, unknown>) => {
    secretRef.current = {
      ...secretRef.current,
      ...changeValue,
    };
    setTranslatorSecret(secretRef.current);
  };

  useEffect(() => {
    (async () => {
      const translatorSecret = await getTranslatorSecret();
      if (translatorSecret) {
        secretRef.current = translatorSecret;
        form.setFieldsValue({
          client_id: translatorSecret.client_id,
          client_secret: translatorSecret.client_secret,
        });
      }
    })();
  }, []);

  return (
    <div className='settings-main-content settings-translator'>
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
        className='settings-translator__form'
      >
        <FormItem label='Type'>
          <Radio.Group
            type='button'
            options={Object.entries(TranslatorType).map(([key, value]) => ({
              label: key,
              value,
              disabled: value !== TranslatorType.Baidu
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
