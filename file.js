var h = {  
    init: function() {  
        var me = this;  
        if(!me.isSupportFileApi){
            console.log('此浏览器不支持H5文件操作api');
            return;
        }   
        document.getElementById('File').onchange = me.fileHandler;  
        document.getElementById('Abort').onclick = me.abortHandler;  
           
        me.status = document.getElementById('Status');  
        me.progress = document.getElementById('Progress');  
        me.percent = document.getElementById('Percent');  

        me.onLoadEnd = 0; 
        //已读取百分比 
        me.loaded = 0;
        //每次读取1M  
        me.step = 1024 * 1024;  
        me.times = 0;  
        //文件列表
        me.files = [];
        //对应的文件读取FileReader
        me.readers = [];

    },  
    fileHandler: function(e) {  
        var me = h;  
        var files = me.files = this.files, filesLen = files.length;
        // for(i=0;i<filesLen;i++) {
        //     me.readers[i] = new FileReader();
        //     me.readers[i].onloadstart = me.onLoadStart;  
        //     me.readers[i].onprogress = me.onProgress;  
        //     me.readers[i].onabort = me.onAbort;  
        //     me.readers[i].onerror = me.onerror;  
        //     me.readers[i].onload = me.onLoad;  
        //     me.readers[i].onloadend = me.onLoadEnd;  
        //     me.readBlob(files[i],i);
        // }
        //获取到上传的第一个文件
        var file = me.file = this.files[0];  
        
        var reader = me.reader = new FileReader();  
        
        me.total = file.size;  
           
        reader.onloadstart = me.onLoadStart;  
        reader.onprogress = me.onProgress;  
        reader.onabort = me.onAbort;  
        reader.onerror = me.onerror;  
        reader.onload = me.onLoad;  
        reader.onloadend = me.onLoadEnd;  
        //读取第一块  
        me.readBlob(file, 0);  

    },  
    onLoadStart: function() {  
        var me = h;  
    },  
    onProgress: function(e) {  
        console.log(e);
        var me = h;  
        me.loaded += e.loaded;  
        //更新进度条  
        if(me.total == 0){
            //上传一个空文件时
            me.progress.value = 100;
        }else{
            me.progress.value = (me.loaded / me.total) * 100;  
        }     
    },  
    onAbort: function() {  
        var me = h;  
    },  
    onError: function() {  
        var me = h;  
           
    },  
    onLoad: function(e) { 
        e.preventDefault();
        e.stopPropagation()
        var me = h,
            file = me.file, 
            reader = me.reader,
            result = e.target.result;  //读取的文件内容
        if(me.loaded < me.total) {  
            result = reader.result;  //读取的文件内容
            console.log(result);
            me.readBlob(me.loaded);  //读取文件
        } else {  
            me.loaded = me.total;  
        }  
        switch (me.getFileType(me.file.type)){
            case 'IMG':
                document.getElementById('preview').setAttribute('src', me.BlobToDataUrl(file));
                break;
            default:
                document.getElementById('fileContent').innerHTML = result;
                break;
        }
        console.log(result);
    },  
    onLoadEnd: function() {  
        var me = h;        
    },  
    readBlob: function(start) {  
        var me = h;  
           
        var blob,  
            file = me.file;  
           
        me.times += 1;  
        console.log(file);

        //在这里根据文件类型选择文件读取方式
        var ftype = me.getFileType(file.type);
        console.log(ftype);

        switch (ftype){
            case 'IMG':
                var datauri = me.reader.readAsDataURL(file);  
                break;
            default:
                var string = me.reader.readAsText(file);
                break;
        }

    },  
    abortHandler: function() {  
        var me = h;  
           
        if(me.reader) {  
            me.reader.abort();  
        }  
    },
    isSupportFileApi: function () {
        /** 
         * 判断是否支持文件操作api
         */
        if(window.File && window.FileList && window.FileReader && window.Blob) {
            return true;
        }
        return false;
    },
    getFileType: function(type){
        /**
         * 根据文件的MIME判断文件的类型
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
    dataUrlToBlob: function(dataurl){
        /**
         * dataurl转blob对象
         * @dataurl: 格式为dataurl的字符串
         */
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    },
    BlobToDataUrl: function(blob){
        /**
         * blob或者file对象转成Url
         * @blob file或者blob对象
         */
        return window.URL.createObjectURL(blob);
    }
};  

h.init();  