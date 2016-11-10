var express = require('express');
var mysql = require('mysql');
var dt = require('date-utils');
var fs = require('fs');
var multer = require('multer');
var multiparty = require('multiparty');
var session = require('express-session')
/* GET home page. */
var pool = mysql.createPool({
        host : 'localhost',
        port : 3306,
        user : 'root',
        password : '1234',
        database : 'xpert',
        connectionLimit : 20,
        waitForConnections : false
});
exports.sign_up = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var user_name = '';
    try {
        Email = userInfo.EMail;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    } catch (e) { }
    if (Email == '') {
       res.render('sign_up', { title:'@Xpert HomePage',MyEMail:'손님',Mypriority:'손님',
            MyName:'손님'
        });
    } else {
        res.render('sign_up',{
           title:'Freeboard',MyEMail:Email,Mypriority:priority,MyName:user_name
        });
    }
};
exports.sign_up_post = function(req,res){
    var e=req.body.myEmail;
    var p=req.body.myPassword;
    var pr=req.body.myPassword;
    var name = req.body.myName;
    var phone = req.body.myPhone;
    var Address = req.body.myAddress;
    var pLCheck = req.body.priorityl;
    var pNCheck = req.body.priorityn;
    var pHCheck = req.body.priorityh;
    var pCheck = '';
    var grade = '';
    if(pLCheck=='on') pCheck=1;
    else if(pNCheck=='on') pCheck=2;
    else pCheck=3;
    
    //agree 및 bot check 확인
    if(req.body.category==0) grade='1학년';
    else if(req.body.category==1) grade='2학년';
    else if(req.body.category==2) grade='3학년';
    else grade='4학년';
    pool.getConnection(function(err,connection){
        var query = connection.query('SELECT Email FROM users WHERE Email=\''+e+'\';',function(error,result){
        if(error){ console.log("실패"); connection.release(); }
        else{
            if(result[0]){
                res.send('<script>alert(\'둥록된 메일 입니다.\'); location.href=\"/sign_up\"</script>');
            }else{
            console.log(result);
            var query = connection.query('INSERT INTO users (Email,password,priority,name,Address,grade,phone) VALUES(?,?,?,?,?,?,?)',[e,p,pCheck,name,Address,grade,phone]);
            //req.session.userInfo={Email:e,priority:pCheck,uName:name}
            connection.release();
            res.send('<script>alert(\'가입 완료되었습니다.\'); location.href=\"/\"</script>');
            }
        }
    });
    });
};
exports.indexNew = function(req,res){
    res.render('indexNew');
};
exports.upload = function(req,res,next){
    var form = new multiparty.Form();
    var f_name = '';
	// get field name & value
	form.on('field',function(name,value){
		console.log('normal field / name = '+name+' , value = '+value);
	});
	// file upload handling
	form.on('part',function(part){
		var filename;
		var size;
		if (part.filename) {
			filename = part.filename;
            f_name = filename;
			size = part.byteCount;
		}else{
			part.resume();
		
		}	
		console.log("Write Streaming file :"+filename);
		var writeStream = fs.createWriteStream(__dirname + '\\..\\uploaded\\'+ filename);
		part.pipe(writeStream);

		part.on('data',function(chunk){
			console.log(filename+' read '+chunk.length + 'bytes');
		});
		
		part.on('end',function(){
			console.log(filename+' Part read complete');
			writeStream.end();
		});
	});
	// all uploads are completed
	form.on('close',function(){
		res.send(f_name);
	});
	
	// track progress
	form.on('progress',function(byteRead,byteExpected){
		console.log(' Reading total  '+byteRead+'/'+byteExpected);
	});
	form.parse(req);
};
exports.board_write_post = function(req,res){
    var MyEmail = req.body.Memail;
    var Title = req.body.title;
    var Name = req.body.Mname;
    var Message = req.body.message;
    var Psw = req.body.psw;
    var Category = req.body.category;
    var boardCat = req.body.boardCategory;
    var dt = new Date();
    var Mdate = dt.toFormat('YYYY-MM-DD HH24:MM');
    if(Psw=='undefined'){
        pool.getConnection(function(err,connection){
           var query = connection.query('INSERT INTO freeboard (iname,iidx,itext,mdate,icount,title,psw,category,boardCategory) VALUES(?,?,?,?,?,?,?,?,?)',[Name,MyEmail,Message,Mdate,0,Title,'',Category,boardCat], function(error,result){
           if(error){ console.log("실패"); connection.release();}
           res.redirect('/freeboard_list');
           });
        });
    }
    else{
        pool.getConnection(function(err,connection){
           var query = connection.query('INSERT INTO freeboard (iname,iidx,itext,mdate,icount,title,psw,category,boardCategory) VALUES(?,?,?,?,?,?,?,?,?)',[Name,MyEmail,Message,Mdate,0,Title,Psw,Category,boardCat], function(error,result){
           if(error){ console.log("실패"); connection.release();}
           console.log(query);
           res.redirect('/freeboard_list');
           });
        });
    }
};
exports.board_write = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var user_name = '';
    var cookieemail = req.cookies.cookieemail;
    try{
        Email = userInfo.EMail;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email == ''){
        res.clearCookie('cookieemail');
        res.send('<script>alert(\'권한이 없습니다.\'); location.href=\"/freeboard_list\"</script>');
        
    }else{
        res.render('board_write',{
           title:'Freeboard',MyEMail:Email,Mypriority:priority,MyName:user_name
        });
    }
};
exports.list_test = function(req,res){
    var totalStudents = 80,
        pageSize = 5,
        pageCount = 80/8,
        currentPage = 1,
        students = [],
        studentsArrays = [], 
        studentsList = [];

    //genreate list of students
    for (var i = 1; i < totalStudents; i++) {
        students.push({name: 'Student Number ' + i});
    }

    //split list into groups
    while (students.length > 0) {
        studentsArrays.push(students.splice(0, pageSize));
    }

    //set current page if specifed as get variable (eg: /?page=2)
    if (typeof req.query.page !== 'undefined') {
        currentPage = +req.query.page;
    }

    //show list of students from group
    studentsList = studentsArrays[+currentPage - 1];

    //render index.ejs view file
    res.render('list_test', {
        students: studentsList,
        pageSize: pageSize,
        totalStudents: totalStudents,
        pageCount: pageCount,
        currentPage: currentPage
    });
};
exports.freeboard_post_update_next = function(req,res){
    var textId = req.params.id;
    var uTitle = req.body.title;
    var uMessage = req.body.message;
    var uPsw = req.body.psw;
    var dt = new Date();
    var Mdate = dt.toFormat('YYYY-MM-DD HH24:MM');
    console.log(uTitle);
    console.log(uMessage);
    if(uPsw==''){
        pool.getConnection(function(err,connection){
        var sql = 'UPDATE freeboard SET title=\''+uTitle+'\',itext=\''+uMessage+'\',mdate=\''+Mdate+'\',psw=null WHERE idx=\''+textId+'\';'
            connection.query(sql,function(err,result){
            if(err) { console.log("실패요 업데이트");}
            else{
                res.send('<script>alert(\'수정완료.\'); location.href=\"/freeboard_list\"</script>');
            }
            });
        });
    }else{
        pool.getConnection(function(err,connection){
        var sql = 'UPDATE freeboard SET title=\''+uTitle+'\',itext=\''+uMessage+'\',mdate=\''+Mdate+'\',psw=\''+uPsw+'\' WHERE idx=\''+textId+'\';'
            connection.query(sql,function(err,result){
            if(err) { console.log("실패요 업데이트");}
            else{
                res.send('<script>alert(\'수정완료.\'); location.href=\"/freeboard_list\"</script>');
            }
            });
        });
    }
};
exports.freeboard_post_update = function(req,res){
    var userInfo = req.session.userInfo;
    var textId = req.params.id;
    console.log(textId);
    var Email = '';
    var priority = '';
    var cnt = '';
    var user_name = '';
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email==''){ // 일반 사용자(손님)
        pool.getConnection(function(err,connection){
        var sql = 'SELECT * FROM freeboard WHERE idx=\''+textId+'\';'
            connection.query(sql,function(err,result){
                console.log(result);
                connection.release();
                res.render('freeboard_post_update',{
                        title:'Freeboard_post_update', MyEMail:'손님',Mypriority:'손님', rows:result[0],
                        MyName:'손님'
                });
            });
        });
    }else{
        pool.getConnection(function(err,connection){
        var sql = 'SELECT * FROM freeboard WHERE idx=\''+textId+'\';'
            connection.query(sql,function(err,result){
                if(result[0]){
                    console.log(result);
                    connection.release();
                    res.render('freeboard_post_update',{
                        title:'Freeboard_post_update', MyEMail:Email,Mypriority:priority, rows:result[0],
                        MyName:user_name
                    });
                }else{ console.log("실패");}
            });
        });
    }
};
exports.freeboard_post_psw = function(req,res){
    var userInfo = req.session.userInfo;
    var textId = req.params.id;
    var Email = '';
    var user_name = '';
    var priority = '';
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email==''){
        res.render('freeboard_post_psw',{
           title:'Freeboard_post_psw',MyEMail:'손님',Mypriority:'손님',
           MyName:'손님',MyId:textId
        });
    }else
    {
        res.render('freeboard_post_psw',{
           title:'Freeboard_post_psw',MyEMail:Email,Mypriority:priority,
           MyName:user_name,MyId:textId
        });
    }
};
exports.freeboard_post_psw_mp = function(req,res){
    var userInfo = req.session.userInfo;
    var textId = req.params.id;
    var inputPsw = req.body.textPassword;
    console.log(textId);
    console.log(inputPsw);
    var Email = '';
    var priority = '';
    var cnt = '';
    var user_name = '';
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email==''){
        pool.getConnection(function(err,connection){
            var sql = 'SELECT * FROM freeboard WHERE idx=\''+textId+'\';'
                connection.query(sql,function(err,result){
                    if(inputPsw!=result[0].psw){
                        res.send('<script>alert(\'잘못된 비밀번호입니다.\'); location.href=\"/freeboard_list\"</script>');
                    }else{
                        connection.release();
                        res.render('freeboard_post',{
                            title:'Freeboard_post', MyEMail:'손님',Mypriority:'손님', rows:result[0],
                            MyName:'손님'
                        });
                    }
                });
        });
    }else{
        pool.getConnection(function(err,connection){
            var sql = 'SELECT * FROM freeboard WHERE idx=\''+textId+'\';'
                connection.query(sql,function(err,result){
                    if(inputPsw!=result[0].psw){
                        res.send('<script>alert(\'잘못된 비밀번호입니다.\'); location.href=\"/freeboard_list\"</script>');
                    }else{
                        connection.release();
                        res.render('freeboard_post',{
                            title:'Freeboard_post', MyEMail:Email,Mypriority:priority, rows:result[0],
                            MyName:user_name
                        });
                    }
                });
        });
    }
};
exports.freeboard_post = function(req,res){
    var userInfo = req.session.userInfo;
    var textId = req.params.id;
    console.log(textId);
    var Email = '';
    var priority = '';
    var cnt = '';
    var user_name = '';
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email==''){ // 일반 사용자(손님)
        pool.getConnection(function(err,connection){
        var sql = 'SELECT * FROM freeboard WHERE idx=\''+textId+'\';'
            connection.query(sql,function(err,result){
                console.log(result);
                res.render('freeboard_post',{
                        title:'Freeboard_post', MyEMail:'손님',Mypriority:'손님', rows:result[0],
                        MyName:'손님'
                });
            });
        });
    }else{
        pool.getConnection(function(err,connection){
        var sql = 'SELECT * FROM freeboard WHERE idx=\''+textId+'\';'
            connection.query(sql,function(err,result){
                if(result[0]){
                    console.log(result);
                    res.render('freeboard_post',{
                        title:'Freeboard_post', MyEMail:Email,Mypriority:priority, rows:result[0],
                        MyName:user_name
                    });
                }else{ console.log("실패");}
            });
        });
    }
};

