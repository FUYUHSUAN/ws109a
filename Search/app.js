import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import {
  viewEngine,
  engineFactory,
  adapterFactory,
} from "https://ccc-js.github.io/view-engine/mod.ts" // from "https://deno.land/x/view_engine/mod.ts";
import { get, post } from "./essearch.js";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

const router = new Router();

router
  .get('/', (ctx)=>{
    ctx.response.redirect('/public/searchh.html')
  })
  .get('/search', search)
  .get('/public/(.*)', pub)

const app = new Application();
app.use(viewEngine(oakAdapter, ejsEngine));
app.use(router.routes());
app.use(router.allowedMethods());
const parser = new DOMParser();

async function search(ctx) {
  // const query = ctx.params.query
  const query = ctx.request.url.searchParams.get('query')
  console.log('query =', query)
  let docs = await get('/web2/page/_search', {page:query})
 
  /*let docs = [
    { url:'http://misavo.com', title:'ccc at misavo', page: 'hello ccc'},
    { url:'http://ccc.com/abc', title: 'ccc and abc', page: 'ccc abc'},
  ]*/
  // ctx.response.body = docs
  //var rec=await get('/web2/page/_search', {page:'war'})
  //ctx.render('views/searchResult.ejs', {docs:docs})
  

  //let doc=parser.parseFromString(docs[0]["_source"]["page"],"text/xml");
  docs=docs.hits.hits
  let document=[]
  let title1=[]
  
  for(var i=0;i<docs.length;i++){
    let s = ""
    let s1=""
    docs[i]["_title"]=""
    title1=parser.parseFromString(docs[i]["_source"]["page"],"text/html")
    title1.querySelectorAll('title').forEach((node)=>s1+=(node.textContent))
    docs[i]["_title"]=s1
    console.log("title=",s1)
    console.log(docs[i])
    document = parser.parseFromString(docs[i]["_source"]["page"],"text/html")//.querySelector('#mw-content-text')
    document.querySelectorAll('p').forEach((node)=>s += (node.textContent))
    var j=s.indexOf(query)
    docs[i]["_source"]["page"]=s.substring(j-150,j+150)
  }
  /*let document = parser.parseFromString(docs[0]["_source"]["page"],"text/html")//.querySelector('#mw-content-text')
  document.querySelectorAll('p').forEach((node)=>list.push(node.textContent))
  console.log("result=",list);*/
  //context.response.body=docs1
  //docs._source.page=docs._source.pa
  //ge.querySelector('.infobox').textContent
  //console.log("docs._source.page=",docs._source.page)
  ctx.render('views/searchResult.ejs', {docs:docs})
}

async function pub(ctx) {
  // console.log(ctx.params);
  var path = ctx.params[0]
  await send(ctx, path, {
    root: Deno.cwd()+'/public',
    index: "index.html",
  });
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
