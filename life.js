let CycleInterval = "";
let genCounter = 0;
let field = {
    defaultSize: 10,
    defaultSpeed: 100,
    x: 10,
    y: 10,
    randP: 0.15,
    array: [],
    aliveCells: 0
}
let isGenerated = 0;

// DOM handlers
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

//get X and Y from input field, if checking fails - set to defualt values
    function getSize()
    {
        field.x = O('sizeX').value; // getting X and Y dementions from input field. Parsing it to Integer
        field.y = O('sizeY').value;
        field.x = parseInt(field.x) ?  parseInt(field.x) : field.defaultSize; // if cannot parse to integer, set to default value
        field.y = parseInt(field.y) ?  parseInt(field.y) : field.defaultSize;
        if (field.x<10 || field.x>99) field.x = field.defaultSize; // if size out of range, setting it to 10x10
        if (field.y<10 || field.y>99) field.y = field.defaultSize;

        O('sizeX').value = field.x; // updating values in the unput fields
        O('sizeY').value = field.y;

        return [field.x, field.y]; 
    }

    function generateField() // field generation with input values (size and life percentage)
    {
        [x, y] = getSize();  // destructuring function return into x and y

        // getting value out of the population input and checking it
        field.randP = O('randP').value;
        if (field.randP != 0)
        {
            parseInt(field.randP) ? field.randP = parseInt(field.randP) : field.randP = 10;
            if (field.randP<-1 || field.randP>15) field.randP = 10;
        }
        O('randP').value = field.randP; // updating value in the input field

        isGenerated = 1;
        genCounter = 0; // counter reset
        elGenCounter.textContent = genCounter;
        elDeathCounter.textContent = 0;
        elSurvCounter.textContent = 0;
        elBirthCounter.textContent = 0;

        let generateFieldStr = ""; // generation string declaration and purging
        field.array = []; // clearing array
    
        for (let i=1; i<=y; i++) // cycling generation using our size values
            {
            generateFieldStr += "<tr id='row" + i.toString().padStart(2, 0) + "'>"; // row start and number
            let fieldArrayRow = [];
                for (let j=1; j<=x; j++)
                {
                    let id = j.toString().padStart(2, 0) + i.toString().padStart(2, 0);
                    let currentStatus = seedRandomizer(field.randP);
                    generateFieldStr += "<td id='" + id + "' class='" + currentStatus + "'></td>";
                    fieldArrayRow.push(currentStatus);
                    if(currentStatus === 'alive') field.aliveCells++;
                    // console.log(i + ":" + j + " | " + fieldArrayRow);
                }
            field.array.push(fieldArrayRow);
            generateFieldStr += "</tr>";
            }
        elField = document.getElementById('field');
        elField.innerHTML = generateFieldStr;
        
        // event listeners for cell state toggling
        deadList = C('dead'); // getting all dead and live cells into an array
        aliveList = C('alive');

        let deadListLenght = deadList.length;
        let aliveListLenght = aliveList.length;

        for (let deadEl = 0; deadEl < deadListLenght; deadEl++) // adding even handlers to every dead and alive cells
        {
            deadList[deadEl].addEventListener('click', toggleCell);
        }

        for (let aliveEl = 0; aliveEl < aliveListLenght; aliveEl++)
        {
            deadList[aliveEl].addEventListener('click', toggleCell);
        }
    }
    
    function seedRandomizer(randPercent)
    {
        if (randPercent == 0) return 'dead'; // if 0 - generate blank field

        randPercent /= 100; // otherwise generate status for a cell
        rndm = Math.random();
        if (rndm < randPercent) return 'alive';
        if (rndm >= randPercent) return 'dead';
        else return 'dead';
    }

    function oneCycle()
    {
        if(isGenerated != 1)
        {
            generateField();
        }

        x = field.x;
        y = field.y;
        let fieldArrayClone = field.array.map(item => item.slice()); // deep cloning the array (should work for 2d array). Checking in the orig array, changing in the clone
        let deathCounter = 0; // counts deaths in this cycle
        let survCounter = 0;  // counts survived cells
        let birthCounter = 0;  // counts ressurections

        for (let i=0; i<y; i++)
        {
            for (let j=0; j<x; j++)
            {
                // i - row / y, j - column / x. A bit counterintuitive, yeah :) Array first level is rows (y), second -- columsn (x)
                // matrix coords map
                // a (j-1) / c (i-1) | j (j  ) / c (i-1) | b (j+1) / c (i-1)
                // a (j-1) / i (i  ) | j (j  ) / i (i  ) | b (j+1) / i (i  )
                // a       / d (i+1) | j       / d       | b       / d

                let a = j-1, b = j+1, c = i-1, d = i+1; //shortcuts
                if (i === 0) c = y-1; if (i === y-1) d = 0; //if border cells we go to other side of the field
                if (j === 0) a = x-1; if (j === x-1) b = 0;
                let CellNeighbours = [];
                let ID = (j+1).toString().padStart(2, 0) + (i+1).toString().padStart(2, 0); //determining cell ID
                let curStatus = field.array[i][j]; //getting current cell status
                let aliveCounter = 0;

                CellNeighbours.push(field.array[c][a]); // -1 -1  pushing cell neighbours into separete array
                CellNeighbours.push(field.array[i][a]); // -1  0  for ease of further checking
                CellNeighbours.push(field.array[d][a]); // -1 +1
                CellNeighbours.push(field.array[c][j]); //  0 -1
                CellNeighbours.push(field.array[d][j]); //  0 +1
                CellNeighbours.push(field.array[c][b]); // +1 -1
                CellNeighbours.push(field.array[i][b]); // +1  0
                CellNeighbours.push(field.array[d][b]); // +1 +1

                for (k=0; k<8; k++)
                {
                    if (CellNeighbours[k] === 'alive') aliveCounter++; //checking and counting alive neighbours
                    if (aliveCounter>3) break; // no point count further so we break
                }

                //applying rules. If alive and <2 and >3 - dead. If 2 or 3 and alive - lives. If 3 and dead - alive
                if (curStatus === 'alive')
                {
                    if (aliveCounter < 2 || aliveCounter > 3)
                    {
                        O(ID).className = 'dead';
                        fieldArrayClone[i][j] = 'dead';
                        deathCounter++;
                    }
                    else {
                       survCounter++;
                    }
                }
                else if (curStatus === 'dead' && aliveCounter === 3)
                {
                    O(ID).className = 'alive';
                    fieldArrayClone[i][j] = 'alive';
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
        let x = this.id.slice(0, 2); // get coords by parsing cell ID
        let y = this.id.slice(2);
        let cellStatus = this.className; // get current cell status

        x = parseInt(x)-1; // array indexes for current cell
        y = parseInt(y)-1;

        if (cellStatus === 'dead') // if dead/alive, set to alive/dead. Change cell class and modify field.array
        {
            this.className = 'alive';
            field.array[y][x] = 'alive';
        }
        else if (cellStatus === 'alive')
        {
            this.className = 'dead';
            field.array[y][x] = 'dead';
        }
    }

    function startLife() // start evolution using evoSpeed as cycle interval
    {
        if(CycleInterval) return;
        else {
            let evoSpeed = O('evolS').value;
            evoSpeed = parseInt(evoSpeed) ? parseInt(evoSpeed) : field.defaultSpeed;
            if (evoSpeed<40 || evoSpeed>2000) evoSpeed = field.defaultSpeed;

            CycleInterval = setInterval(oneCycle, evoSpeed);
        }
    }

    function stopLife() // stop evolution
    {
        if (CycleInterval) {
            clearInterval(CycleInterval);
            CycleInterval = '';
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
        O('randP').value = 0; // quick and dirty way to generate blank field upon resseting
        generateField();
    }

    function hideHelpTooltip()
    {
            elHelp.style.visibility = "hidden";
            elHelpClose.style.visibility = "hidden";
    }