exports.freeboard_list_search = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority = '';
    var cnt = '';
    var user_name = '';
    var s = req.query.MyQuery;
    console.log(s);
    var totalStudents = '';
    var pageSize = 5;
    var pageCount = '';
    var currentPage = 1,
    students = [],
    studentsArrays = [],
    studentsList = [];
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email==''){
        pool.getConnection(function(err,connection){
        var sql = 'SELECT Count(idx) cnt FROM freeboard WHERE title=\''+s+'\';'
        console.log(sql);
            connection.query(sql,function(err,rows){
                if(err) { console.log(err);}
                cnt = rows[0].cnt;
                totalStudents = cnt;
                pageCount = Math.ceil(cnt / pageSize);
                var query = connection.query('SELECT idx,iname,icount, date_format(mdate,"%y-%m-%d %H:%i") mdate,title,category,boardCategory FROM freeboard WHERE title=\''+s+'\';',function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_list',{
                        title:'Freeboard_list', MyEMail:'손님',Mypriority:'손님', rows:result,
                        MyName:'손님',
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
        });
        });
    }else{
        pool.getConnection(function(err,connection){
        var sql = 'SELECT Count(idx) cnt FROM freeboard WHERE title=\''+s+'\';'
            connection.query(sql,function(err,rows){
                if(err) { console.log(err);}
                cnt = rows[0].cnt;
                totalStudents = cnt;
                pageCount = Math.ceil(cnt / pageSize);
                var query = connection.query('SELECT idx,iname,icount, date_format(mdate,"%y-%m-%d %H:%i") mdate,title,category,boardCategory FROM freeboard WHERE title=\''+s+'\';',function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_list',{
                        title:'Freeboard_list', MyEMail:'손님',Mypriority:'손님', rows:result,
                        MyName:'손님',
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
        });
        });
    }
};
exports.freeboard_list = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var cnt = '';
    var user_name = '';
    var totalStudents = '';
    var pageSize = 5;
    var pageCount = '';
    var currentPage = 1,
    students = [],
    studentsArrays = [],
    studentsList = [];
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email == ''){
       pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=1;"
            connection.query(sql,function(err,rows){
                if(err) { console.log(err);}
                cnt = rows[0].cnt;
                totalStudents = cnt;
                pageCount = Math.ceil(cnt / pageSize);
                var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,boardCategory,category,psw FROM freeboard",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_list',{
                        title:'Freeboard_list', MyEMail:'손님',Mypriority:'손님', rows:result,
                        MyName:'손님',
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }else{
        pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=1;"
            connection.query(sql,function(err,rows){
               if(err) { console.log(err);}
               cnt = rows[0].cnt;
               totalStudents = cnt;
               pageCount = Math.ceil(cnt / pageSize);
            var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,category,boardCategory,psw FROM freeboard",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_list',{
                        title:'Freeboard_list', MyEMail:Email,Mypriority:priority, rows:result,
                        MyName:user_name,
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }
};
exports.freeboard_web = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var cnt = '';
    var user_name = '';
    var totalStudents = '';
    var pageSize = 5;
    var pageCount = '';
    var currentPage = 1,
    students = [],
    studentsArrays = [],
    studentsList = [];
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email == ''){
       pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=2;"
            connection.query(sql,function(err,rows){
                if(err) { console.log(err);}
                cnt = rows[0].cnt;
                totalStudents = cnt;
                pageCount = Math.ceil(cnt / pageSize);
                var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,boardCategory,category,psw FROM freeboard WHERE boardCategory=2",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_web',{
                        title:'Freeboard_web', MyEMail:'손님',Mypriority:'손님', rows:result,
                        MyName:'손님',
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }else{
        pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=2;"
            connection.query(sql,function(err,rows){
               if(err) { console.log(err);}
               cnt = rows[0].cnt;
               totalStudents = cnt;
               pageCount = Math.ceil(cnt / pageSize);
            var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,category,boardCategory,psw FROM freeboard WHERE boardCategory=2",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_web',{
                        title:'Freeboard_web', MyEMail:Email,Mypriority:priority, rows:result,
                        MyName:user_name,
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }
};
exports.freeboard_network = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var cnt = '';
    var user_name = '';
    var totalStudents = '';
    var pageSize = 5;
    var pageCount = '';
    var currentPage = 1,
    students = [],
    studentsArrays = [],
    studentsList = [];
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email == ''){
       pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=4;"
            connection.query(sql,function(err,rows){
                if(err) { console.log(err);}
                cnt = rows[0].cnt;
                totalStudents = cnt;
                pageCount = Math.ceil(cnt / pageSize);
                var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,boardCategory,category,psw FROM freeboard WHERE boardCategory=4",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_network',{
                        title:'Freeboard_network', MyEMail:'손님',Mypriority:'손님', rows:result,
                        MyName:'손님',
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }else{
        pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=4;"
            connection.query(sql,function(err,rows){
               if(err) { console.log(err);}
               cnt = rows[0].cnt;
               totalStudents = cnt;
               pageCount = Math.ceil(cnt / pageSize);
            var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,category,boardCategory,psw FROM freeboard WHERE boardCategory=4",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_network',{
                        title:'Freeboard_network', MyEMail:Email,Mypriority:priority, rows:result,
                        MyName:user_name,
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }
};
exports.freeboard_system = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var cnt = '';
    var user_name = '';
    var totalStudents = '';
    var pageSize = 5;
    var pageCount = '';
    var currentPage = 1,
    students = [],
    studentsArrays = [],
    studentsList = [];
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email == ''){
       pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=3;"
            connection.query(sql,function(err,rows){
                if(err) { console.log(err);}
                cnt = rows[0].cnt;
                totalStudents = cnt;
                pageCount = Math.ceil(cnt / pageSize);
                var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,boardCategory,category,psw FROM freeboard WHERE boardCategory=3",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_system',{
                        title:'Freeboard_system', MyEMail:'손님',Mypriority:'손님', rows:result,
                        MyName:'손님',
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }else{
        pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=3;"
            connection.query(sql,function(err,rows){
               if(err) { console.log(err);}
               cnt = rows[0].cnt;
               totalStudents = cnt;
               pageCount = Math.ceil(cnt / pageSize);
            var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,category,boardCategory,psw FROM freeboard WHERE boardCategory=3",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_system',{
                        title:'Freeboard_system', MyEMail:Email,Mypriority:priority, rows:result,
                        MyName:user_name,
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }
};
exports.freeboard_reversing = function(req,res){
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var cnt = '';
    var user_name = '';
    var totalStudents = '';
    var pageSize = 5;
    var pageCount = '';
    var currentPage = 1,
    students = [],
    studentsArrays = [],
    studentsList = [];
    try{
        Email = userInfo.Email;
        priority = userInfo.priority;
        user_name = userInfo.uName;
    }catch(e) { }
    if(Email == ''){
       pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=5;"
            connection.query(sql,function(err,rows){
                if(err) { console.log(err);}
                cnt = rows[0].cnt;
                totalStudents = cnt;
                pageCount = Math.ceil(cnt / pageSize);
                var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,boardCategory,category,psw FROM freeboard WHERE boardCategory=5",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_reversing',{
                        title:'Freeboard_reversing', MyEMail:'손님',Mypriority:'손님', rows:result,
                        MyName:'손님',
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }else{
        pool.getConnection(function(err,connection){
            var sql = "SELECT Count(idx) cnt FROM freeboard WHERE boardCategory=5;"
            connection.query(sql,function(err,rows){
               if(err) { console.log(err);}
               cnt = rows[0].cnt;
               totalStudents = cnt;
               pageCount = Math.ceil(cnt / pageSize);
            var query = connection.query("SELECT idx,iname,icount, date_format(mdate,'%y-%m-%d %H:%i') mdate,title,category,boardCategory,psw FROM freeboard WHERE boardCategory=5",function(error,result){
                if(error) { console.log("실패"); connection.release();} 
                else{
                    for(var i=0; i< totalStudents; i++){
                        students.push({idx:result[i].idx,
                            iname:result[i].iname,
                            icount:result[i].icount,
                            mdate:result[i].mdate,
                            title:result[i].title,
                            psw:result[i].psw,
                            category:result[i].category,
                            boardCategory:result[i].boardCategory
                        });
                    }
                    while(students.length > 0){
                        studentsArrays.push(students.splice(0,pageSize));
                    }
                    if(typeof req.query.page !== 'undefined'){
                        currentPage = +req.query.page;
                    }
                    studentsList = studentsArrays[+currentPage - 1];
                    connection.release();
                    res.render('freeboard_reversing',{
                        title:'Freeboard_reversing', MyEMail:Email,Mypriority:priority, rows:result,
                        MyName:user_name,
                        students: studentsList,
                        pageSize : pageSize,
                        totalStudents: totalStudents,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });
                }
            });
            });
        });
    }
};
exports.index = function(req, res) {
    var userInfo = req.session.userInfo;
    var Email = '';
    var priority='';
    var user_name = '';
    var cookieemail=req.cookies.cookieemail;
    console.log(userInfo);
    try {
        Email = userInfo.Email;
        priority=userInfo.priority;
        user_name = userInfo.uName;
    } catch (e) { }
    if (Email == '') {
        if(cookieemail!=null){
            pool.getConnection(function(err,connection){
                var query = connection.query('SELECT * FROM users WHERE Email=\''+Email+'\';',function(error,result){
                if(error){ console.log("실패"); connection.release(); }else{
                    if(result[0]){
                        if(result[0].priority==3){res.clearCookie('cookieemail');res.send('<script>alert(\'차단된 사용자 입니다.\'); location.href=\"/\"</script>');} else{
                        req.session.userInfo={'Email':Email,'priority':result[0].priority,'uName':result[0].name};
                        connection.release();
                        res.render('index', { title: '@Xpert Homepage', MyEMail:email, Mypriority:priority, MyName:user_name });
                        }
                        
                    } else{
                        connection.release();
                        res.render('index', { title: '@xpert Homepage', MyEMail:'손님', Mypriority:'손님',MyName:'손님' });
                        
                    }
                }
            });
            });
        }
        else{
            res.render('index', { title: '@Xpert homePage',MyEMail:'손님', Mypriority:'손님',MyName:'손님' });
        }
    } 
    else {
        res.render('index', { title: '@Xpert homePage',MyEMail:Email, Mypriority:priority, MyName:user_name });
    }
};       
exports.logout = function(req,res){
    console.log(req.session.userInfo.Email+'님 로그아웃.');
    req.session.destroy(function(error){
        res.clearCookie('cookieemail');
        res.send('<script>alert(\'로그아웃 되었습니다.\'); location.href=\"/\"</script>');
    })
};
exports.login = function(req, res){
    var userInfo = req.session.userInfo;
    console.log(userInfo);
    var EMail = '';
    var user_name = '';
    try {
        EMail = userInfo.EMail;
        user_name = userInfo.uName;
    } catch (e) { }
    if (EMail == '') {
        res.render('login', {
            title: '로그인', MyEMail:'손님',Mypriority:'손님',
                MyName:'손님'
            });
    } else {
        res.redirect('/');
    }
};
exports.login_post = function(req, res){
	var e=req.body.email;
	var p=req.body.password;
    console.log(e);
    console.log(p);
    pool.getConnection(function(err,connection){
        var query = connection.query('SELECT * FROM users WHERE Email=\''+e+'\'',function(error,result,fields){
		if(error){ console.log("실패"); connection.release(); throw err;}
		else{
			if(result[0]){
                if(result[0].priority==3){res.clearCookie('cookieemail');res.send('<script>alert(\'차단된 사용자 입니다.\'); location.href=\"/\"</script>');} else {
				if(result[0].Email==e&&result[0].password==p){
					var userInfo={EMail:e,priority:result[0].priority,uName:result[0].name};
					req.session.userInfo=userInfo;
                    console.log(e+'님 로그인.');
					connection.release();
                    res.redirect('/');
				}else{
                    res.send('<script>alert(\'등록되지 않은 사용자이거나 잘못된 비밀번호 입니다.\'); location.href=\"/login\"</script>');
				}
            }
			}else{
              res.send('<script>alert(\'등록되지 않은 사용자이거나 잘못된 비밀번호 입니다.\'); location.href=\"/login\"</script>');
            }
        }
	});	
    });
};