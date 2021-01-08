import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './login.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/session@1.1.0/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, identity TEXT, grade TEXT, username TEXT, password TEXT )");
db.query("CREATE TABLE IF NOT EXISTS sends (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, grade TEXT, date TEXT, activity TEXT, access TEXT)")
/*
const userMap = {
  ccc: { username:'ccc', password: '123' },
  snoopy: { username:'snoopy', password: '321' }
}
*/

const router = new Router();

router.get('/', list)
  .get('/signupui', signupUi)
  .post('/signup', signup)
  .get('/loginui', loginUi)
  .post('/login', login)
  .get('/logout', logout)
  .get('/home1', home1)
  .get('/home2', home2)
  .post('/std', std)
  .get('/stdUi',stdUi);

const session = new Session({ framework: "oak" });
await session.init();

const app = new Application();

app.use(session.use()(session));
app.use(router.routes());
app.use(router.allowedMethods());

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

function postQuery(sql) {
  let list = []
  for (const [id, username, title, body] of sqlcmd(sql)) {
    list.push({id, username, title, body})
  }
  console.log('postQuery: list=', list)
  return list
}

function userQuery(sql) {
  let list = []
  for (const [id,identity, grade, username, password] of sqlcmd(sql)) {
    list.push({id,identity, grade, username, password})
  }
  console.log('userQuery: list=', list)
  return list
}

async function parseFormBody(body) {
  const pairs = await body.value
  const obj = {}
  for (const [key, value] of pairs) {
    obj[key] = value
  }
  return obj
}

async function signupUi(ctx) {
  ctx.response.body = await render.signupUi();
}

var curUser;
var curActivity;
var curDate;
async function signup(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    var user = await parseFormBody(body)
    var dbUsers = userQuery(`SELECT id,identity, grade, username, password FROM users WHERE username='${user.username}'`)

    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users ( identity, grade, username, password) VALUES (?, ?, ?, ?)", [user.identity,user.grade,user.username, user.password]);
      ctx.response.body = render.success()
    } else 
      ctx.response.body = render.fail()
  }
}


async function loginUi(ctx) {
  ctx.response.body = await render.loginUi();
}

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
    var dbUsers = userQuery(`SELECT id, identity, grade,  username, password FROM users WHERE username='${user.username}'`) // userMap[user.username]
    var dbUser = dbUsers[0]
    console.log("after sql")
    //curUser = dbUser.username;
    //curGrade = dbUser.grade;
    console.log("curUser = ", curUser);

    if (dbUser.password === user.password && dbUser.identity === user.identity) {
        ctx.state.session.set('user', user)
        console.log('session.user=', await ctx.state.session.get('user'))
        //ctx.response.redirect('/');
        if(dbUser.identity == "teacher"){
            ctx.response.redirect('/home1');
        }
        else{
            ctx.response.redirect('/home2');
        }
    } 
    else {
      ctx.response.body = render.fail()
      
    }
  }
}

async function std(ctx){
    console.log("go into std");
    const body = ctx.request.body()
       if(body.type === "form"){
           console.log("go into insert function1")
           //var send = await parserFormBody(body)
           const pairs = await body.value
           const formdata = {}
           for(const [key, value] of pairs){
               formdata[key] = value
           }
   
           if(formdata.length != 0){
               console.log("go into insert function2")
               sqlcmd("INSERT INTO sends (username,date,grade,activity,access)VALUES(?,?,?,?,?)",[curUser,formdata.date,curGrade,formdata.activity,"no"]);
                curActivity = formdata.activity;
           }
       }
    }
async function stdUi(ctx){
    ctx.response.body = await render.stdpage(curDate,curActivity);
}
   
async function home1(ctx){
    ctx.response.body = await render.homeTeacher(curUser);
}

async function home2(ctx){
    ctx.response.body = await render.homeStudent(curUser);
}

async function logout(ctx) {
   ctx.state.session.set('user', null)
   ctx.response.redirect('/')
}

async function list(ctx) {
  let posts = postQuery("SELECT id, username, title, body FROM posts")
  console.log('list:posts=', posts)
  ctx.response.body = await render.list(posts, await ctx.state.session.get('user'));
}


console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
