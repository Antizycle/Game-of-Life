let CycleInterval = "";
let genCounter = 0;
let field = {
    x: 10,
    y: 10,
    randP: 0.15,
    array: [],
    aliveCells: 0
}
let isGenerated = false;
let isRunning = false;

// DOM handlers
const elSizeX = document.getElementById('sizeX')
const elSizeY = document.getElementById('sizeY')
const elRandP = document.getElementById('randP')
const elEvolS = document.getElementById('evolS')
const elGenField = document.getElementById('genField');
const elCycle = document.getElementById('cycle');
const elStart = document.getElementById('start');
const elStopLife = document.getElementById('stop-life');
const elClear = document.getElementById('clear');
const elGenCounter = document.getElementById('gen-counter');
const elDeathCounter = document.getElementById('death-counter');
const elSurvCounter = document.getElementById('surv-counter');
const elBirthCounter = document.getElementById('birth-counter');
const elHelp = document.getElementById('help');
const elHelpBtn = document.getElementById('header__help-btn');
const elHelpCloseBtn = document.getElementById('help__close-btn');
const elHelpClose = document.getElementById('help__close');


// event listeners
elGenField.addEventListener('click', generateField);
elCycle.addEventListener('click', oneCycle);
elStart.addEventListener('click', startLife);
elStopLife.addEventListener('click', stopLife);
elClear.addEventListener('click', clearField);
elHelpBtn.addEventListener('click', () => {
    elHelp.style.visibility = "visible";
    elHelpClose.style.visibility = "visible";
});
elHelpCloseBtn.addEventListener('click', hideHelpTooltip);
elHelpClose.addEventListener('click', hideHelpTooltip);

function validateInput(value, range, defaultValue) {
	if (!/[0-9]/.test(value)) value = defaultValue;
    value = parseInt(value);
    if (value < range[0] || value > range[1]) value = defaultValue;
    return value;
}

function navDisabling(isGen, isRun) {
    if (isGen && !isRun) {
        elSizeX.removeAttribute('disabled');
        elSizeY.removeAttribute('disabled');
        elRandP.removeAttribute('disabled');
        elEvolS.removeAttribute('disabled');
        elGenField.removeAttribute('disabled');
        elCycle.removeAttribute('disabled');
        elStart.removeAttribute('disabled');
        elClear.removeAttribute('disabled');
        elStopLife.setAttribute('disabled', '');
    }
    if (isGen && isRun) {
        elSizeX.setAttribute('disabled', '');
        elSizeY.setAttribute('disabled', '');
        elRandP.setAttribute('disabled', '');
        elEvolS.setAttribute('disabled', '');
        elGenField.setAttribute('disabled', '');
        elCycle.setAttribute('disabled', '');
        elStart.setAttribute('disabled', '');
        elStopLife.removeAttribute('disabled');
        elClear.removeAttribute('disabled');
    }
}

function getSize() {
    field.x = validateInput(elSizeX.value, [10, 99], 30);
    field.y = validateInput(elSizeY.value, [10, 99], 30);

    elSizeX.value = field.x; // updating values in the input fields
    elSizeY.value = field.y;

    return [field.x, field.y]; 
}

function generateField() {
    const [x, y] = getSize();

    field.randP = elRandP.value;
    if (field.randP != 0) {
        field.randP = validateInput(field.randP, [0, 15], 10);
    }
    elRandP.value = field.randP; // updating value in the input field

    isGenerated = true;
    genCounter = 0; 
    elGenCounter.textContent = genCounter;
    elDeathCounter.textContent = 0;
    elSurvCounter.textContent = 0;
    elBirthCounter.textContent = 0;

    let generateFieldStr = ""; // generation string declaration and purging
    let id = '';
    let currentStatus = '';
    const elField = document.getElementById('field');
    let fieldArrayRow = [];
    field.array = []; // clearing array
    

    for (let row = 0; row <= y - 1; row++) {
        generateFieldStr += "<tr id='row" + row.toString().padStart(2, '0') + "'>"; // row start and number
        fieldArrayRow = [];
            for (let column = 0; column <= x - 1; column++) {
                id = row.toString().padStart(2, '0') + column.toString().padStart(2, '0');
                currentStatus = seedRandomizer(field.randP);
                generateFieldStr += "<td id='" + id + "' class='" + currentStatus + "'></td>";
                fieldArrayRow.push(currentStatus);
                if(currentStatus === 'alive') field.aliveCells++;
            }
        field.array.push(fieldArrayRow);
        generateFieldStr += "</tr>";
        }
    elField.innerHTML = generateFieldStr;
    
    // event listeners for cell state toggling
    const deadList = document.getElementsByClassName('dead');
    const aliveList = document.getElementsByClassName('alive');
    let deadListLenght = deadList.length;
    let aliveListLenght = aliveList.length;

    navDisabling(isGenerated, isRunning);

    for (let deadEl = 0; deadEl < deadListLenght; deadEl++) {
        deadList[deadEl].addEventListener('click', toggleCell);
    }

    for (let aliveEl = 0; aliveEl < aliveListLenght; aliveEl++) {
        deadList[aliveEl].addEventListener('click', toggleCell);
    }
}
    
