import React, {useEffect, useState} from 'react';
//图标
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    MailOutlined,
    SettingOutlined,
    HomeOutlined, ExclamationCircleOutlined, ControlOutlined, FundOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button,Modal} from 'antd';
import './Layout.scss'
import {useNavigate,Outlet} from "react-router-dom";
import {$getUserInfo} from "../../api/sysUserApi";
import {successCode} from "../../App";
import NotificationMsg from "../../components/notification/notificationMsg";
const { Header, Sider, Content } = Layout;
export default function () {
    let navigate = useNavigate();
    let [msg,setMsg] = useState({type:'',description:''})
    useEffect(() => {//如果获取用户信息失败 直接跳转到登录页
        if(!sessionStorage.getItem("token")){
            setMsg({type: 'error', description: "用户已离线，请重新登录"})
            setTimeout(function (){
                navigate('/')
            },2000)
        }else {
            $getUserInfo().then((values) => {
                if(values["code"]!==successCode){
                    setMsg({type: 'error', description: values["msg"]})
                    sessionStorage.clear();
                    localStorage.clear();
                    setTimeout(function (){
                        navigate('/')
                    },2000)
                }
            })
        }
    }, []);
    const [current, setCurrent] = useState('mail');
    //顶部菜单导航
    const topItem = [
        {
            label: '首页',
            key: 'mail',
            icon: <HomeOutlined />,
        },
        {
            label: '通知',
            key: 'notification',
            icon: <MailOutlined />,
        },
        {
            label: '个人中心',
            key: 'personal',
            icon: <UserOutlined />,
            children: [
                {
                    key: 'basicInfo',
                    label: '个人信息',
                },
                {
                    label: '修改密码',
                    key: 'updatePwd'
                },
                {
                    label: '退出系统',
                    key: 'logout'
                },
            ],
        }
    ];
    const leftItem = [
        {
            key: 'systemOption',
            icon: <SettingOutlined />,
            label: '系统管理',
            children:[
                {
                    key: 'user',
                    icon: <UserOutlined />,
                    label: '用户管理',
                },
                {
                    key: 'role',
                    icon: <UserOutlined />,
                    label: '角色管理',
                },
                {
                    key: 'dept',
                    icon: <UserOutlined />,
                    label: '部门管理',
                }
            ]
        },
        {
            key: 'processOption',
            icon: <ControlOutlined />,
            label: '流程管理',
            children:[
                {
                    key: 'process',
                    icon: <FundOutlined />,
                    label: '流程管理',
                }
            ]
        }
    ]
    const [modal, contextHolder] = Modal.useModal();
    const clickMenu = (e)=>{
        setCurrent(e.key);
        switch (e.key){
            case 'logout'://如果是退出 清除缓存 跳转到首页
                modal.confirm({
                    title: 'Confirm',
                    icon: <ExclamationCircleOutlined />,
                    content: '确认退出系统？',
                    okText: '确认',
                    cancelText: '取消',
                    onOk(){
                        sessionStorage.clear();
                        localStorage.clear();
                        setMsg({type: 'info', description: '退出成功'})
                        setTimeout(function (){
                            navigate('/')
                        },2000)
                    }
                });
                break;
            case 'role':
                navigate('/layout/role')
                break;
            case 'user':
                navigate('/layout/user')
                break;
            case 'process':
                navigate('/layout/process')
                break;
            case 'dept':
                navigate('/layout/dept')
                break;
        }
    }
    const [collapsed, setCollapsed] = useState(false);
    //最终返回值
    return (
        <Layout className='Layout'>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className="logo">{collapsed?'OA':'OA管理系统'}</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[current]}
                    items={leftItem}
                    onClick={clickMenu}
                />
            </Sider>
            <Layout className='right'>
                <Header className='header'>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className='trigger'
                    />
                    <Menu onClick={clickMenu} className='menu' theme={"dark"} selectedKeys={[current]} mode="horizontal" items={topItem} />
                </Header>
                <Content>
                    <Outlet>111</Outlet>
                </Content>
            </Layout>
            <NotificationMsg msg={msg} />
            {contextHolder}
        </Layout>
    );
};