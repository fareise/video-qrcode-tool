var express = require('express');
var router = express.Router();
var qrcode = require('qrcode');
var md5 = require("js-md5");
var ffmpeg = require('fluent-ffmpeg');
var multer = require('multer');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/qr';

var exec = require('child_process').exec;

var upload = multer({dest: 'uploads/'});
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/qr', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  var text = req.body.text;
  var width = req.body.width || 150;
  //var height = req.body.height || 150;
  /*if(text.length>10){
  	text = "https://" + md5(text);
  }*/
  //res.send(JSON.stringify(req.body.text));
  qrcode.toDataURL(text, function(err, url){
  	if(err) console.log('error: '+err);
  	var all = new Object();
  	all.url = url;
  	all.width = width;
  	all.height = width;
  	res.send(JSON.stringify(all));
  });
});

router.post('/shorten', function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  var timeNow = new Date();
  var num = timeNow.getYear().toString()+timeNow.getMonth().toString()+timeNow.getDay().toString()+timeNow.getHours().toString()+timeNow.getMinutes().toString()+timeNow.getSeconds().toString();
  var shortener = string10to62(num);
  //var shourl = "localhost:3000/users/go/" + shortener;
  var shourl = "http://192.168.252.8:3000/users/go/" + shortener;
  MongoClient.connect(url, function(err, db){
    var collection = db.collection("qrcode");
    collection.insertMany([{orgin:req.body.text,sho:shortener}], function(err, result){
      console.log("插入成功!");
    });
  })
  var all = new Object();
  all.shourl = shourl;
  all.text = req.body.text;
  res.send(JSON.stringify(all));
})

router.get('/go/:sho', function(req, res, next){
  //console.log(req.params.sho);

  MongoClient.connect(url, function(err, db){
    var collection = db.collection("qrcode");
    collection.find({sho:req.params.sho}).toArray(function(err, docs){
      var gourl = docs[0].orgin;
      if(gourl.indexOf("https://") == -1 && gourl.indexOf("http://") == -1){
        gourl = "https://" + gourl;
      }
      console.log(gourl);
      res.redirect(gourl);
    })
  })
})

router.post('/formup', upload.single('testfile'), function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  var save = req.body.save;
  var format = req.body.format || "mp4";
  //console.log(req.body);    //这里返回form提交的各个字段内容
  //console.log(req.file);
  if(req.file == undefined){
    //res.render('verror', {message: "您还没有选择文件！"});
    //res.send(req.file);
    res.send("您还没有选择文件！")
  }else{
    var command = new ffmpeg(req.file.path);
    command.ffprobe(function(err, data){
      var long = data.format.duration;
      if(long > 300){
        //res.render('verror', {message: "视频大小超过了5分钟，请重新上传！(该视频长度" + Math.floor(long/60) + "分钟)"});
        res.send("视频大小超过了5分钟，请重新上传！")
      }else{
        var width = req.body.width || 480;
        var height = req.body.height || 270;
        var fps = req.body.fps || 30;
        var kbps = req.body.kbps || 200;
        var format = req.body.format || "mp4";
        var save = req.body.save || "temp";
        command.size(width + 'x' + height)
          .fps(fps)
          .videoBitrate(kbps)
          .format(format)
          .on('end', function() {
            //res.send('视频转码成功。查看地址：http://localhost:3000/users/video/' + req.body.save + '.' + req.body.format);
            console.log('视频转码成功');
            postVideo('public/outset/' + save + '.' + format).then(function(ret){
              //console.log(ret.url);
              //res.render('vres', {loc: ret.url});
              res.send(ret.url);
            })
          })
          .on('error', function(err) {
            //res.render('verror', {message: "转码过程发生如下错误：" + err.message});
            res.send(err.message);
            /*res.send('发生错误： ' + err.message);
            console.log('发生错误： ' + err.message);*/
          })
          .save('public/outset/' + save + '.' + format);
      }
    })
    /*postVideo('public/outset/' + save + '.' + format).then(function(ret){
      console.log(ret);
    })*/
  }
  /*command.size(req.body.width + 'x' + req.body.height)
  .fps(req.body.fps)
  .videoBitrate(req.body.kbps)
  .format(req.body.format)
  .on('end', function() {
    //res.send('视频转码成功。查看地址：http://localhost:3000/users/video/' + req.body.save + '.' + req.body.format);
    console.log('视频转码成功');
    res.render('vres', {loc: "http://localhost:3000/users/video/" + req.body.save + '.' + req.body.format});
  })
  .on('error', function(err) {
    res.send('发生错误： ' + err.message);
    console.log('发生错误： ' + err.message);
  })
  .save('public/outset/' + req.body.save + '.' + req.body.format);*/
});

router.get('/video/:name', function(req, res, next){
  res.render('video', {vurl: "../../outset/" + req.params.name, name: req.params.name, down: "localhost:3000/outset/" + req.params.name});
})

var postVideo = function (path) {
  var cmdStr = `curl -X POST -F static_file=@${path} http://image.ads.yidianzixun.com/?type=video`;
  return new Promise(function (resolve, reject) {
    exec(cmdStr, function(err,stdout,stderr){
      if(err) {
        console.log('get api error:'+stderr);
        reject(stderr);
      } else {
        var data = JSON.parse(stdout);
        resolve(data);
      }
    });
  });
};

function string10to62(number) {
  var chars = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ'.split(''),
    radix = chars.length,
    qutient = +number,
    arr = [];
  do {
    mod = qutient % radix;
    qutient = (qutient - mod) / radix;
    arr.unshift(chars[mod]);
  } while (qutient);
  return arr.join('');
}

module.exports = router;
