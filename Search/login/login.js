export function layout(title, content) {
    return `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          position:center
          padding: 80px;
          font: 16px Helvetica, Arial;
        }
    
        h1 {
          font-size: 2em;
        }
    
        h2 {
          font-size: 1.2em;
        }
    
        #posts {
          margin: 0;
          padding: 0;
        }
        #posts li:last-child {
          border-bottom: none;
        }
    
        textarea {
          width: 500px;
          height: 300px;
        }
    
        input[type=text],input[type=password],
        textarea {
          border: 1px solid #eee;
          border-top-color: #ddd;
          border-left-color: #ddd;
          border-radius: 2px;
          padding: 15px;
          font-size: .8em;
        }
        .signup{
            width:100%;
            margin:auto;
            max-width:525px;
            min-height:450px;
            position:relative;
            background: no-repeat center;
            background: #A6A6A6	;
            box-shadow:0 12px 15px 0 rgba(0,0,0,.24),0 17px 50px 0 rgba(0,0,0,.19);
        }
        .signup-form{
            min-height:345px;
            position:relative;
            perspective:1000px;
            transform-style:preserve-3d;
        }
        .signup-html{
            width:100%;
            height:100%;
            position:absolute;
            padding:90px 70px 50px 70px;
        }
        .signup-html .input{
            border:none;
            width:auto
            padding:15px 20px;
            border-radius:25px;
        }
        input[type=text],input[type=password] {
          width: 300px;
        }
      </style>
    </head>
    <body>
      <section id="content">
        ${content}
      </section>
    </body>
    </html>
    `
  }
  
  export function loginUi() {
    return layout('Login', `
    <div class="signup">
    <form action="/login" method="post" id="login" class="signup-form">
    <div class="signup-html">
    <h1 class="title">Login</h1>
      <p><input type="radio" name="identity" value="student"> student</p>
      <p><input type="radio" name="identity" value="teacher"> teacher</p>
      <p><input type="text" placeholder="username" name="username" class="input"></p>
      <p><input type="password" placeholder="password" name="password" class="input"></p>
      <p><input type="submit" value="Login"></p>
      <p>New user? <a href="/signupui">Create an account</p>
    </div>
    </form>
    </div>
    `)
  }
  
  export function signupUi() {
    return layout('Signup', `
    <div class="signup">
    <form action="/signup" method="post" class="signup-form" >
    <div class="signup-html">
    <h1 class="title">Signup</h1>
      <p><input type="radio" name="identity" value="student"> student</p>
      <p><input type="radio" name="identity" value="teacher"> teacher</p>
      <p><input type="text" name="grade" placeholder="grade" class="input"></p>
      <p><input type="text" placeholder="username(type your student_id)" name="username" class="input"></p>
      <p><input type="password" placeholder="password" name="password" class="input"></p>
      <p><input type="submit" value="Signup"></p>
    </div>
    </form>
    </div>
    `)
  }
  
  export function success() {
    return layout('Success', `
    <h1>Success!</h1>
    You may <a href="/">Sign in</a> again !
    `)
  }
  
  export function fail() {
    return layout('Fail', `
    <h1>Fail!</h1>
    You may  <a href="JavaScript:window.history.back()">go back</a> !
    `)
  }
  
  export function list(posts, user) {
    console.log('list: user=', user)
    let list = []
    for (let post of posts) {
      list.push(`
      <li>
        <h2>${ post.title } -- by ${post.username}</h2>
      </li>
      `)
    }
    //console.log(user.identity);
    let content = `
    <h1>Welcome to our Access Control Management System </h1>
    <p>${(user==null)?'Let'+'<a href="/loginui">Login</a>'+' first':'Welcome '+user.username+'<a href="/logout">Logout</a> !'}</p>
    `
    return layout('Posts', content)
  }

  export function homeTeacher(username){
      return layout("Teacher", `
      <p>
        Hi this is for teacher ! hello teacher ${username}!
      </p>
      <a href="/logout">Logout</a> 
      `)
  }

  export function homeStudent(username){
      return layout("Student", `
      <p>
        Hi this is for students! hello student ${username}!
      </p>
      <form action="/std" method="post">
        <p><input type="date" name="date" value="date" class="input"></p> 
        <p><input type="text" name="activity" placeholder="activity" class="input"></p> 
        <button type="submit">submit</button>
      </form>
      <a href="/logout">Logout</a>
      `)
  }

  export function stdpage(date,activity ){
      return layout("Date",`
      <p>You choose the date at ${date} to go to classroom to ${activity}</p> 
      `)
  }