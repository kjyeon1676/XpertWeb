window.onload = function(){
   $('#preview').css('display', 'none');
};
function dataURItoBlob(dataURI)
{
    var byteString = atob(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++)
    {
        ia[i] = byteString.charCodeAt(i);
    }

    var bb = new Blob([ab], { "type": mimeString });
    return bb;
}
/* thumbnail 만들기 */
function onThumnail(obj){
    var fileList = obj.files;
    //읽기

    var reader = new FileReader();
    reader.readAsDataURL(fileList[0]);
    //alert(fileList[0]);
    //load 후
    reader.onload = function(){
        //XhttpRequest로 send
        //thumbnail 이미지 생성
        var tempImage = new Image();
        tempImage.src = reader.result;
        tempImage.onload = function(){
            var canvas = document.createElement('canvas');
            var canvasContext = canvas.getContext("2d");

            // 크기 설정
            canvas.width = 100;
            canvas.height = 100;
            canvasContext.drawImage(this, 0, 0, 100, 100);

            //이미지를 다시 data-uri 변환
            var dataURL = canvas.toDataURL("image/jpeg");
            var blob = dataURItoBlob(dataURL);
            var formData = new FormData();
            formData.append("imgFile", blob, 'thumbnail-' + fileList[0].name);
            var request = new XMLHttpRequest();

            request.open("POST", "/upload", true);
            request.send(formData);
        }
    };
};
