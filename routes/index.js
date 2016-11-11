var express = require('express');
var router = express.Router();
var qrcode = require('qrcode');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/qr', function(req, res, next){
	res.send("test!");
})

router.post('/fdtest', function(req, res, next){
	res.send("fdtest!");
})

router.get('/qrtest', function(req, res, next){
	/*qrcode.toDataURL("lakjsdklajsdlkajslkdjaklsj", {qrWidth:300}, function(err, url){
		res.send(url);
	})*/
	qrcode.draw('asdasdasdlasjdlkajsdlja',function(error, canvas){
		console.log(canvas);
		res.send(canvas.toDataURL());
	})
})

module.exports = router;
