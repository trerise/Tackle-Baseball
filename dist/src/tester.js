let cleaner=new RegExp(/(\w|\s|'|-|\&|\d)+([A-Za-z]|\d)(?=--*|)/),secondreg=new RegExp(/.+\w[^\d*]/),thirdreg=new RegExp(/.+\w/),string="Team 1337-";console.log(cleaner.exec(string));