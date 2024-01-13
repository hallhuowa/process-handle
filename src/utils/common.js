import {$deptList} from "../api/deptApi";

export function tree2SelectTree(data){
    if(data){
        return data.map(r=>{
            return{
                children:tree2SelectTree(r.children),//递归解析children
                value:r.key,
                label:r.title//这种写法可以自定义加工数据 推荐
            }
        })
    }
}