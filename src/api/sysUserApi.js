import {getResponse,postResponse} from "../utils/request";

const basePath = 'sys-user/'
//登录方法
export const $login = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await postResponse(basePath+'login',params)
    return data;
}

export const $getValidImage = async ()=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'getValidImage')
    return data["data"];
}

export const $getPublicKey = async ()=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'getPublicKey')
    return data["data"];
}

export const $getUserInfo = async ()=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'getUserInfo')
    return data;
}

export const $userPage = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+'page?'+params)
    return data;
}