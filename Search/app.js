import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import {DB} from "https://deno.land/x/sqlite/mod.ts";
import {Session} from "https://deno.land/x/session@1.1.0/mod.ts"
import {
  viewEngine,
  engineFactory,
  adapterFactory,
} from "https://ccc-js.github.io/view-engine/mod.ts" // from "https://deno.land/x/view_engine/mod.ts";
import { get, post } from "./essearch.js";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const db = new DB("data.db");
db.query("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, gmail TEXT)")
const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

const router = new Router();
   
router
  .get('/', (ctx)=>{
    ctx.response.redirect('/public/searchh.html')
  })
  .get('/search', search)
  .get('/public/(.*)', pub)
  .get('/login',loginUi)
  .post('/login' ,login)
  .get('/logout',logout)
  .get('/signup',signupUi)
  .get('/searchlo',searchlo)
  .post('/signup',signup);

const session = new Session({ framework: "oak" });
await session.init();

const app = new Application();
app.use(viewEngine(oakAdapter, ejsEngine));
app.use(session.use()(session));
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

function sqlcmd(sql, arg1) {
  console.log('sql:', sql)
  try {
    var results = db.query(sql, arg1)
    console.log('sqlcmd: results=', results)
    return results
  } catch (error) {
    console.log('sqlcmd error: ', error)
    throw error
  }
}


function userQuery(sql){
  let list = []
  for (const [id,username,password,gmail] of sqlcmd(sql)) {
    list.push({id,username,password,gmail})
  }
  console.log('userQuery: list=', list)
  return list
}




async function loginUi(ctx) {
  // ctx.response.body = await render.loginUi();
  ctx.render('views/loginUi.ejs')
}

async function signupUi(ctx){
  ctx.render('views/signupUi.ejs')
}

async function parseFormBody(body) {
  const pairs = await body.value
  const obj = {}
  for (const [key, value] of pairs) {
    obj[key] = value
  }
  return obj
} 

async function signup(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    var user = await parseFormBody(body)
    var dbUsers = userQuery(`SELECT id,username,password, gmail FROM users WHERE username='${user.username}'`)

    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users ( username, password, gmail) VALUES (?, ?, ?)", [user.username,user.password,user.gmail]);
      ctx.render("views/success.ejs");
    } else 
      ctx.render("views/same.ejs")
  }
}

async function searchlo(ctx){
  ctx.response.body = await render.suc()
}

var curUser = ""
async function login(ctx) {
  console.log("go to login")
  const body = ctx.request.body()
  
  if (body.type === "form") {
    const pairs = await body.value
    const logInfo = {}
    for(const [key, value] of pairs){
        logInfo[key] = value
    }
    var user = await parseFormBody(body)
    var dbUsers = userQuery(`SELECT id, username, password,gmail FROM users WHERE username='${user.username}'`) // userMap[user.username]
    var dbUser = dbUsers[0]
    curUser = dbUser.username;
    console.log("curUser=",curUser)
    //curGrade = dbUser.grade;

    console.log(user.password)
    if (dbUser.password === user.password ) {
        console.log("inside") 
        ctx.state.session.set('user', user)
        console.log("inside2")
        ctx.render('views/searchResult2.ejs',{curUser})
        console.log('session.user=', await ctx.state.session.get('user'))
        //ctx.response.redirect('/lo'); 
    } 
    else {
      console.log("username doesn't exist")
      ctx.render('views/Fail.ejs')
    }
  }
}

async function logout(ctx) {
  ctx.state.session.set('user', null)
  ctx.response.redirect('/')
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({
  port: 8000 });
