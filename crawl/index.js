const jobCrawl1 = require("./jobCrawl1");
const jobCrawl2 = require("./jobCrawl2")
const jobCrawl3 = require("./jobCrawl3")
const jobCrawl4 = require("./jobCrawl4")
const jobCrawl5 = require("./jobCrawl5")
const jobCrawl6 = require("./jobCrawl6")
const jobCrawl7 = require("./jobCrawl7")


jobCrawl1()
    .then(()=>jobCrawl2())
    .then(()=>jobCrawl3())
    .then(()=>jobCrawl4())
    .then(()=>jobCrawl5())
    .then(()=>jobCrawl6())
    .then(()=>jobCrawl7())


