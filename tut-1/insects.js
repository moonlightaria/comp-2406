insectsA();
function insectsA(){
    let insects = 1;
    let weeks = 0;
    while (insects<10000){
        insects = insects*2;
        console.log(insects);
        weeks++;
    }
    console.log(weeks + " weeks have elapsed");
}
function insectsB(){
    let insects = 1;
    let weeks = 0;
    while (insects<10000){
        insects = insects *2;
        console.log(insects);
        if (++weeks % 4 === 0){
            insects = insects - insects * .4;
        }
    }
    console.log(weeks + " have elapsed");
}