const puppeteer = require("puppeteer");
const query = require("./dbquery");
const getday = require("./func");

//학지팀 일반공지

var errMsg;
var jobCrawl1 = () =>{
    return new Promise ((resolve, reject)=>{
        puppeteer.launch({
            headless : false  
        , devtools : true  
        }).then(async browser => {
            
            var postSet = new Set();
            var flag = 0;
            var boardID = 7;
    
            var beginquery = "select * from Post where FK_BoardID = 7 order by PostID desc limit 28;";
            var checker = await query(beginquery).catch((err)=>{
                throw(err);
            });
    
            for(var i = 0; i <checker.length ; ++i){
                postSet.add(checker[i]["PostTitle"]);
            }
    
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0); 
            
            await page.goto("http://www.sogang.ac.kr/front/boardlist.do?bbsConfigFK=1", { waitUntil: "networkidle0" });
            var board = await page.$$('tbody >tr ');
            
            var insertQuery = `insert into Post values `
    
            for (var i = 1; i < board.length; ++i) {
                
                var predate = await page.waitFor(`div.page > div.bbs-panes > div:nth-child(2) > div.grid.bbs-list.tr-hover > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`)
                var date = await page.evaluate(predate => predate.textContent, predate);
                if(date.length == 0) date = getday();
                
                var body = await page.waitFor(`div.page > div.bbs-panes > div:nth-child(2) > div.grid.bbs-list.tr-hover > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > div.subject > a > span.text`)
                var text = await page.evaluate(body => body.textContent, body);
                var url = await page.waitFor(`div.page > div.bbs-panes > div:nth-child(2) > div.grid.bbs-list.tr-hover > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > div.subject > a`);
                var posturl = await page.evaluate(url => url.href, url);
                if(posturl.length==0) posturl="http://www.sogang.ac.kr/front/boardlist.do?bbsConfigFK=1";
                date=date.trim();
                text=text.trim();
                posturl=posturl.trim();
                //console.log(date, text, posturl);
                if(postSet.has(text) == false){
                    flag = 1;
                    insertQuery += `(null, '${text}',  '${posturl}', '${date}', ${boardID}, 1) ,`;
                }        
            }
            
            var queryLen = insertQuery.length;
            insertQuery = insertQuery.substr(0, queryLen-1);
            insertQuery+=`;`;
    
            if(flag == 1) await query(insertQuery).catch((err)=>{
                throw(err);
            })
            else console.log(boardID + "안했당")
            await page.close();
            await browser.close();
            
        }).then( async ()=> {
            resolve(1);
        })
        }).catch(err=>{
            reject(err);
    })
}



module.exports = jobCrawl1;