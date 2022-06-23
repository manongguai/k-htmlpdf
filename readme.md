



**k-htmlpdf 是能将Dom一键配置输出pdf的包，**

* 这个包是借鉴了[qq_251025116](https://blog.csdn.net/qq_24882601?type=blog)大佬的解决方案并优化升级完成的，[原文链接](https://blog.csdn.net/qq_24882601/article/details/123863353?ops_request_misc=&request_id=&biz_id=102&utm_term=html%E8%BD%ACpdf%E5%88%86%E9%A1%B5%E9%97%AE%E9%A2%98%E7%BB%88%E6%9E%81%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88%20k-htmlpdf&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-123863353.nonecase&spm=1018.2226.3001.4187)

> jspdf分页有个比较不好的地方就内容过长的时候虽然会虽然能做到分页，但是会把内容给截断，解决思路是给每个可能会被截断元素加上类，然后动态的计算该元素的位置是否在下一页和上一页之间，如果在的话就添加一个空白元素把这个元素给挤下去，这样就能实现了

1.安装依赖
```js
    npm install k-htmlpdf

```
2.使用方法
```js
    import PdfLoader from 'k-htmlpdf'

    let dom = document.querySelector("#pdfDom");
    let pdf = new PdfLoader(dom, "测试", "itemClass",'break_page');
    pdf.outPutPdfFn("测试");
```
* 使用说明

```js 
 let pdf =  new PdfLoader(<ele>,<pdfFileName>,[splitClassName],[breakClassName])
```
>  * ele:需要导出pdf的容器元素(dom节点 不是id)
> * pdfFileName: 导出文件的名字 通过调用outPutPdfFn方法也可传参数改变
> * splitClassName: 避免分段截断的类名 当pdf有多页时需要传入此参数 , 避免pdf分页时截断元素  如表格<tr class="itemClass"></tr>
> * 调用方式 先 let pdf = new PdfLoader(ele, 'pdf' ,'itemClass');
> * 若想改变pdf名称 pdf.outPutPdfFn(fileName);  outPutPdfFn方法返回一个promise 可以使用then方法处理pdf生成后的逻辑
> *  breakClassName:自定义分页符类名，默认为break_page,添加改类名的标签被自动分页到下一页
```js
 pdf.outPutPdfFn([fileName]) 
```
 > *输出下载pdf
 * 效果演示
1. 正常效果
![](https://img-blog.csdnimg.cn/img_convert/a4b60e448db39a4d067e76a6ae40dbbb.png)
2. 分页符
![](https://img-blog.csdnimg.cn/img_convert/74b856a7cb255d10670f4665250fcb18.png)
3. 自动换页，防止切割
![](https://img-blog.csdnimg.cn/img_convert/8037086b976b24b52a99c89690d0650b.png)

* gitee 仓库 
[https://gitee.com/kirk958617/k-htmlpdf](https://gitee.com/kirk958617/k-htmlpdf)
* github 仓库 
[https://github.com/manongguai/k-htmlpdf](https://github.com/manongguai/k-htmlpdf)

