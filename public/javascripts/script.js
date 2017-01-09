function loginCheck(){
    var e=document.getElementById("emailIn");
    var p=document.getElementById("passwordIn");
    if(e.value==""){alert('EMail을 입력하세요.');e.focus();return false;}
    else if(p.value==""){alert('PassWord를 입력하세요.');p.focus();return false;}
    else{
        document.loginform.submit();
    }
}
function showPasw(){
    var psw = document.getElementById("copy");
    if(psw.checked){
        alert('Check됨');
    }
    else alert('안됨');
}

function showPassContext(){
    if($("#copy").is(":checked"))
    {
        $('cPsw').append('<label><h3>Password</h3></label> <div class="6u"> <input type="text" name="psw" id="psw"/> </div>');
    }
}

function signUpCheck(){
    var email=document.getElementById("myEmail");
    var name=document.getElementById("myName");
    var passwd=document.getElementById("myPassword");
    var passwdConfirm=document.getElementById("confirmPassword");
    //value check

    if(email.value == ""){
        alert('Email을 입력해주세요');
        email.focus();
        return false;
    }else if(name.value == ""){
        alert('이름을 입력해주세요');
        name.focus();
        return false;
    }else if(passwd.value == ""){
        alert('비밀번호를 입력해주세요');
        passwd.focus();
        return false;
    }else if(passwdConfirm.value == ""){
        alert('비밀번호 재확인 부분을 입력해주세요');
        passwdConfirm.focus();
        return false;
    }else{
        document.signUpForm.submit();
    }
}
function getCmaFileInfo(obj,stype) {
    var fileObj, pathHeader , pathMiddle, pathEnd, allFilename, fileName, extName;
    if(obj == "[object HTMLInputElement]") {
        fileObj = obj.value
    } else {
        fileObj = document.getElementById(obj).value;
    }
    if (fileObj != "") {
            pathHeader = fileObj.lastIndexOf("\\");
            pathMiddle = fileObj.lastIndexOf(".");
            pathEnd = fileObj.length;
            fileName = fileObj.substring(pathHeader+1, pathMiddle);
            extName = fileObj.substring(pathMiddle+1, pathEnd);
            allFilename = fileName+"."+extName;
 
            if(stype == "all") {
                    return allFilename; // 확장자 포함 파일명
            } else if(stype == "name") {
                    return fileName; // 순수 파일명만(확장자 제외)
            } else if(stype == "ext") {
                    return extName; // 확장자
            } else {
                    return fileName; // 순수 파일명만(확장자 제외)
            }
    } else {
            alert("파일을 선택해주세요");
            return false;
    }
 }
function getFileDown(){
    var f = document.getElementById("txt");
    window.location = '/download/' + f.value;
}

