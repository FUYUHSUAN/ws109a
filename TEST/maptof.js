const array1=[1,4,9,16]

function mul(x){
    for (var i=1;i<array1.length;i++){
        array1[i]=array1[i]*x;
    }
    return array1;
}
console.log(mul(2))