const puppeteer = require("puppeteer")

let {email, password} = require('./secrets')
let {answer} = require('./codes')

let cTab
let browserOpenPromise = puppeteer.launch({
    headless:false,
    defaultViewport:null,
    args: ["--start-maximized"],
    // chrome://version/ -> write in chrome to get the executablePath of chrome
    // executablePath:"//Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
})

browserOpenPromise
   .then(function (browser) {
       console.log("browser is open")

       // pages() -> An array of all open pages inside the Browser
       let allTabsPromise = browser.pages()
       return allTabsPromise
   })
   .then(function(allTabsArr){
       cTab = allTabsArr[0]
       console.log("New Tab opened")

       // goto("url") -> opens given url
       let visitingLoginPagePromise = cTab.goto("https://www.hackerrank.com/login")
       return visitingLoginPagePromise
   })
   .then(function(){
       console.log("HackerRank Login Page opened")
       let emailTypePromise = cTab.type("input[name='username']", email)
       return emailTypePromise
   })
   .then(function(){
       console.log("email is entered")
       let passTypePromise = cTab.type("input[name='password']", password)
       return passTypePromise
   })
   .then(function(){
       console.log("Password is entered")
       let loggedInPromise = cTab.click(".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled")
       return loggedInPromise
   })
   .then(function () {
    console.log("logged into hackerrank successfully")
    //waitAndClick will wait for the selector to load , and then click on the node
    let algorithmTabWillBeOPenedPromise = waitAndClick(
      "div[data-automation='algorithms']"
    )
    return algorithmTabWillBeOPenedPromise
  })
  .then(function () {
    console.log("algorithm page is opened")
    let allQuesPromise = cTab.waitForSelector(
      'a[data-analytics="ChallengeListChallengeName"]'
    )
    return allQuesPromise
  })
  .then(function () {
    function getAllQuesLinks() {
      let allElemArr = document.querySelectorAll(
        'a[data-analytics="ChallengeListChallengeName"]'
      )
      let linksArr = []
      for (let i = 0; i < allElemArr.length; i++) {
        linksArr.push(allElemArr[i].getAttribute("href"))
      }
      return linksArr
    }
    let linksArrPromise = cTab.evaluate(getAllQuesLinks)
    return linksArrPromise
  })
  .then(function (linksArr) {
    console.log("links to all ques received")
    // console.log(linksArr)
                            // link of the qs to be solved, idx of the qs
    let queWillBeSolvedPromise = questionSolver(linksArr[0], 0)
    for(let i = 1; i < linksArr.length; i++){
    let queWillBeSolvedPromise = queWillBeSolvedPromise.then(function(){
      return questionSolver(linksArr[i], i)
     })
    }
    return queWillBeSolvedPromise
  })
  .then(function(){
    console.log("Question is solved")
  })
  .catch(function (err) {
    reject(err);
  })

function waitAndClick(selector){
    let myPromise = new Promise(function(resolve, reject){
        let waitForSelectorPromise = cTab.waitForSelector(selector)
        waitForSelectorPromise
            .then(function(){
                console.log("Selector is found")
               let clickPromise = cTab.click(selector)
               return clickPromise
            })
            .then(function(){
                console.log("Selector is clicked")
                resolve()
            })
            .catch(function(err){
                console.log(err)
            })
    })

    return myPromise
}

function questionSolver(url, idx){
  return new Promise(function(resolve, reject){
    let fullLink = `https://www.hackerrank.com${url}`
    let gotoQsPromise = cTab.goto(fullLink)
    gotoQsPromise
    .then(function(){
      console.log("Question is opened")
      let chckBoxClicked = waitAndClick(".checkbox-input")
      return chckBoxClicked
    })
    .then(function(){
      // select the box where the code will be typed
      let waitForTextBoxPromise = cTab.waitForSelector(".custominput")
      return waitForTextBoxPromise
    })
    .then(function(){
      let codeIsTypedPromise = cTab.type(".custominput", answer[idx])
      return codeIsTypedPromise
    })
    .then(function(){
      // command key is pressed
      let commandKeyPromise = cTab.keyboard.down("Control")
      return commandKeyPromise
    })
    .then(function(){
      // a key is pressed
      let aKeyPromise = cTab.keyboard.press("a")
      return aKeyPromise
    })
    .then(function(){
      // x key is pressed
      let xKeyPromise = cTab.keyboard.press("x")
      return xKeyPromise
    })
    .then(function(){
      let controlReleasedPromise = cTab.keyboard.up("Control")
      return controlReleasedPromise
    })
    .then(function () {
      //select the editor promise
      let cursorOnEditorPromise = cTab.click(
        ".monaco-editor.no-user-select.vs"
      )
      return cursorOnEditorPromise
    })
    .then(function(){
      let commandPressedPromise = cTab.keyboard.down("Control")
      return commandPressedPromise
    })
    .then(function(){
      // a key is pressed
      let aKeyPromise = cTab.keyboard.press("A",{delay:100})
      return aKeyPromise
    })
    .then(function(){
      // v key is pressed
      let vKeyPromise = cTab.keyboard.press("V", {delay:100})
      return vKeyPromise
    })
    .then(function(){
      let commandDownPromise = cTab.keyboard.up("Control")
      return commandDownPromise
    })
    .then(function(){
      let submitClickedPromise = cTab.click(".hr-monaco-submit")
      return submitClickedPromise
    })
    .then(function(){
      console.log("Code submited successfully")
      resolve()
    })
    .catch(function(err){
      reject(err)
    })
  })
}