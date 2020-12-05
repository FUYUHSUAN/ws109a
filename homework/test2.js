function getValue(){
    var x = document.getElementById("search");
    var userfill = x.value;
    userfill=userfill.replace('""','') //將引號取代成空格
    console.log(userfill);
}


    