var express=require("express");
var UserModel=require("../models/user");
var ArticleModel=require("../models/article");
var util=require("../methods/public");
//var async=require("async");

var router=express.Router();

router.get("/",function(req,res){
	var user="";
    if(req.session.user){   //用session存储用户
           user=req.session.user;
    } 
     ArticleModel.find({}).limit(5).sort("-createDate").populate(["author"]).exec(function(err,docs){
          docs.forEach(function(doc){
          	doc.commentNum=doc.comments.length;
            doc.img=doc.author.img;
            doc.articleHref="/articles/"+doc._id;
            doc.authorHref="/authors/"+doc.author._id;
            doc.createFormateDate=util.formateDate(doc.createDate);
          });
          res.render("index",{user:user,title:"首页--博客",articles:docs});
     });
});

router.get("/index",function(req,res){
   res.redirect("/");
});

router.post("/search",function(req,res){
   var searchStr=req.body.search;
   if(searchStr!=""||searchStr!=undefined){
      ArticleModel.find({},function(err,docs){
        var articles=[];
        var tags="";
         docs.forEach(function(doc){
          if(doc.title.indexOf(searchStr)>-1){
             articles.push(doc);
          }
         });
         tags=util.tagsSort(docs,searchStr);
         UserModel.find({},function(err,users){
               var authors=[];
               users.forEach(function(user){
                    if(user.username.indexOf(searchStr)>-1){
                      authors.push(user);
                    }
               });
               res.json({tags:tags,authors:authors,articles:articles});
         });
      });
   }
});

router.post("/praiseNum",function(req,res){
     ArticleModel.update({_id:req.body.id},{$set:{praiseNum:req.body.val}},function(err,doc){
          if(err){
            res.render("404page",{user:req.session.user,errorMsg:"/routers/index.js 处理/praiseNum的post请求时发生错误！"});
          }else{
            res.json({});
          }
     });
});

module.exports=router;

//      Model
// .where('age').gte(25)
// .where('tags').in(['movie', 'music', 'art'])
// .select('name', 'age', 'tags')
// .skip(20)
// .limit(10)
// .asc('age')
// .slaveOk()
// .hint({ age: 1, name: 1 })
// .run(callback); 
