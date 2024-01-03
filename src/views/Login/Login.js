import React, {useEffect, useState} from 'react'
import './Login.scss'
import {Button, Col, Form, Image, Input} from 'antd';
import {$getPublicKey, $getValidImage, $login} from '../../api/sysUserApi'
import JSEncrypt from 'jsencrypt';
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";
import {useNavigate} from 'react-router-dom'

export default function Login(){
    // 导航
    let navigate = useNavigate();
    //判断是否已登录
    useEffect(()=>{
        if(sessionStorage.getItem("token")){
            navigate('/layout')
        }
    },[])
    //const [messageApi, contextHolder] = message.useMessage();//提示消息初始化
    let [msg,setMsg] = useState({type:'',description:''})
    let [form] = Form.useForm();
    const onReset = () => {
        form.resetFields();
    };
    const [image,setImage] = useState(''); // 初始化为空字符串或默认图片URL
    useEffect(() => {
        $getPublicKey()
            .then((values) => {
                form.setFieldsValue({'publicKey' : values})
            })
        $getValidImage()
            .then((values) => {
                setImage('data:image/png;base64,'+values); // 将返回的数据保存到state中
                form.setFieldsValue({'validKey' : values})
            })
    }, []);
    function getValidImage(){
        $getValidImage().then((values) => {
            setImage('data:image/png;base64,'+values);
            form.setFieldsValue({'validKey' : values})
        });
    }
    function getPublicKey(){
        $getPublicKey().then((values) => {
            form.setFieldsValue({'publicKey' : values})
        });
    }
    //登录的方法
    const onFinish = async (values) => {
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(values["publicKey"]);
        values["password"] = encrypt.encrypt(values["password"])
        let {code, msg, data} = await $login(values)
        if (code !== successCode) {//如果失败 重新加载验证码
            /*messageApi.error(data["msg"]).then(()=>{
                getValidImage() //刷新验证码
                getPublicKey() //刷新公钥
            })*/
            setMsg({type: 'error', description: msg})
            getValidImage() //刷新验证码
            getPublicKey()//刷新公钥
        } else {
            setMsg({type: 'success', description: msg})
            sessionStorage.setItem('token', data["token"])
            navigate('/layout')
        }
    };
    return (
        <div className='login'>
            <NotificationMsg msg={msg}/> {/*自己封装的消息提示组件*/}
            <div className='content'>
                <h2>OA审批系统</h2>
                <Form
                    name="basic"
                    form={form}
                    labelCol={{
                        span: 5
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name = "publicKey"
                        hidden
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name = "validKey"
                        hidden
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="账号："
                        name="userName"
                        rules={[
                            {
                                required: true,
                                message: '请输入用户名',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="密码："
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: '请输入密码',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Col>
                        <Form.Item
                            name="validValue"
                            label="验证码:"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入验证码',
                                },
                            ]}
                            style={{width:"80%",float:"left",marginLeft:'30px'}}
                        >
                            <Input style={{width: '100%'}}/>
                        </Form.Item>
                        <Form.Item
                            style={{float:"left",marginLeft:'-30px'}}>
                            <Image width={70}
                                   src={image}
                            />
                        </Form.Item>
                    </Col>

                    <Form.Item>
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            登录
                        </Button>
                        <Button style={{marginLeft:'13px'}} htmlType="button" onClick={onReset}>清除</Button>
                        <Button style={{marginLeft:'13px'}} htmlType="button" onClick={getValidImage}>刷新验证码</Button>

                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}