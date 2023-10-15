import { useEffect, useRef } from 'react';
import { Form, Input, Link, Switch } from '@arco-design/web-react';

import { getUserStore, setUserStore, ipcRenderer } from 'src/renderer/utils';
import { BaiduApp } from 'src/lib/Baidu/renderer';
import { Channels } from 'src/common/constant';

import { TranslatorType } from 'src/renderer/server';
import useTranslator from 'src/renderer/hooks/useTranslator';

const FormItem = Form.Item;

const secretKey = BaiduApp.Translator;
const getTranslatorSecret = () => {
  return getUserStore(secretKey);
};

const setTranslatorSecret = async (updateValue: BaiduOCRSecret) => {
  const prevValue = await getTranslatorSecret();
  return setUserStore(secretKey, {
    ...prevValue,
    ...updateValue,
  });
};

export default () => {
  const [form] = Form.useForm();
  const secretRef = useRef<any>();
  const { currentTranslator, changeCurrentTranslator } = useTranslator();

  const onChangeForm = (changeValue: Record<string, unknown>) => {
    secretRef.current = {
      ...secretRef.current,
      ...changeValue,
    };
    return setTranslatorSecret(secretRef.current);
  };

  const onNavigate = () => ipcRenderer.invoke(
    Channels.OpenExternal,
    'https://cloud.baidu.com/doc/MT/s/2l317egif'
  );

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
    <div className='settings-translator__form-wrapper'>
      <p className='settings-OCR__form-desc'>
        在线翻译接口，需注册使用，并填写client_id及client_secret，详见
        <Link status='warning' onClick={onNavigate}>
          教程
        </Link>
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
        onChange={onChangeForm}
        className='settings-translator__form'
      >
        <FormItem label='使用百度OCR' >
          <Switch
            checked={currentTranslator === TranslatorType.Baidu}
            checkedText='ON'
            uncheckedText='OFF'
            onChange={(value) => {
              changeCurrentTranslator(value ? TranslatorType.Baidu : TranslatorType.None);
            }}
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
