const puppeteer = require("puppeteer")

let {email, password} = require('./secrets')

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
    // solve karna h
  })
  .catch(function (err) {
    console.log(err);
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
