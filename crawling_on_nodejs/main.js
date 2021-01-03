let async = require('async');
process.setMaxListeners(20);
var crlfunc = [];
for(var i=1;i<=20;i++)
{  //if(i==7||i==11||i==12) continue;
   crlfunc[i-1]=require(`./puppe${i}.js`);
}

function crl(){
    console.log("gogo");
}

crl()
.then(crlfunc[0])
.then(crlfunc[1]);

// async function aa(){
//     for(var i=0;i<20;i++){  
//         if(i==6||i==10||i==11) continue;
//         await crlfunc[i]();
//     }
// }

// aa();

