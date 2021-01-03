
var BoardId = 15; //청년광장-주거, 이사정보
var mysql = require('mysql');
const puppeteer = require("puppeteer");
var func=function() {
var db = mysql.createConnection({
    host: "host",
    user: "user",
    password: "password",
    database: "db"
});
db.connect(() => {
    console.log("connecting to database gwajeda_schema");
})
var postarr = [[], [], []];
var day = new Date();
var year = day.getFullYear()
var month = day.getMonth()
var date = day.getDate();
month = month * 1;
month = month + 1;
date = date * 1;
if (month < 10) month = '0' + month
if (date < 10) date = '0' + date
var fulltoday = year + '-' + month + '-' + date;

var today=new Date();
var yesterdate=today.getTime() - (1*24*60*60*1000);
today.setTime(yesterdate);
var yesterYear=today.getFullYear();
var yesterMonth=today.getMonth()+1;
var yesterDay=today.getDate();
if(yesterMonth<10) yesterMonth='0'+yesterMonth;
if(yesterDay<10) yesterDay='0'+yesterDay;
var fullyesterday=yesterYear+'-'+yesterMonth+'-'+yesterDay;

function delay( timeout ) {
    return new Promise(( resolve ) => { 
      setTimeout( resolve, timeout );
    });
  }
  puppeteer.launch({
       headless : false  
     , devtools : true     //밑에는 크롬 경로 입력해주세요.
    
  }).then(async browser => {
        let page = await browser.newPage();

        await page.goto( "https://sc.sogang.ac.kr/login.do?Refer=http%3A%2F%2Fsc.sogang.ac.kr%2Findex.html", { waitUntil : "networkidle2" } );
        await delay(5000);
        await page.type( "div#body > div.main > div.section > div.wrap > div.inner > div >  div:nth-child(2) > form > input#id ", "userid" );
        await page.type( "div#body > div.main > div.section > div.wrap > div.inner > div >  div:nth-child(2) > form > input#pw ", "passwd" );
        const elementHandle = await page.waitFor( "input" );
        await elementHandle.press( "Enter" );
        await delay(9000);
        await page.click(" div#header > div.section.gnb_sec > div.inside > ul#gnb > li:nth-child(3) > a ");
        await delay(5000);
        await page.click(" div#body > div.aside > ul > li:nth-child(3) > ul > li:nth-child(7) ");
        await delay(5000);
        var frames = await page.frames();
        var myframe = frames.find(f=> f.url().includes('sogang.ac.kr/front/'));
        await page.goto( `${myframe.url()}`, { waitUntil : "networkidle2" } );
        //여기까지가 크롤링 경로설정

        
        const boardlen = await page.$$('tbody>tr ');
        var len = boardlen.length-1;
        let reallen=-1;
        console.log("boardlen : "+len);
        for(var i = 1 ; i<=len ; i++){
            await delay(300);
            var re = await page.waitFor(`div.page > div.bbs-panes > div:nth-child(2) > div > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > div.subject > a`)
            var rere = await page.evaluate( re => re.textContent, re );
            var posturl="http://sc.sogang.ac.kr/soriindex.do";
            if(rere[0] == `'`){
                let arr=[];
                let cnt = 0;
                for(let i = 0 ; i< rere.length; i++){
                    if(rere[i]==`'`) arr[cnt++] = i;
                }
                let tmp = rere.substr(arr[0]+1, arr[1]-arr[0]-1);
                rere = rere.substr(arr[1]+1, rere.length -arr[1]-1);
                rere = tmp + ' ' + rere;    
            }
            var tmp=rere.indexOf(']');
            if(tmp!=-1) rere=rere.substr(tmp+1);
            rere=rere.replace(/'/gi, '"');
            rere=rere.trim();
            var de = await page.waitFor(`div.page > div.bbs-panes > div:nth-child(2) > div > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`)
            var dede = await page.evaluate( de => de.textContent, de );
            var tmp = dede.indexOf('2');
            var fullday = dede.slice(tmp, tmp + 10)
            fullday = fullday.replace('.', '-');
            fullday = fullday.replace('.', '-');
            if(fullday==fulltoday||fullday==fullyesterday){
                reallen++;
                postarr[reallen] = [fullday, rere, posturl];
                console.log(postarr[reallen]);
            }
        }
        await delay(500);
        let sql = `select PostTitle,PostDate from Post where FK_BoardId=${BoardId} and (PostDate="${fulltoday}" or PostDate="${fullyesterday}")`
        db.query(sql, (err, result) => {
            if (err) console.log(err);
            else if(reallen==-1)  db.end(() => {
                browser.close();
                console.log("새로운 게시물 없음.");
            })
            else {
                console.log(result.length)
                if (result.length > 0) {
                    console.log("1번");
                    console.log("reuslt길이" + result.length)
                    var resultarr = [[], []];
                    var savearr = [[], [], []];
                    console.log("save배열길이 " + savearr.length);
                    for (var i = 0; i < result.length; i++) {
                        resultarr[i] = [JSON.stringify(result[i]["PostDate"]).substr(1, 10), result[i]["PostTitle"]];
                    }
                    let cnt = 0;
                    console.log("카운트" + cnt);

                    console.log("result배열 길이" + resultarr.length);
                    let idx = 0;
                    for (var i = 0; i < postarr.length; i++) {
                        let flag = 0;
                        for (var j = 0; j < resultarr.length; j++) {
                            if (postarr[i][1] == resultarr[j][1]) {flag = 1; break;}
                        }
                        if (flag == 0) {
                            savearr[idx] = [postarr[i][0], postarr[i][1], postarr[i][2]];
                            idx++;
                            console.log("savearr넣는중" + savearr[idx - 1]);
                        }
                    }
                    console.log("savearr길이" + savearr.length)
                    if (savearr[0][0]) {
                        console.log(savearr[0][1] + "  " + savearr[0][0])
                        let insertsql = `insert into Post values (null, '${savearr[idx - 1][1]}', '${savearr[idx - 1][2]}', '${savearr[idx - 1][0]}', ${BoardId}, 1)`
                        for (var i = idx - 2; i >= 0; i--) {
                            insertsql += `, (null, '${savearr[i][1]}', '${savearr[idx - 1][2]}','${savearr[i][0]}', ${BoardId}, 1)`
                        }
                        insertsql += ';'
                        db.query(insertsql, (err, result) => {
                            if (err) console.log(err);
                            else {
                                db.end(() => {
                                    browser.close();
                                    console.log("데이터넣었고 디비끈다~")
                                })
                            }
                        })
                    }
                    else {
                        db.end(() => {
                            browser.close();
                            console.log("아무것도 넣을게 없어요~ 디비끌게여~");
                        })
                    }
                } else {
                    console.log("2번")
                    
                    let insertsql = `insert into Post values (null, '${postarr[reallen][1]}', '${postarr[reallen][2]}','${postarr[reallen][0]}', ${BoardId}, 1)`
                    for (var i = reallen - 1; i >= 0; i--) {
                        insertsql += `, (null, '${postarr[i][1]}', '${postarr[i][2]}','${postarr[i][0]}', ${BoardId}, 1)`
                    }
                    insertsql += ';'
                    db.query(insertsql, (err, result) => {
                        if (err) console.log(err);
                        else {
                            db.end(() => {
                                browser.close();
                                console.log("비교안하고 넣었고 디비 끌게여")
                            })
                        }
                    })
                }
            }
        })
        await browser.close(()=> {console.log("끝")})
    })
};
module.exports = func