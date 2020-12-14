var myObj = { prop1: 'hello world' },
    myProperty = 777;
myObj.prop1 = 'hey world';
myObj["prop-2"] = 123;
myObj[myProperty] = 456;

console.log(myObj)
console.log(myObj.prop1);				// "hey world"
console.log(myObj["prop-2"]);			// 123
console.log(myObj[myProperty]);	