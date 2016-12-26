/**
 * 基于H5多文件、多线程上传
 * @author: hxw
 * @time: 2016/12/26
 */

var H5Upload = {
	//初始化
	init: function () {
		var me = this;  
		me.filelist = me.readerlist = me.loaded = [];
        if(!me.isSupportFileApi){
            console.log('此浏览器不支持H5文件操作api'); 
            return;
        }  
        if(!me.input){
        	console.log('请先配置上传元素');
        	return;
        }
        inputDom = me.domSelect(me.input);
        //绑定change事件
		inputDom.onchange = me.fileSelect;

	},
	//配置
	config: function(c){
		/**
		 * c.step: 读取步长值，默认读取步长值为1M  
		 * c.block: 每次读取大小，默认每次读取5M
		 * c.input: 文件传输input元素, 必须
		 */
		var me = this;
		me.step = c.step || (1024 * 1024);
		me.block = c.block || 5;
		me.input = c.input;

		me.init();
	},
	//元素选择
	domSelect: function(select){
		//TODO 这里先简单传入id，然后返回对应dom元素
		return document.getElementById(select);
	},
	//绑定元素上传操作
	fileSelect: function(e){
		var me = H5Upload,
			readers = me.readerlist
			;
		//获取上传的文件列表
		var filelist = me.getFileList();
		//生成FileReader对象数组
		var readerlist = me.genFileReader();
		var len = filelist.length;
		for(var i=0;i<len;){
			var total = filelist[i].size;

			readerlist[i].onload = function(e){
				e.preventDefault();
        		e.stopPropagation();
				console.log(filelist);
        		var result = e.target.result;  //读取的文件内容
        		console.log('result:'+result);
        		if(me.loaded[i]< total) {  
		            result = readerlist[i].result;  //读取的文件内容
		            console.log(result);
		            me.readBlob(readerlist[i], filelist[i], me.loaded[i]);  //读取文件
		        } else {  
		            me.loaded[i] = total;  
		        }  
			};

			readerlist[i].onprogress = function(e){
		        me.loaded[i] += e.loaded;  
		        //更新进度条  
		        console.log(me.filelist[i]);
		        if(me.filelist[i].size == 0){
		            //上传一个空文件时
		            me.progress.value = 100;
		        }else{
		            me.progress.value = (me.loaded[i] / me.filelist[i].size) * 100;  
		        }     
			};
			
			i++;
		}
		
	},
	//获取文件列表
	getFileList: function(){
		/**
		 * 返回值： Array 文件列表数组，成员对象是file类型
		 */
		var me = this;
		me.filelist = me.domSelect(me.input).files;
		me.filelen = me.filelist.length;
		var len = me.filelen;
		for(var i=0;i<len;i++){
			// me.filelist[i]['loaded'] = 0;
			me.loaded[i] = 0;
			//有时候写不进去？？
		}
		console.log(me.filelist);
		return me.filelist;
	},
	//生成对应文件的FileReaer对象
	genFileReader: function(){
		var me = this;
		for(var i=0;i<me.filelen;i++){
			// console.log(i);
			// console.log(me.readerlist);
			me.readerlist[i] = (new FileReader());
		}
		return me.readerlist;
	},
	//分段读取文件
	readFile: function(file,start,end){
		/**
		 * file: 读取的文件
		 * start: 读取开始位置
		 * end: 读取结束位置
		 */
	 	var me = this,
	 		filetype = me.getFileType(file.type),
	 		filelist = me.getFileList(),
	 		readerlist = me.genFileReader(),
	 		fileloaded = 0,
	 		filetotal = file.total
	 		;

			for(var i=0,len=filelist.length;i<=len;i++){
				readerlist[i].onload = function(e){
					console.log(e);
				}
			}

	},
	//判断是否支持文件操作api
	isSupportFileApi: function () {
        /** 
         * 返回值： boolean
         */
        if(window.File && window.FileList && window.FileReader && window.Blob) {
            return true;
        }
        return false;
    },
    //根据文件的MIME判断文件的类型
    getFileType: function(type){
        /**
         * @返回值： 
         *  'IMG': 图片类型
         *  'CVS'    
         */
        var Reg = {
            img: /image\/(jpeg|png|jpg|ico|jpe|gif|bmp)/,
            exe: /application\/x-msdownload/,
            zip: /application\/x-zip-compressed/,
            txt: /text\/plain/,
            pdf: /application\/pdf/,
            doc: /application\/msword/,
            excel: /application\/vnd.ms-excel/,
            ppt: /application\/vnd.ms-ppt/,
            flash: /application\/x-shockwave-flash/,
        };
         
        if(Reg.img.test(type)){
            return 'IMG';
        }else if(Reg.exe.test(type)){
            return 'EXE';
        }else if(Reg.zip.test(type)){
            return 'ZIP';
        }else if(Reg.txt.test(type)){
            return 'TXT';
        }else if(Reg.pdf.test(type)){
            return 'PDF';
        }else if(Reg.doc.test(type)){
            return 'DOC';
        }else if(Reg.excel.test(type)){
            return 'EXECL';
        }else if(Reg.ppt.test(type)){
            return 'PPT';
        }else if(Reg.flash.test(type)){
            return 'FLASH';
        }else{
            return 'OTHER';
        }
    },
    //dataurl转blob对象
    dataUrlToBlob: function(dataurl){
        /**
         * @dataurl: 格式为dataurl的字符串
         */
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    },
    //blob或者file对象转成Url
    BlobToDataUrl: function(blob){
        /**
         * @blob file或者blob对象
         */
        return window.URL.createObjectURL(blob);
    },
    //上传出错
    errorHandler: function (evt) {
    	/**
    	 * 
    	 */
    	if(evt.target){
    		//传入事件
    		var e = evt.target;
    	}else{
    		//传入dom对象
    		var e = evt;
    	}
  		switch(evt.error.code) {
	    	case evt.target.error.NOT_FOUND_ERR:
	      		console.log('File Not Found!');
	      	break;
	    	case evt.target.error.NOT_READABLE_ERR:
	      		console.log('File is not readable');
	      		break;
    		case evt.target.error.ABORT_ERR:
	      		break;
    		default:
      			console.log('An error occurred reading this file.');
	  };
	},
	//文件上传函数
	upload: function(){
		var me = this,
			argslen = arguments,
			filelist = me.filelist,
			readerlist = me.readerlist,
			loaded = me.loaded
			;
		for(var i=0;i<me.filelen;i++){
			me.readBlob(readerlist[i],filelist[i],loaded[i]);
		}
	},
	//文件预览
	preview: function(){

	},
	//读取块
	readBlob: function(reader,file,start){
		var me = this,
			blob = null,
			end = start + me.step + 1
			;
		if(end > file.length){
			end = file.length;
		}
	    if(file.webkitSlice) {
	        blob = file.webkitSlice(start,end);
	    } else if(file.mozSlice) {
	        blob = file.mozSlice(start,end);
	    } else if(file.slice) {
	        blob = file.slice(start,end);
	    } else {
	        console.log('不支持分段读取！');
	        return false;
	    }
	    reader.readAsText(blob);
	}

}

H5Upload.config({
	input: 'File'
});