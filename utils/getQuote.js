export async function getQuote() {
    let fileLine = Math.random(0-24)
    //read quotes.txt
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'quotes.txt');
    await fs.readFileSync(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            let lines = data.split("\n");
            return lines[fileLine];
        } else {
            console.log(err);
            return err;
        }
    });
}