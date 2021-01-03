const puppeteer = require("puppeteer");
const query = require("./dbquery");
const getday = require("./func");

var errMsg;
var jobCrawl1 = () =>{
    return new Promise ((resolve, reject)=>{
        puppeteer.launch({
            headless : false  
        , devtools : true  
        }).then(async browser => {
            
            var postSet = new Set();
            var flag = 0;
            var boardID = 1;
    
            var beginquery = "select * from Post where FK_BoardID = 1 order by PostID desc limit 20;";
            var checker = await query(beginquery).catch((err)=>{
                throw(err);
            });
    
            for(var i = 0; i <checker.length ; ++i){
                postSet.add(checker[i]["PostTitle"]);
            }
    
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0); 
            
            await page.goto("http://job.sogang.ac.kr", { waitUntil: "networkidle0" });
            await page.type("div#mainLogin > form#LFrm > div.z1 > div.loginbox > dl:nth-child(1) > dd > input#userid", "20141298");
            await page.type("div#mainLogin > form#LFrm > div.z1 > div.loginbox > dl:nth-child(2) > dd > input#passwd", "Ta68H!ghSCfbf8");
            await (await page.waitFor("input")).press("Enter");
            await page.waitForNavigation({waitUntil : "networkidle0"});
            await page.goto("https://job.sogang.ac.kr/jobs/all/default.aspx?firstorderby=1&isadregdate=1 ", { waitUntil: "networkidle0" });
            var board = await page.$$('tbody >tr ');
            
            var insertQuery = `insert into Post values `
    
            for (var i = 1; i <= board.length; ++i) {
                
                var predate = await page.waitFor(`div#wrap > div#contentsWrap > div#contents > table.listTable.spaceB20.cr > tbody > tr:nth-child(${i}) > td:nth-child(2) `)
                var date = await page.evaluate(predate => predate.textContent, predate);
                if(date.length == 0) date = getday();
                
                var body = await page.waitFor(`div#wrap > div#contentsWrap > div#contents > table.listTable.spaceB20.cr > tbody > tr:nth-child(${i}) > td:nth-child(4) > a `)
                var text = await page.evaluate(body => body.textContent, body);
                var posturl = await page.evaluate(body => body.href, body);
    
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