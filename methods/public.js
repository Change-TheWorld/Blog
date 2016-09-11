var formidable=require("formidable");
var fs=require("fs");

function formateDate(date){
    var year=date.getFullYear();
    var month=date.getMonth()+1;
    var day=date.getDate();
    var hours=date.getHours();
    var minutes=date.getMinutes();
    var str=year+"-"+month+"-"+day+" "+hours+":"+minutes;
    return str;
}

function commentSort(docs){
    var i,j;
    var temp;
    for(i=0;i<docs.length;i++){
        if(docs[i].comments.length==undefined){
            docs[i].comments.length=0;
        }
        for(j=i+1;j<docs.length;j++){
            if(docs[j].comments.length==undefined){
                docs[j].comments.length=0;
            }
            if(docs[i].comments.length<docs[j].comments.length){
                temp=docs[i];
                docs[i]=docs[j];
                docs[j]=temp;
            }
        }
    }
    return docs;
}

function sortDesc(docs,attr){
    var temp;
    for(var i=0;i<docs.length;i++){
        for(var j=i+1;j<docs.length;j++){
            if(docs[i][attr]<docs[j][attr]){
                temp=docs[i];
                docs[i]=docs[j];
                docs[j]=temp;
            }
        }
    }
    return docs;
}

function visitedSort(docs){
    return sortDesc(docs,"visitedNum");
}

function praiseSort(docs){
    return sortDesc(docs,"praiseNum");
}

function tagsSort(docs,tagCategory){
    var tags={};
    var tag;
    for(var i=0;i<docs.length;i++){
        if(tagCategory==undefined){
            tag=docs[i].tags.split(",");
        }else{
                if(tagCategory.indexOf(",")==0){
                  tagCategory=tagCategory.substring(1);
                  }
                if(docs[i].tags.indexOf(tagCategory)>-1){
                var regexp=new RegExp("(,)?([\u4e00-\u9fff]|\w)*"+tagCategory+"([\u4e00-\u9fff]|\w)*((?=,)|$)");
                tag=docs[i].tags.match(regexp);
                if(tag==null||tag==""){
                    continue;
                }else{
                    tag=(tag[0].indexOf(",")==0)?tag[0].substring(1).split(","):tag[0].split(",");
                }
              }else{
                continue;
              }
        }
       for(var j=0;j<tag.length;j++){
         if(tags[tag[j]]!=undefined){
            tags[tag[j]]++;    //同一标签的文章数量
           // tags[tag[j]].title.push(docs[i].title); 同一标签的文章
           // tags[tag[j]]._id.push(docs[i]._id);
         }else{
            tags[tag[j]]=1;
            // tags[tag[j]].title=[];
            // tags[tag[j]].title.push(docs[i].title);
            // tags[tag[j]]._id=[];
            // tags[tag[j]]._id.push(docs[i]._id);
         }
       }
    }
    return tags;
}

function tagsShow(docs){
    var tags={};
    var tag=[];
    for(var i=0;i<docs.length;i++){
       tag=docs[i].tags.split(",");
       for(var j=0;j<tag.length;j++){
         if(tags[tag[j]]!=undefined){
            //tags[tag[j]]++;    //同一标签的文章数量
           tags[tag[j]].push(docs[i]); // 同一标签的文章
         }else{
            //tags[tag[j]]=1;
            tags[tag[j]]=[];
            tags[tag[j]].push(docs[i]);
         }
       }
    }
    return tags;
}

function dealMultipartFormData(req,picName,pathname,callback){
    var form=new formidable.IncomingForm();
    //console.log(__dirname); E:\jsnode\Blog\routers  
    var dir=__dirname;
    dir=dir.substring(0,dir.lastIndexOf("\\"));
    form.uploadDir=dir+"\\public\\"+pathname;
    form.keepExtensions=true;
    form.parse(req,function(err,fields,files){
        var oldPath=files[picName].path;       //这里其实还可以优化，因为没有上传题图的时候，会产生一个0kb的文件
        var oldName=files[picName].name;
        var date=new Date();
        var dateTime=date.getTime().toString();
        var newName=oldName.substring(0,oldName.lastIndexOf("."))+dateTime+oldName.substr(oldName.lastIndexOf("."));
        var newPath=oldPath.replace(oldPath.substr(oldPath.lastIndexOf("\\")+1),newName);
        fs.rename(oldPath,newPath,function(){
            callback(fields,files,newName);
        });
    });
}

exports.formateDate=formateDate;
exports.commentSort=commentSort;
exports.sortDesc=sortDesc;
exports.visitedSort=visitedSort;
exports.praiseSort=praiseSort;
exports.tagsSort=tagsSort;
exports.tagsShow=tagsShow;
exports.dealMultipartFormData=dealMultipartFormData;