function getValue(){
    var x = document.getElementById("loginForm");
    var userfill = x.elements[0].value;
    userfill=userfill.replace('""','') //將引號取代成空格
    console.log(userfill);
}


    