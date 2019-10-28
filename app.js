var express = require('express')
,http = require('http')
,fs = require('fs');

var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));   app.use(express.static('public'));

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
                    content : String,
                    user_email : String
});

var vol_list_schema = new Schema({
            v_num:String,
            v_title: String,
            v_content: String,
            current_uni: Number,
            max_uni: Number,
            current_helper: Number,
            max_helper: Number,
            s_date: String,
            e_date: String,
            r_date: String,
            r_time: String,
            v_place: String
})


var helper_list_schema = new Schema({
            v_num : String,
            v_user_id : String,
            v_email : String
});

var uni_list_schema = new Schema({
    v_num : String,
    v_user_id : String,
    v_email : String
});




var reviewModel = mongoose.model('reviewModel',review_schema,'review');
var vol_listModel = mongoose.model('vol_listModel',vol_list_schema,'vol_list');
var helper_listModel = mongoose.model('helper_listModel',helper_list_schema,'helper_list');
var uni_listModel = mongoose.model('uni_listModel',uni_list_schema,'uni_list');




function createReview(id,title,content,user_email){
            var newReview = new reviewModel;

            newReview.id = id;
            newReview.title = title;
            newReview.content = content;
            newReview.user_email = user_email;

            newReview.save(function (err) {
                                                if (err) throw err;
                                            });

            console.log('review:' + newReview.id+":" + newReview.title +":"+ newReview.content + ":" + user_email);

}

function put_helper_list(num,id,email){

    var newHelper = new helper_listModel;

    newHelper.v_num = num;
    newHelper.v_user_id = id;
    newHelper.v_email = email;
    /*
    helper_listModel.findOne({'v_num':num,'v_user_id':id,'v_email':email},function(err,output){
            console.log('find' + output);
            return;
    });
    */
    newHelper.save(function (err) {
                       if (err) throw err;
                                    });

    vol_listModel.findOne({'v_num':num},function(err,output){
            output.current_helper = output.current_helper +1;
            console.log(output);
            output.save();
    });

    //new_vol_list.update({v_num:'1'},{$set:{current_helper:5}});


    console.log('Helper:' +  newHelper.v_num+":" +  newHelper.v_user_id +":"+  newHelper.v_email);

}


function put_uni_list(num,id,email){

var newUni = new uni_listModel;

newUni.v_num = num;
newUni.v_user_id = id;
newUni.v_email = email;

newUni.save(function (err) {
                                if (err) throw err;
                            });

vol_listModel.findOne({'v_num':num},function(err,output){
    output.current_uni = output.current_uni +1;
            console.log(output);
            output.save();
    });

console.log('uni:' +  newUni.v_num+":" +  newUni.v_user_id +":"+  newUni.v_email);

}

app.post('/create_review',function(req,res){
    var id = req.body.id;
    var title = req.body.title;
    var content = req.body.content;
    var user_email = req.body.user_email;
    createReview(id,title,content,user_email);
});


app.get('/read_review/',function(req,res){

reviewModel.find({}).sort({date:-1}).exec(function(err,docs){
                        if(err) return res.status(500).json({error: err});
                        if(docs.length === 0) return res.status(404).json({error: 'review not found'});
                        console.log(docs);
                        res.json(docs);
                    })
});

app.get('/uni_list/',function(req,res){

uni_listModel.find({}).sort({date:-1}).exec(function(err,docs){
                        if(err) return res.status(500).json({error: err});
                        if(docs.length === 0) return res.status(404).json({error: 'uni not found'});
                        console.log(docs);
                        res.json(docs);
                    })
});

app.get('/helper_list/',function(req,res){

helper_listModel.find({}).sort({date:-1}).exec(function(err,docs){
                        if(err) return res.status(500).json({error: err});
                        if(docs.length === 0) return res.status(404).json({error: 'helper not found'});
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

app.get('/count_vol/:id',function(req,res){

    helper_listModel.find({v_email:req.params.id}).sort({date:-1}).exec(function(err,docs){
                            if(err) return res.status(500).json({error: err});
                            if(docs.length === 0) return res.status(404).json({"docs":[]});
                            console.log(docs);
                            var count  = {
                                                    "docs":docs
                                            };
                            res.json(count);
                            })
});


app.get('/count_review/:id',function(req,res){

    reviewModel.find({user_email:req.params.id}).sort({date:-1}).exec(function(err,docs){
                            if(err) return res.status(500).json({error: err});
                            if(docs.length === 0) return res.status(404).json({"docs":[]});
                            console.log(docs);
                            var count  = {
                                                    "docs":docs
                                            };
                            res.json(count);
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
    var v_email = req.body.v_email;

    var doc = 1;
    helper_listModel.findOne({'v_num':v_num,'v_user_id':v_user_id,'v_email':v_email},function(err,output){
        console.log('find' + output);

        if(err) throw err;
        if(output === null){
                put_helper_list(v_num,v_user_id,v_email);
                return res.status(200).json();
        }
        if(output !== null){
                return res.status(400).json();
        }

    });



   /*
   if(doc == 0){
           return res.status(400).json()
        }
   else{
    put_helper_list(v_num,v_user_id,v_email);
    return res.status(200).json();
   }
   */
});


app.post('/put_uni_list',function(req,res){
    var v_num = req.body.v_num;
    var v_user_id = req.body.v_user_id;
    var v_email = req.body.v_email;

    var doc;
    uni_listModel.findOne({'v_num':v_num,'v_user_id':v_user_id,'v_email':v_email},function(err,output){
        console.log('find' + output);
        doc = output
    });

        put_uni_list(v_num,v_user_id,v_email);
        return res.status(200).json();
});



app.listen('3000',function(){
            console.log('express web server start');
});



