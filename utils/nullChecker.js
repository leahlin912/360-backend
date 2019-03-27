const checkNil = (data, number, optionalDatas) => {
    let nums = optionalDatas.length;
    for(var i in data){
        let tmpData = data[i];
        if(!optionalDatas.includes(tmpData)){
            if(tmpData !== ""){
                nums++;
            }
        }
    }
    if(nums < number){
        return true;
    }else{
        return false;
    }
}

module.exports = checkNil;