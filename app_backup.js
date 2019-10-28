var express = require('express')
,http = require('http')
,fs = require('fs');

var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));   //body-paser middle-wear 를 먼저 실행 후 라우팅
app.use(express.static('public'));

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var docs1;

mongoose.connect('mongodb://localhost:27017/uniseoul')


var db = mongoose.connection;

db.on('error',console.error.bind(console,'connection error'));

db.once('open',function(){
            console.log('db connect');
});


var review_schema = new Schema({
            id : String,
            title : String,
            content : String
});

var vol_list_schema = new Schema({
    v_num:String,
    v_title: String,
    v_content: String,
    current_uni: String,
    max_uni: String,
    current_helper: String,
    max_helper: String,
    s_date: String,
    e_date: String
})


var helper_list_schema = new Schema({
    v_num : String,
    v_user_id : String,
    v_hp : String
});


var uni_list_schema = new Schema({
    v_num : String,
    v_user_id : String,
    v_hp : String
});




var reviewModel = mongoose.model('reviewModel',review_schema,'review');
var vol_listModel = mongoose.model('vol_listModel',vol_list_schema,'vol_list');
var helper_listModel = mongoose.model('helper_listModel',helper_list_schema,'helper_list');
var uni_listModel = mongoose.model('uni_listModel',uni_list_schema,'uni_list');




function createReview(id,title,content){
            var newReview = new reviewModel;

            newReview.id = id;
            newReview.title = title;
            newReview.content = content;

            newReview.save(function (err) {
                            if (err) throw err;
                        });

            console.log('review:' + newReview.id+":" + newReview.title +":"+ newReview.content);

}

function put_helper_list(num,id,hp){

        var newHelper = new helper_listModel;

        newHelper.v_num = num;
        newHelper.v_user_id = id;
        newHelper.v_hp = hp;
        
        newHelper.save(function (err) {
                            if (err) throw err;
                        });

        vol_listModel.update({v_num:v_num},{$inc:{current_helper:1}});

        console.log('review:' +  newHelper.v_num+":" +  newHelper.v_user_id +":"+  newHelper.v_hp.content);

}


function put_uni_list(num,id,hp){

    var newUni = new uni_listModel;

    newUni.v_num = num;
    newUni.v_user_id = id;
    newUni.v_hp = hp;
    
    newUni.save(function (err) {
                        if (err) throw err;
                    });

    vol_listModel.update({v_num:v_num},{$inc:{current_uni:1}});
    
    console.log('review:' +  newUni.v_num+":" +  newUni.v_user_id +":"+  newUni.v_hp.content);

}




app.post('/create_review',function(req,res){
            var id = req.body.id;
            var title = req.body.title;
            var content = req.body.content;

            createReview(id,title,content);
});


app.get('/read_review/',function(req,res){

    reviewModel.find({}).sort({date:-1}).exec(function(err,docs){
                    if(err) return res.status(500).json({error: err});
                    if(docs.length === 0) return res.status(404).json({error: 'review not found'});
                    console.log(docs);
                    res.json(docs);
                })
});

app.get('/read_review/:id',function(req,res){

    reviewModel.find({id:req.params.id}).sort({date:-1}).exec(function(err,docs){
                    if(err) return res.status(500).json({error: err});
                    if(docs.length === 0) return res.status(404).json({"docs":[]});
                    console.log(docs);
                    var review = {
                        "docs":docs
                    };
                    res.json(review);
                })
});

app.get('/vol_list/',function(req,res){

    vol_listModel.find({}).sort({date:-1}).exec(function(err,docs){
                    if(err) return res.status(500).json({error: err});
                    if(docs.length === 0) return res.status(404).json({"docs":[]});
                    console.log(docs);
                    var vol_list = {
                        "docs":docs
                    };
                    res.json(vol_list);
                })
});

app.post('/put_helper_list',function(req,res){
    var v_num = req.body.v_num;
    var v_user_id = req.body.v_user_id;
    var v_hp = req.body.v_hp;

    put_helper_list(v_num,v_user_id,v_hp);
});


app.post('/put_uni_list',function(req,res){
    var v_num = req.body.v_num;
    var v_user_id = req.body.v_user_id;
    var v_hp = req.body.v_hp;

    createReview(v_num,v_user_id,v_hp);
});


app.listen('3000',function(){
            console.log('express web server start');
});



