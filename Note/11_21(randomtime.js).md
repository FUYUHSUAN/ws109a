### 學習了JS的random time用法
>* 當使用迴圈時，建議用這個方法
```
//Random
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
for (var i = 0; i < 5; i++) { 
    await sleep(getRandomInt(5000));//delay random 0~5 秒才印出下一行
    console.log("Hello World");
}
```
