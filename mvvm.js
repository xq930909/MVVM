
class Dep{
    constructor(){
        this.events=[]
    }
    addWatcher(watcher){
        this.events.push(watcher)
    }
    touchwatchers(){
        this.events.forEach(item=>{
            item.targetCallBack()
        })
    }
}
Dep.target=null
let dep = new Dep()
class Observer{
    constructor(data){
        if(!data||typeof data!=='object'){
            return;
        }
        this.data=data;
        this.init()
    }
    init(){
        Object.keys(this.data).forEach(key => {
            this.observer(this, key, this.data[key])
        })
    }
    observer(obj, key, value) {
        new Observer(this.data[key])
        Object.defineProperty(obj, key, {
            get() {
                //console.log(value)
                if(Dep.target){
                    dep.addWatcher(Dep.target)
                }
                return value
            },
            set(newValue) {
                //console.log(newValue)
                if(value===newValue){
                    return;
                }
                value = newValue
                dep.touchwatchers()
                new Observer(value)
            }
        })
    }
}
class Watcher{
    constructor(data,key,callback){
        this.data=data;
        this.key=key;
        this.callback=callback;
        Dep.target=this;
        this.init()
    }
    init(){
        this.value=utils.getDataValue(this.key,this.data,)
        Dep.target=null;
        return this.value
    }
    targetCallBack(){
        let value=this.init()
        this.callback(value)
    }
}
const utils={
    setInpValue(node,key,data){
        node.value=this.getDataValue(key,data)
    },
    getDataValue(key,data){
        if(key.indexOf(".")>-1){
            key.split(".").forEach(val=>{
                data=data[val]
            })
            return data
        }else{
            return data[key]
        }
    },
    changeValue(data,key,newValue){
        if (key.indexOf(".") > -1) {
            let arr=key.indexOf(".")
            for(let i=0;i<arr.length-1;i++){
                data=data[i]
            }
            data[arr[arr.length-1]]=newValue;
        } else {
            data[key]=newValue
        }
    }
}
class Mvvm{
    constructor({el,data}){
		//挂载到实例上
        this.$el=document.getElementById(el)
        this.data=data
        //初始化数据执行的时候绑定实例化对象的过程，数据劫持
        this.init()
        //替换文本中的原来有的原始数据
        this.initDom()
    }
    init(){
        Object.keys(this.data).forEach(key=>{
            this.observer(this,key,this.data[key])
        })
        // 给当前数据集合的每一个属性添加劫持
        new Observer(this.data)
    }
    //数据劫持
    observer(obj,key,value){
        Object.defineProperty(obj,key,{
            get(){
                //console.log(value)
                return value
            },
            set(newValue){
               console.log(newValue)
                value=newValue
            }
        })
    }
    //获取每个元素，并赋值
    initDom(){
        let newFargument=this.createFargument()
        //console.log(newFargument)
        this.compiler(newFargument)
        this.$el.appendChild(newFargument)
    }
    createFargument(){
        //碎片流与当前的文档，DOM有关，这里面的DOM不是真实的DOM
        let fargument=document.createDocumentFragment()
        //console.dir(this.$el)
        //循坏，当firstChild===当前碎片流的第一个子元素，然后添加进去
        let firstChild;
        while(firstChild=this.$el.firstChild){
            fargument.appendChild(firstChild)
        }
        return fargument
    }
    compiler(node){
        //console.dir(node)
        if(node.nodeType===1){
            let attributes=node.attributes;
                [...attributes].forEach(val=>{
                    //节点
                    if(val.nodeName==='v-model'){
                        //获取每次input输入的值，然后获取到input的值
                        node.addEventListener("input",(target)=>{
                            console.log(target.target.value)
                            utils.changeValue(this.data,val.nodeName,target.target.value)
                        })
                        utils.setInpValue(node,val.nodeValue,this.data)
                    }
                })
        }else if(node.nodeType===3){
            //console.dir(node)
            if(node.textContent.indexOf("{{")>-1){
                let content=node.textContent.split("{{")[1].split("}}")[0]
                //console.log(content)
                utils.setInpValue(node, content, this.data,'textContent')
                content&&new Watcher(this.data,content,(value)=>{
                   node.textContent=value
                })
            }
        }
        //判断当前的node有没有子节点
        //通过递归的形式保证每一级的文本都可获取到并替换 
        if(node.childNodes  && node.childNodes.length>0){
            node.childNodes.forEach(item=>{
                //保证每一级用compiler解析一下，子元素里面还有没有子元素
                this.compiler(item)
            })
        }
    }
}