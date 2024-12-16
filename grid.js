/**
 * @fileoverview Displaying the Travian map grid with enhanced info.
 */

// grid.js
document.addEventListener('DOMContentLoaded', function () {
    const canvasContainer = document.getElementById('canvas-container'); // Get the canvas container element
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 401;
    const canvasWidth = window.innerWidth * 0.8;
    const canvasHeight = window.innerHeight;

    let cellSize = 5;
    const minCellSize = 5;
    const maxCellSize = 50;
    let offsetX = 0;
    let offsetY = 0;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    let clearers = [];
    let hammers = [];
    let arters = [];
    let selectedMode = 0;

    const tooltip = document.getElementById('tooltip');

    function resizeCanvas() {
        canvas.width = canvasContainer.offsetWidth;
        canvas.height = canvasContainer.offsetHeight;
        drawGrid();
    }

    // Call resizeCanvas initially, and on every resize event
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawGrid() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.save();

        const scaledCellSize = cellSize / 5;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scaledCellSize, scaledCellSize);

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                trX = x - 200;
                trY = 200 - y;
                opColor = isCoveredByOp(trX, trY, selectedMode);

                if (opColor) {
                    ctx.fillStyle = opColor;
                } else if (isWW(trX, trY)) {
                    ctx.fillStyle = 'red';
                } else if (isGrey(trX, trY)) {
                    ctx.fillStyle = 'lightgrey';
                } else {
                    ctx.fillStyle = 'white';
                }
                ctx.fillRect(x * 5, y * 5, 5, 5);
            }
        }

        
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                trX = x - 200;
                trY = 200 - y;
                opColor = isCoveredByOp(trX, trY, selectedMode);

                if (opColor) {
                    player = isOp(trX, trY, selectedMode);
                    if (player) {
                        ctx.font = 'bold 2px sans-serif'
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillStyle = getReverseColor(opColor);
                        ctx.fillText(player, (x + 0.5) * 5, (y + 0.3) * 5);
                    }
                }
            }
        }

        // Draw Grid Lines (MUCH FASTER)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.1 ;
    
        for (let x = 0; x <= gridSize; x++) {
            ctx.beginPath();
            ctx.moveTo(x * 5, 0);
            ctx.lineTo(x * 5, gridSize * 5);
            ctx.stroke();
        }
    
        for (let y = 0; y <= gridSize; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * 5);
            ctx.lineTo(gridSize * 5, y * 5);
            ctx.stroke();
        }

        ctx.restore();


        // Draw boundary
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / scaledCellSize;
        ctx.strokeRect(offsetX, offsetY, gridSize * cellSize, gridSize * cellSize);

        
        ctx.restore(); // Restore before drawing rulers
    
        // Draw rulers (outside the scaled/translated context)
        const rulerWidth = 25;  // Adjust ruler width as needed
        const fontSize = 10;    // Adjust font size
    
        ctx.fillStyle = 'white'; // Ruler background
        ctx.fillRect(0, canvasHeight - rulerWidth, canvasWidth, rulerWidth);  // Bottom ruler
        ctx.fillRect(0, 0, rulerWidth, canvasHeight);                        // Left ruler
    
    
        // X-axis ruler (bottom)
        ctx.fillStyle = 'black';
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const rulerStep = calculateRulerStep(cellSize); // Dynamic step
        for (let x = 0; x < gridSize; x += rulerStep) {
            const rulerX = offsetX + (x + 0.5) * cellSize;
    
            if (rulerX >= 0 && rulerX <= canvasWidth) {
                ctx.fillText(x - 200, rulerX, canvasHeight - rulerWidth + 2); // Cell x-coordinate
            }
        }
    
        // Y-axis ruler (left)
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let y = 0; y < gridSize; y += rulerStep) {
            const rulerY = offsetY + (y + 0.5) * cellSize;
    
            if (rulerY >= 0 && rulerY <= canvasHeight) {
                ctx.fillText(200 - y, rulerWidth - 2, rulerY);  // Cell y-coordinate
            }
        }
    }

    function calculateRulerStep(cellSize) {
        // Adjust these values to control ruler tick frequency
        if (cellSize <= 5) return 20;
        if (cellSize <= 10) return 10;
        if (cellSize <= 20) return 5;
        if (cellSize <= 25) return 2;
        if (cellSize <= 50) return 1;
        return 100;
    }

    function isWW(x, y) {
        if (Math.abs(x) === 50 && Math.abs(y) === 50) {
            return true;
        }
        if (Math.abs(x) === 50 && Math.abs(y) === 0) {
            return true;
        }
        if (Math.abs(x) === 0 && Math.abs(y) === 50) {
            return true;
        }
        greyWWs = [
            {x: -1, y: 6},
            {x: 6, y: 3},
            {x: 5, y: -4},
            {x: -3, y: -6},
            {x: -6, y: 1},
        ];
        return greyWWs.some(greyWW => x === greyWW.x && y === greyWW.y);
    }

    function calculateDistance(x, y, a, b) {
        return Math.sqrt((x - a) * (x - a) + (y - b) * (y - b));
    }

    function isGrey(x, y) {
        return calculateDistance(x, y, 0, 0) < 22.5;
    }

    // const sizeSlider = document.createElement('input');
    // sizeSlider.type = 'range';
    // sizeSlider.min = minCellSize;
    // sizeSlider.max = maxCellSize;
    // sizeSlider.value = cellSize;
    // sizeSlider.step = 1;
    // document.body.appendChild(sizeSlider);

    // sizeSlider.oninput = function () {
    //     cellSize = parseInt(this.value, 10);
    //     drawGrid();
    // }

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        const newOffsetX = offsetX + deltaX;
        const newOffsetY = offsetY + deltaY;

        const mapWidth = gridSize * cellSize;
        const mapHeight = gridSize * cellSize;

        if (newOffsetX >= 0 || newOffsetX + canvasWidth < mapWidth || newOffsetY >=0 || newOffsetY + canvasHeight < mapHeight  ) {
            offsetX = newOffsetX;
            offsetY = newOffsetY;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            drawGrid();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        // Tooltip:
        const rect = canvas.getBoundingClientRect();
        const containerRect = canvasContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        // Calculate the cell coordinates
        const cellX = Math.floor((mouseX - offsetX) / cellSize);
        const cellY = Math.floor((mouseY - offsetY) / cellSize);
    
        if (cellX >= 0 && cellX < gridSize && cellY >= 0 && cellY < gridSize) {
            tooltip.textContent = `(${cellX - 200}, ${200 - cellY})`;
            tooltip.style.left = `${event.clientX - containerRect.left + 10}px`; // Position tooltip slightly to the right of the cursor
            tooltip.style.top = `${event.clientY - containerRect.top + 10}px`;
            tooltip.style.opacity = 1; // Show tooltip
        } else {
            tooltip.style.opacity = 0; // Hide tooltip if outside grid
        }
    });

    canvas.addEventListener('mouseout', () => {
        tooltip.style.opacity = 0; // Hide on mouseout
    });


    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });


    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
    
        const zoomFactor = 0.1;
        const delta = -Math.sign(e.deltaY);
        let newCellSize = cellSize + delta * zoomFactor * cellSize;
    
        newCellSize = Math.max(minCellSize, Math.min(newCellSize, maxCellSize));
    
    
    
        // Zoom towards the cursor (Corrected Calculation)
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
    
        const previousScale = cellSize/5;
        const newScale = newCellSize / 5;
    
        offsetX = mouseX - (mouseX - offsetX)* newScale/previousScale; // Correct offset calculation with scaling
        offsetY = mouseY - (mouseY - offsetY)*newScale/previousScale;
    
    
        cellSize = newCellSize // update cellsize at last so that above calculation based on old cellsize
    
        drawGrid();
    }, { passive: false });


    const csvInput = document.getElementById('csvInput');
    const visualizeButton = document.getElementById('visualizeButton');
    
    visualizeButton.addEventListener('click', visualizeSphereOfInfluence);

    function visualizeSphereOfInfluence() {
        const csvData = csvInput.value;
        const players = parseCSV(csvData);
        console.log(players);

        selectedMode = document.querySelector('input[name="mode"]:checked').value; // Get selected mode
        console.log(selectedMode);

        players.forEach(player => {
            const color = getRandomColor();
            if (player.clearer != '-') {
                clearers.push({player: player.player, x: player.x, y: player.y, color: color});
            }
            if (player.hammer != '-') {
                hammers.push({player: player.player, x: player.x, y: player.y, color: color});
            }
            if (player.arter != '-') {
                arters.push({player: player.player, x: player.x, y: player.y, color: color});
            }
        });
        drawGrid();
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        color = '#';
        for (let i = 0; i < 6; ++i) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function getReverseColor(color) {
        const letters = '0123456789ABCDEF';
        roloc = '#';
        for (let i = 1; i < 7; ++i) {
            index = letters.indexOf(color[i]);
            roloc += letters[16 - index - 1];
        }
        return roloc;
    }

    function isOp(x, y, task) {
        if (task == 1) {
            for (let i = 0; i < clearers.length; ++i) {
                player = clearers[i];
                if (player.x === x && player.y === y) {
                    return player.player;
                }
            }
        } else if (task == 2) {
            for (let i = 0; i < hammers.length; ++i) {
                player = hammers[i];
                if (player.x === x && player.y === y) {
                    return player.player;
                }
            }
        } else if (task == 3) {
            for (let i = 0; i < arters.length; ++i) {
                player = arters[i];
                if (player.x === x && player.y === y) {
                    return player.player;
                }
            }
        }
        return null;
    }

    function isCoveredByOp(x, y, task) {
        let color = null;
        if (task == 1) {
            minDistance = 2 * 7 + 0.01;
            clearers.forEach(player => {
                distance = calculateDistance(x, y, player.x, player.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    color = player.color;
                }
            });
        } else if (task == 2) {
            minDistance = 2 * 3 + 0.01;
            hammers.forEach(player => {
                distance = calculateDistance(x, y, player.x, player.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    color = player.color;
                }
            });
        } else if (task == 3) {
            minDistance = 2 * 14 + 0.01;
            arters.forEach(player => {
                distance = calculateDistance(x, y, player.x, player.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    color = player.color;
                }
            });
        }
        return color;
    }

    function parseCSV(csvData) {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];
    
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const entry = {};
            if (values.length !== headers.length) {
                console.error(`Line ${i + 1} has an incorrect number of values.`);
                continue; // Skip this line if it's malformed
            }
    
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j].trim();
                let value = values[j].trim();
    
                if (header === 'radius') {
                    value = parseFloat(value); // Parse radius as a number
                    if (isNaN(value)) {
                        console.error(`Invalid radius value on line ${i + 1}`);
                        value = 0; // default to 0 if not a number
    
                    }
                } else if (header === 'x' || header === 'y') {
                    value = parseInt(value, 10); // Parse x and y as integers
    
                    if (isNaN(value)) {
                        console.error(`Invalid x or y value on line ${i + 1}`);
                        value = 0; // default to 0 if not a number
    
                    }
                }
                entry[header] = value;
            }
            data.push(entry);
        }
    
        return data;
    }

});