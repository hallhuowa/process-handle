import {getResponse} from "../utils/request";

const basePath = 'enum/'
/**
 * 枚举通用接口
 * @param params
 * @returns {Promise<any>}
 */

export const $enum = async (params)=>{ //$为个人习惯 表示是api接口
    let {data} = await getResponse(basePath+params)
    return data;
}