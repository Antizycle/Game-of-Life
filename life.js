
let CycleInterval;
let genCounter = 0;
let field = {
    defaultSize: 10,
    defaultSpeed: 500,
    x: 10,
    y: 10,
    randP: 0.85,
    array: [],
    aliveCells: 0
}

// event listeners
O('genField').addEventListener('click', generateField);
O('cycle').addEventListener('click', oneCycle);
O('start').addEventListener('click', startLife);
O('stop-life').addEventListener('click', stopLife);
O('clear').addEventListener('click', clearField);
O('genBlinker').addEventListener('click', generateBlinker);

//get X and Y from input field, if checking fails - set to defualt values
    function getSize()
    {
        field.x = O('sizeX').value; // getting X and Y demention from input field. Parsing it to Integer
        field.y = O('sizeY').value;
        parseInt(field.x) ? field.x = parseInt(field.x) : field.x = field.defaultSize; // if cannot parse to integer, set to default value
        parseInt(field.y) ? field.y = parseInt(field.y) : field.y = field.defaultSize;
        if (field.x<10 || field.x>99) field.x = field.defaultSize; // if size out of range, setting it to 10x10
        if (field.y<10 || field.y>99) field.y = field.defaultSize;
    }

    function generateField() // field generation with input values (size and live percentage)
    {
        getSize();
        x = field.x; // shorthanding x and y
        y = field.y;

        let generateFieldStr = ""; // generation string declaration and purging
        field.array = []; // clearing array
    
        for (let i=1; i<=y; i++) // cycling generation using our size values
            {
            generateFieldStr += "<tr id='row" + i.toString().padStart(2, 0) + "'>"; // row start and number
            let fieldArrayRow = new Array();
                for (let j=1; j<=x; j++)
                {
                    let id = j.toString().padStart(2, 0) + i.toString().padStart(2, 0);
                    let currentStatus = seedRandomizer();
                    generateFieldStr += "<td id='" + id + "' class='" + currentStatus + "'></td>";
                    fieldArrayRow.push(currentStatus);
                    if(currentStatus === 'alive') field.aliveCells++;
                    // console.log(i + ":" + j + " | " + fieldArrayRow);
                }
            field.array.push(fieldArrayRow);
            generateFieldStr += "</tr>";
            }

        O('field').innerHTML = generateFieldStr;
        
        // even listeners for cell state toggling
        deadList = C('dead'); // getting all dead and live cells into an array
        aliveList = C('alive');

        for (let deadEl = 0; deadEl < deadList.length; deadEl++) // adding even handlers to every dead and alive cells
        {
            deadList[deadEl].addEventListener('click', toggleCell);
        }

        for (let aliveEl = 0; aliveEl < aliveList.length; aliveEl++)
        {
            deadList[aliveEl].addEventListener('click', toggleCell);
        }
    }

    function generateBlinker()
    {
        clearField();

        getSize()
        x = field.x;
        y = field.y;

        let generateFieldStr = ""; // generation string declaration and purging
        let tempX = x/2; let tempY = y/2;

        for (let i=1; i<=y; i++) // cycling generation using our size values
            {
            generateFieldStr += "<tr id='row" + i.toString().padStart(2, 0) + "'>"; // row start and number
            let fieldArrayRow = new Array();
                for (let j=1; j<=x; j++)
                {
                    let id = j.toString().padStart(2, 0) + i.toString().padStart(2, 0); // 14-15 15-14 15-15 15-16 16-15

                    // this is a bit wrong with coords. Currently its assumed i is X and j is Y. Got to swap it around

                    if (i == tempX - 1 && j == tempY) {generateFieldStr += "<td id='" + id + "' class='alive'></td>"; currentStatus = 'alive';}
                    else if (i == tempX && j == tempY - 1) {generateFieldStr += "<td id='" + id + "' class='alive'></td>"; currentStatus = 'alive';}
                    else if (i == tempX && j == tempY) {generateFieldStr += "<td id='" + id + "' class='alive'></td>"; currentStatus = 'alive';}
                    else if (i == tempX && j == tempY + 1) {generateFieldStr += "<td id='" + id + "' class='alive'></td>"; currentStatus = 'alive';}
                    else if (i == tempX + 1 && j == tempY) {generateFieldStr += "<td id='" + id + "' class='alive'></td>"; currentStatus = 'alive';}
                    else {generateFieldStr += "<td id='" + id + "' class='dead'></td>"; currentStatus = 'dead';}
                    fieldArrayRow.push(currentStatus);
                    //console.log(i + ":" + j + " | " + fieldArrayRow);
                }
            field.array.push(fieldArrayRow);
            generateFieldStr += "</tr>";
            }

        O('field').innerHTML = generateFieldStr;

    }
    
    function seedRandomizer()
    {
        field.randP = O('randP').value;
        if (field.randP == 0) return 'dead'; // if 0 - generate blank field

        parseInt(field.randP) ? field.randP = parseInt(field.randP) : field.randP = 90;
        if (field.randP<84 || field.randP>99) field.randP = 90;
        field.randP /= 100;
        rndm = Math.random();
        if (rndm < field.randP) return 'dead';
        if (rndm >= field.randP) return 'alive';
        else return 'dead';
    }

    function oneCycle()
    {
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
                // a (j-1) / c (i-1) | j (j  ) / c (i-1) | b (j+1) / c (i-1)
                // a (j-1) / i (i  ) | j (j  ) / i (i  ) | b (j+1) / i (i  )
                // a       / d (i+1) | j       / d       | b       / d

                let a = j-1; let b = j+1; let c = i-1; let d = i+1; //shortcuts
                if (i == 0) c = y-1; if (i == y-1) d = 0; //if border cells we go to other side of the field
                if (j == 0) a = x-1; if (j == x-1) b = 0;
                // console.log("i: " + i + " j: " + j + " a: " + a + " b: " + b + " c: " + c + " d: " + d);
                let CellNeighbours = [];
                CellNeighbours.push(field.array[c][a]); // -1 -1  pushing cell neighbours into separete array
                CellNeighbours.push(field.array[i][a]); // -1  0  for ease of further checking
                CellNeighbours.push(field.array[d][a]); // -1 +1
                CellNeighbours.push(field.array[c][j]); //  0 -1
                CellNeighbours.push(field.array[d][j]); //  0 +1
                CellNeighbours.push(field.array[c][b]); // +1 -1
                CellNeighbours.push(field.array[i][b]); // +1  0
                CellNeighbours.push(field.array[d][b]); // +1 +1
                let ID = (j+1).toString().padStart(2, 0) + (i+1).toString().padStart(2, 0); //determining cell ID
                let curStatus = field.array[i][j]; //finding current cell status
                let aliveCounter = 0;

                for (k=0; k<8; k++)
                {
                    if (CellNeighbours[k] == 'alive') aliveCounter++; //checking and counting alive neighbours
                    if (aliveCounter>3) break; // no point count further so we break
                }

                //applying rules. If alive and >2 and <3 - dead. If 2 or 3 and alive - lives. If 3 and dead - alive
                if (curStatus == 'alive')
                {
                    if (aliveCounter < 2 || aliveCounter > 3)
                    {
                        O(ID).className = 'dead';
                        fieldArrayClone[i][j] = 'dead';
                        deathCounter++;
                        //console.log("Id: " + ID + ". Counter: " + aliveCounter + ". alive -> dead");
                    }
                    else {
                       survCounter++;
                    }
                }
                else if (curStatus == 'dead' && aliveCounter == 3)
                {
                    O(ID).className = 'alive';
                    fieldArrayClone[i][j] = 'alive';
                    birthCounter++;
                    //console.log("Id: " + ID + ". Counter: " + aliveCounter + ". dead -> alive");
                }
                //console.log("Id: " + ID + ". Counter: " + aliveCounter);

            }
        }
        field.array = fieldArrayClone.map(itemC => itemC.slice()); // writing changed array back into initial array
        genCounter++;
        O('gen-counter').textContent = genCounter.toString().padStart(4, 0);
        O('death-counter').textContent = deathCounter.toString().padStart(4, 0);
        O('surv-counter').textContent = survCounter.toString().padStart(4, 0);
        O('birth-counter').textContent = birthCounter.toString().padStart(4, 0);
    }

    function toggleCell() // cell state toggling on click
    {
        let x = this.id.slice(0, 2); // get coords by parsing cell ID
        let y = this.id.slice(2);
        let cellStatus = this.className; // get current cell status

        x = parseInt(x)-1; // array indexes for current cell
        y = parseInt(y)-1;

        // console.log(this.id + ", x: " + x + ", y: " + y + ", status: " + cellStatus);
        if (cellStatus == 'dead') // if dead/alive, set to alive/dead: change cell class and modify field.array
        {
            // console.log(field.array[y][x] + " before changing");
            this.className = 'alive';
            field.array[y][x] = 'alive';
            // console.log(field.array[y][x] + " after changing");
            // console.log("Changed to Alive!")
        }
        else if (cellStatus == 'alive')
        {
            this.className = 'dead';
            field.array[y][x] = 'dead';
            // console.log("Changed to Dead!")
        }
    }

    function startLife() // start evolution using evoSpeed as cycle interval
    {
        let evoSpeed = O('evolS').value;
        parseInt(evoSpeed) ? evoSpeed = parseInt(evoSpeed) : evoSpeed = field.defaultSpeed;
        if (evoSpeed<40 || evoSpeed>2000) evoSpeed = field.defaultSpeed;

        CycleInterval = setInterval(oneCycle, evoSpeed);
    }

    function stopLife() // stop evolution
    {
        clearInterval(CycleInterval); //
        console.log(genCounter + " [stopped]"); // purely for debug purposes
    }
    
    function clearField()
    {
        genCounter = 0;
        O('gen-counter').textContent = genCounter; // Generation counter reset
        O('randP').value = 0; // quick and dirty way to generate blank field upon resseting
        generateField();
    }