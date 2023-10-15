import { useEffect, useRef } from 'react';
import { Form, Input, Link, Switch } from '@arco-design/web-react';

import { getUserStore, ipcRenderer, setUserStore } from 'src/renderer/utils';
import { BaiduApp } from 'src/lib/Baidu/renderer';
import { Channels } from 'src/common/constant';
import useOCR from 'src/renderer/hooks/useOCR';
import { OCRType } from 'src/renderer/server';

const FormItem = Form.Item;

const secretKey = BaiduApp.OCR;
const getOCRSecret = () => {
  return getUserStore(secretKey);
};

const setOCRSecret = async (updateValue: BaiduOCRSecret) => {
  const prevValue = await getOCRSecret();
  return setUserStore(secretKey, {
    ...prevValue,
    ...updateValue,
  });
};

export default () => {
  const [form] = Form.useForm();
  const secretRef = useRef<any>();
  const { currentOCR, changeCurrentOCR } = useOCR();

  const onChangeForm = (changeValue: Record<string, unknown>) => {
    secretRef.current = {
      ...secretRef.current,
      ...changeValue,
    };
    return setOCRSecret(secretRef.current);
  };

  const onNavigate = () => ipcRenderer.invoke(
    Channels.OpenExternal,
    'https://cloud.baidu.com/doc/OCR/s/dk3iqnq51'
  );

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
    <div className='settings-OCR__form-wrapper'>
      <p className='settings-OCR__form-desc'>
        在线OCR接口，需注册使用，并填写client_id及client_secret，详见
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
        className='settings-OCR__form'
      >
        <FormItem label='使用百度OCR' >
          <Switch
            checked={currentOCR === OCRType.Baidu}
            checkedText='ON'
            uncheckedText='OFF'
            onChange={(value) => {
              changeCurrentOCR(value ? OCRType.Baidu : OCRType.Tesseract);
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
