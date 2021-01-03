
var BoardId = 12; //컴퓨터공학과-디회개(2분반))
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
var postarr = [[], []];
var day = new Date();
var year = day.getFullYear()
var month = day.getMonth()
var date = day.getDate();
month = month * 1;
month = month + 1;
date = date * 1;
//데이트가 없는경우
if (month < 10) month = '0' + month
if (date < 10) date = '0' + date
var fullday = year + '-' + month + '-' + date;

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

        await page.goto( "http://cslab.sogang.ac.kr", { waitUntil : "networkidle2" } );
        await delay(5000);
        await page.click( "div.page.page_index > div#header > div.section.gnb_sec > div.inside > ul#gnb > li:nth-child(6) > a" )
        await delay(9000);
        await page.click( "div#body > div.aside > ul > li:nth-child(6) > ul > li:nth-child(2) > a" );
        await delay(9000);
        var frames = await page.frames();
        var myframe = frames.find(f=> f.url().includes('/bbs/bbslist.do?'));
        await page.goto( `${myframe.url()}`, { waitUntil : "networkidle2" } );
        
        var postarr = [[],[]];
        const boardlen = await page.$$('tbody>tr ');
        var len = boardlen.length-1;
        console.log("boardlen : "+len);
        for(var i = 1 ; i<=len ; i++){
            await delay(200);
            var re = await page.waitFor(`div.page > div.bbs-panes > div.bbs-pane > div.grid.bbs-list.tr-hover > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > div.subject > a > span.text`)
            var rere = await page.evaluate( re => re.textContent, re );
            console.log("기존rere"+rere);
            if(rere[0] == ' '|| rere[0] == '\n'){
                let tmp= 0;
                let end = 0;
                for(var  j = 0 ; j < rere.length ; j++){
                    if(rere[j] == '[') tmp = j;
                }
                rere = rere.substr(tmp, rere.length-tmp-5);
            }
            var tmp=rere.indexOf(']');
            if(tmp!=-1) rere=rere.substr(tmp+1, 20);
            console.log("바뀐rere" + rere);
            var de = await page.waitFor(`div.page > div.bbs-panes > div.bbs-pane > div.grid.bbs-list.tr-hover > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`)
            var dede = await page.evaluate( de => de.textContent, de );
            let year = dede.substr(0, 4);
            let month = dede.substr(5, 2)
            let day = dede.substr(8, 2);
            let fullday = year + '-' + month + '-' + day
            console.log(fullday)
            postarr[i-1] = [fullday, rere];
            console.log(postarr[i-1]);
        }
        await delay(500);
        let sql = `select PostTitle,PostDate from Post where FK_BoardId=${BoardId} order by PostId desc limit ${len}`
        db.query(sql, (err, result) => {
            if (err) console.log(err);
            else {
                console.log(result.length)
                if (result.length > 0) {
                    console.log("1번");
                    console.log("reuslt길이" + result.length)
                    var resultarr = [[], []];
                    var savearr = [[], []];
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
                            if (postarr[i][1] == resultarr[j][1]) flag = 1;
                        }
                        if (flag == 0) {
                            savearr[idx] = [postarr[i][0], postarr[i][1]];
                            idx++;
                            console.log("savearr넣는중" + savearr[idx - 1]);
                        }
                    }
                    console.log("savearr길이" + savearr.length)
                    if (savearr[0][0]) {
                        console.log(savearr[0][1] + "  " + savearr[0][0])
                        let insertsql = `insert into Post values (null, '${savearr[idx - 1][1]}', '${savearr[idx - 1][0]}', ${BoardId}, 1)`
                        for (var i = idx - 2; i >= 0; i--) {
                            insertsql += `, (null, '${savearr[i][1]}', '${savearr[i][0]}', ${BoardId}, 1)`
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
                    let insertsql = `insert into Post values (null, '${postarr[postarr.length - 1][1]}', '${postarr[postarr.length - 1][0]}', ${BoardId}, 1)`
                    for (var i = postarr.length - 2; i >= 0; i--) {
                        insertsql += `, (null, '${postarr[i][1]}', '${postarr[i][0]}', ${BoardId}, 1)`
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