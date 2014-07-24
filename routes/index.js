var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');


module.exports = function(app){	
app.get('/',function(req, res){
  res.render('index', { title: 'PVD+' });
});

app.get('/Travel', function(req, res){
  res.render('Travel', { title: 'Travel' });
}); 

//Regindex　　
app.get('/Regindex', function(req,res){
        Post.get(null, function(err, posts){
            if(err){
                posts = [];
            } 
            res.render('Regindex',{
                title:'旅遊筆記',
                user: req.session.user,
                posts:posts,
                success:req.flash('success').toString()
            });
        });
    });

    app.get('/reg', checkNotLogin);
    app.get('/reg', function(req,res){
        res.render('reg',{
            title:'加入我們',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        }); 
    });

	app.post('/reg', checkNotLogin);
　　app.post('/reg', function(req,res){
        if(req.body['password-repeat'] != req.body['password']){
            req.flash('error','兩次輸入密碼不同'); 
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var newUser = new User({
            name: req.body.username,
            password: password,
        });
        User.get(newUser.name, function(err, user){
            if(user){
                err = '用戶名稱重複';
            }
            if(err){
                req.flash('error', err);
                return res.redirect('/reg');
            }
            newUser.save(function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success','註冊成功!歡迎加入我們!');
                res.redirect('/');
            });
        });
    });

    app.get('/login', checkNotLogin);
　　app.get('/login', function(req, res){
        res.render('login',{
            title:'登入',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        }); 
    });

    app.post('/login', checkNotLogin);
　　app.post('/login', function(req, res){
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('base64');
        User.get(req.body.username, function(err, user){
            if(!user){
                req.flash('error', '使用者不存在'); 
                return res.redirect('/login'); 
            }
            if(user.password != password){
                req.flash('error', '密碼錯誤'); 
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登入成功');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
　　app.get('/logout', function(req, res){
        req.session.user = null;
        req.flash('success','登出成功');
        res.redirect('/');
	});

	app.get('/post', checkLogin);
    app.get('/post', function(req, res){
        res.render('post',{
            title:'貼文',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        }); 
    });
    
	app.post('/post', checkLogin);
    app.post('/post', function(req, res){
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error', err); 
                return res.redirect('/');
            }
            req.flash('success', '貼文成功!');
            res.redirect('/');
        });
    });
};

function checkLogin(req, res, next){
    if(!req.session.user){
        req.flash('error','未登入'); 
        return res.redirect('/login');
    }
    next();
}


function checkNotLogin(req,res,next){
    if(req.session.user){
        req.flash('error','已登入'); 
        return res.redirect('/');
    }
    next();
}