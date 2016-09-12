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