import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* 2.0版本，新增分页符功能 */
/* author:kirk */
/*
* 使用说明
* ele:需要导出pdf的容器元素(dom节点 不是id)
* pdfFileName: 导出文件的名字 通过调用outPutPdfFn方法也可传参数改变
* splitClassName: 避免分段截断的类名 当pdf有多页时需要传入此参数 , 避免pdf分页时截断元素  如表格<tr class="itemClass"></tr>
* 调用方式 先 let pdf = new PdfLoader(ele, 'pdf' ,'itemClass');
* 若想改变pdf名称 pdf.outPutPdfFn(fileName);  outPutPdfFn方法返回一个promise 可以使用then方法处理pdf生成后的逻辑
* */
/* 
 breakClassName:自定义分页符类名，默认为break_page,添加改类名的标签被自动分页到下一页
 */
class PdfLoader {
    constructor(ele, pdfFileName, splitClassName = "itemClass", breakClassName = "break_page") {
        this.ele = ele;
        this.pdfFileName = pdfFileName;
        this.splitClassName = splitClassName;
        this.breakClassName = breakClassName;
        this.A4_WIDTH = 595;
        this.A4_HEIGHT = 842;
        this.pageHeight = 0
        this.pageNum = 1
    };

    async getPDF(resolve) {
        let ele = this.ele;
        let pdfFileName = this.pdfFileName
        let eleW = ele.offsetWidth // 获得该容器的宽
        let eleH = ele.scrollHeight // 获得该容器的高
        let eleOffsetTop = ele.offsetTop // 获得该容器到文档顶部的距离
        let eleOffsetLeft = ele.offsetLeft // 获得该容器到文档最左的距离
        let canvas = document.createElement("canvas")
        let abs = 0
        let win_in = document.documentElement.clientWidth || document.body.clientWidth // 获得当前可视窗口的宽度（不包含滚动条）
        let win_out = window.innerWidth // 获得当前窗口的宽度（包含滚动条）
        if (win_out > win_in) {
            abs = (win_out - win_in) / 2 // 获得滚动条宽度的一半
        }canvas.width = eleW * 2 // 将画布宽&&高放大两倍
        canvas.height = eleH * 2
        let context = canvas.getContext("2d")
        context.scale(2, 2) // 增强图片清晰度
        context.translate(- eleOffsetLeft - abs, - eleOffsetTop)
        html2canvas(ele, {
            useCORS: true // 允许canvas画布内可以跨域请求外部链接图片, 允许跨域请求。
        }).then(async canvas => {
            let contentWidth = canvas.width
            let contentHeight = canvas.height
            // 一页pdf显示html页面生成的canvas高度;
            this.pageHeight = (contentWidth / this.A4_WIDTH) * this.A4_HEIGHT
            // 这样写的目的在于保持宽高比例一致 this.pageHeight/canvas.width = a4纸高度/a4纸宽度// 宽度和canvas.width保持一致
            // 未生成pdf的html页面高度
            let leftHeight = contentHeight
            // 页面偏移
            let position = 0
            // a4纸的尺寸[595,842],单位像素，html页面生成的canvas在pdf中图片的宽高
            let imgWidth = this.A4_WIDTH - 10 // -10为了页面有右边距
            let imgHeight = (this.A4_WIDTH / contentWidth) * contentHeight
            let pageData = canvas.toDataURL("image/jpeg", 1.0)
            let pdf = jsPDF("", "pt", "a4");
            // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
            // 当内容未超过pdf一页显示的范围，无需分页
            if (leftHeight < this.pageHeight) { // 在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示；
                pdf.addImage(pageData, "JPEG", 5, 0, imgWidth, imgHeight)
                // pdf.addImage(pageData, 'JPEG', 20, 40, imgWidth, imgHeight);
            } else { // 分页
                while (leftHeight > 0) {
                    pdf.addImage(pageData, "JPEG", 5, position, imgWidth, imgHeight)
                    leftHeight -= this.pageHeight
                    position -= this.A4_HEIGHT
                    // 避免添加空白页
                    if (leftHeight > 0) {
                        pdf.addPage()
                    }
                }
            } pdf.save(pdfFileName + ".pdf", {returnPromise: true}).then(() => { // 去除添加的空div 防止页面混乱
                let doms = document.querySelectorAll('.emptyDiv')
                for (let i = 0; i < doms.length; i++) {
                    doms[i].remove();
                }
            });
            this.ele.style.height = '';
            resolve();
        })

    };
    // 输出pdf
    async outPutPdfFn(pdfFileName) {
        return new Promise((resolve, reject) => { // 进行分割操作，当dom内容已超出a4的高度，则将该dom前插入一个空dom，把他挤下去，分割
            let target = this.ele;
            this.pageHeight = target.scrollWidth / this.A4_WIDTH * this.A4_HEIGHT;
            this.ele.style.height = 'initial';
            pdfFileName ? this.pdfFileName = pdfFileName : null;
            this.pageNum = 1; // pdf页数
            this.domEach(this.ele)
            // 异步函数，导出成功后处理交互
            this.getPDF(resolve, reject);
        })
    };
    domEach(dom) {
        let childNodes = dom.childNodes
        childNodes.forEach((childDom, index) => {
            if (this.hasClass(childDom, this.splitClassName)) {
                let node = childDom;
                let eleBounding = this.ele.getBoundingClientRect();
                let bound = node.getBoundingClientRect();
                let offset2Ele = bound.top - eleBounding.top
                let currentPage = Math.ceil((bound.bottom - eleBounding.top) / this.pageHeight); // 当前元素应该在哪一页
                if (this.pageNum < currentPage) {
                    this.pageNum ++
                    let divParent = childDom.parentNode; // 获取该div的父节点
                    let newNode = document.createElement('div');
                    newNode.className = 'emptyDiv';
                    newNode.style.background = 'white';
                    newNode.style.height = (this.pageHeight * (this.pageNum - 1) - offset2Ele + 30) + 'px'; // +30为了在换下一页时有顶部的边距
                    newNode.style.width = '100%';
                    let next = childDom.nextSibling;
                    // 获取div的下一个兄弟节点
                    // 判断兄弟节点是否存在
                    if (next) { // 存在则将新节点插入到div的下一个兄弟节点之前，即div之后
                        divParent.insertBefore(newNode, node);
                    } else { // 不存在则直接添加到最后,appendChild默认添加到divParent的最后
                        divParent.appendChild(newNode);
                    }
                }
            }
            if (this.hasClass(childDom, this.breakClassName)) {
                this.pageNum ++
                console.log('break_page');
                let eleBounding = this.ele.getBoundingClientRect();
                let bound = childDom.getBoundingClientRect();
                let offset2Ele = bound.top - eleBounding.top
                // 剩余高度
                let alreadyHeight = offset2Ele % this.pageHeight
                let remainingHeight = this.pageHeight - alreadyHeight + 20
                childDom.style.height = remainingHeight + 'px'
            }
            if (childDom.childNodes.length) {
                this.domEach(childDom)
            }
        })
    }
    hasClass(element, cls) {
        return(`` + element.className + ``).indexOf(`` + cls + ``) > -1;
    }
}

export default PdfLoader;
