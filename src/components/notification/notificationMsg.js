import React,{useEffect} from "react";
import {notification} from 'antd';

export default function NotificationMsg({msg}){
    const [api,contextHolder] = notification.useNotification();
    useEffect(()=>{
        if(msg.type){//如果type有值 才打开通知框 防止第一次就打开
            api[msg.type]({
                message:'系统提示',
                description:msg.description
            })
        }
    },[msg])
    return(
        <>
            {contextHolder}
        </>
    )
}