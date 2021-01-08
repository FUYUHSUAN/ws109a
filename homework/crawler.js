import { get, post } from './esearch.js'

var urlList = [
  // 'http://msn.com', 
  'https://en.wikipedia.org/wiki/Main_Page' //起始點
]

var urlMap = {}

async function getPage(url) {
  try {
    const res = await fetch(url);
    return await res.text();  
  } catch (error) {
    console.log('getPage:', url, 'fail!')
  }
}

function html2urls(html) {
  var r = /\shref\s*=\s*['"](.*?)['"]/g
  var urls = []
  while (true) {
    let m = r.exec(html)
    if (m == null) break
    urls.push(m[1])
  }
  return urls
}

async function craw(urlList, urlMap) {

  var count = 0
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }//給他random值
  
  for (let i=0; i<urlList.length; i++) {
  // for (let i=0; i<10; i++) {
    var url = urlList[i]
    console.log('url=', url)
    if (!url.startsWith("https://en.wikipedia.org/wiki")) continue;
    console.log(url, 'download')
    count ++
   
     
    //讓他delay隨機1~5秒
    await sleep(getRandomInt(5000));
    
    if (count >=30000) break
    try {
      var page = await getPage(url)
      await post(`/web2/page/${count}`, {url, page})
      // await Deno.writeTextFile(`data/${i}.txt`, page)
      var urls = html2urls(page)
      // console.log('urls=', urls)
      for (let surl of urls) {
        var purl = surl.split(/[#\?]/)[0] //正規表達式把#和?塞選掉
        var absurl = purl
        if (surl.indexOf("//")<0) { // 是相對路徑
           absurl = (new URL(purl, url)).href
           // console.log('absurl=', absurl)
        }
        if (urlMap[absurl] == null) {
          urlList.push(absurl)
          urlMap[absurl] = 0
        }
      }
    } catch (error) {
      console.log('error=', error)
    }
  }
}

await craw(urlList, urlMap)