function seedRandomizer(randPercent) {
    if (randPercent == 0) return 'dead'; // if 0 - generate blank field
    randPercent /= 100; // otherwise generate status for a cell
    const rndm = Math.random();
    if (rndm < randPercent) return 'alive';
    if (rndm >= randPercent) return 'dead';
    else return 'dead';
}

function oneCycle() {
    if(!isGenerated) {generateField();}

    const x = field.x;
    const y = field.y;
    let fieldArrayClone = field.array.map(item => item.slice()); // Checking in the orig array, changing in the clone
    let deathCounter = 0; // counts deaths in this cycle
    let survCounter = 0;  // counts survived cells
    let birthCounter = 0;  // counts ressurections

    for (let row = 0; row < y; row++) {
        for (let column = 0; column < x; column++) {
            // i - row / y, j - column / x. A bit counterintuitive, yeah :) Array first level is rows (y), second -- columsn (x)
            // matrix coords map
            // a (j-1) / c (i-1) | j (j  ) / c (i-1) | b (j+1) / c (i-1)
            // a (j-1) / i (i  ) | j (j  ) / i (i  ) | b (j+1) / i (i  )
            // a       / d (i+1) | j       / d       | b       / d

            let a = column - 1, c = row - 1; // shortcuts
            let b = column + 1, d = row + 1;
            if (row === 0) c = y - 1; // infinite field
            if (row === y-1) d = 0; 
            if (column === 0) a = x - 1;
            if (column === x-1) b = 0;
            let CellNeighbours = [];
            let ID = (row).toString().padStart(2, '0') + (column).toString().padStart(2, '0'); // determining cell ID
            let curStatus = field.array[row][column]; // getting current cell status
            let aliveCounter = 0;

            CellNeighbours.push(field.array[c][a]); // -1 -1  pushing cell neighbours into separete array
            CellNeighbours.push(field.array[row][a]); // -1  0  for ease of further checking
            CellNeighbours.push(field.array[d][a]); // -1 +1
            CellNeighbours.push(field.array[c][column]); //  0 -1
            CellNeighbours.push(field.array[d][column]); //  0 +1
            CellNeighbours.push(field.array[c][b]); // +1 -1
            CellNeighbours.push(field.array[row][b]); // +1  0
            CellNeighbours.push(field.array[d][b]); // +1 +1

            aliveCounter = CellNeighbours.filter(item => {return item === 'alive';}).length
            
            // applying rules. If alive and <2 and >3 - dead. If 2 or 3 and alive - lives. If 3 and dead - alive
            if (curStatus === 'alive') {
                if (aliveCounter < 2 || aliveCounter > 3) {
                    document.getElementById(ID).className = 'dead';
                    fieldArrayClone[row][column] = 'dead';
                    deathCounter++;
                } else {
                    survCounter++;
                }
            }
            if (curStatus === 'dead' && aliveCounter === 3) {
                document.getElementById(ID).className = 'alive';
                fieldArrayClone[row][column] = 'alive';
                birthCounter++;
            }
        }
    }
    field.array = fieldArrayClone.map(itemC => itemC.slice()); // writing changed array back into initial array
    genCounter++;

    elGenCounter.textContent = genCounter; // updating values on screen
    elDeathCounter.textContent = deathCounter;
    elSurvCounter.textContent = survCounter;
    elBirthCounter.textContent = birthCounter;
}

function toggleCell() // cell state toggling on click
{
    let y = this.id.slice(0, 2); // get coords by parsing cell ID
    let x = this.id.slice(2);
    let cellStatus = this.className; // get current cell status

    x = parseInt(x); // array indexes for current cell
    y = parseInt(y);

    if (cellStatus === 'dead') {
        this.className = 'alive';
        field.array[y][x] = 'alive';
    }
    else if (cellStatus === 'alive') {
        this.className = 'dead';
        field.array[y][x] = 'dead';
    }
}

function startLife() // start evolution using evoSpeed as cycle interval
{
    if(CycleInterval) return;
    else {
        let evoSpeed = validateInput(elEvolS.value, [40, 2000], 50);
        CycleInterval = setInterval(oneCycle, evoSpeed);
        isRunning = true
        navDisabling(isGenerated, isRunning);
    }
}

function stopLife() // stop evolution
{
    if (CycleInterval) {
        clearInterval(CycleInterval);
        CycleInterval = '';
        isRunning = false;
        navDisabling(isGenerated, isRunning);
    }
    else return;
}

function clearField()
{
    genCounter = 0;
    elGenCounter.textContent = genCounter; 
    elDeathCounter.textContent = 0;
    elSurvCounter.textContent = 0;
    elBirthCounter.textContent = 0; // Counters reset
    stopLife(); // if evo is running, stop it before resetting
    elRandP.value = 0; // quick and dirty way to generate blank field upon resseting
    generateField();
}

function hideHelpTooltip()
{
        elHelp.style.visibility = "hidden";
        elHelpClose.style.visibility = "hidden";
}