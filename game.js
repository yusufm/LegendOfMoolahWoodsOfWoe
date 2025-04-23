const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cowPosition = { x: canvas.width / 2, y: canvas.height / 2 }; // Revert cow position to center
const cowImage = new Image();
cowImage.src = 'cow.png'; // Revert to original cow image

const cageImage = new Image();
cageImage.src = 'cage.png'; // Ensure this image is in your project directory

const keyImage = new Image();
keyImage.src = 'key.png'; // Ensure this image is in your project directory

const winnerImage = new Image();
winnerImage.src = 'winner.png'; // Ensure this image is in your project directory

const winningBannerImage = new Image();
winningBannerImage.src = 'winning_banner.png'; // Ensure this image is in your project directory

const treeImage = new Image();
treeImage.src = 'tree.png';

const treeImage2 = new Image();
treeImage2.src = 'tree2.png';

const grassImage = new Image();
grassImage.src = 'grass.png';

grassImage.onload = drawScene;

const buttonImage = new Image();
buttonImage.src = 'button.png'; // Ensure this image is in your project directory

const logImage = new Image();
logImage.src = 'log.png'; // Ensure this image is in your project directory

const counterImage = new Image();
counterImage.src = 'log_counter.png'; // Ensure this image is in your project directory

let trees = [];
const treeCount = 300; // Further increased tree count for dense forest
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const clearRadius = 100 * 1.5; // Further increased clear area radius
for (let i = 0; i < treeCount; i++) {
    let x, y;
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
    } while (Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) < clearRadius || (x > canvas.width - 100 && y > canvas.height - 100)); // Ensure space in bottom right corner
    const treeType = Math.random() < 0.5 ? treeImage : treeImage2;
    trees.push({ x, y, treeType });
}

trees.sort((a, b) => a.y - b.y); // Sort trees by y-coordinate

let highlightedTrees = [];
let logs = [];
let logCount = 0;
let keyFollowingCow = false;
let cageReplaced = false;

let timer = 180; // 3 minutes in seconds
setInterval(() => {
    if (timer > 0) {
        timer--;
    }
}, 1000);

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (highlightedTrees.length > 0) {
        const firstTree = highlightedTrees[0];
        if (
            mouseX > firstTree.x - 37.5 &&
            mouseX < firstTree.x + 37.5 &&
            mouseY > firstTree.y - 37.5 &&
            mouseY < firstTree.y + 37.5
        ) {
            logs = highlightedTrees.map(tree => ({ x: tree.x, y: tree.y }));
            trees = trees.filter(tree => !highlightedTrees.some(ht => ht.x === tree.x && ht.y === tree.y));
            logCount += highlightedTrees.length;
            highlightedTrees = [];
            return;
        }
    }

    highlightedTrees = trees
        .map(tree => ({
            ...tree,
            distance: Math.sqrt((mouseX - tree.x) ** 2 + (mouseY - tree.y) ** 2)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 6);
});

cowImage.onerror = function() {
    console.error('Failed to load cow image.');
};

treeImage.onerror = function() {
    console.error('Failed to load tree image.');
};

treeImage2.onerror = function() {
    console.error('Failed to load second tree image.');
};

function isColliding(x, y) {
    return trees.some(tree => {
        const treeWidth = 75 * 0.8; // 80% of the tree size
        const treeHeight = 75 * 0.8; // 80% of the tree size
        return x < tree.x + treeWidth / 2 && x + 50 > tree.x - treeWidth / 2 &&
               y < tree.y + treeHeight / 2 && y + 50 > tree.y - treeHeight / 2;
    });
}

window.addEventListener('keydown', function(event) {
    const speed = 5;
    let newX = cowPosition.x;
    let newY = cowPosition.y;
    switch(event.key) {
        case 'ArrowUp':
            newY -= speed;
            break;
        case 'ArrowDown':
            newY += speed;
            break;
        case 'ArrowLeft':
            newX -= speed;
            break;
        case 'ArrowRight':
            newX += speed;
            break;
    }
    if (!isColliding(newX, newY)) {
        cowPosition.x = newX;
        cowPosition.y = newY;
    }

    // Check if cow touches the key
    if (logCount >= 54 && !keyFollowingCow) {
        const keyX = 10 + 75 / 2;
        const keyY = 10 + 75 / 2;
        if (Math.abs(cowPosition.x - keyX) < 50 && Math.abs(cowPosition.y - keyY) < 50) {
            keyFollowingCow = true;
        }
    }

    // Check if cow touches the cage
    if (keyFollowingCow && !cageReplaced) {
        const cageX = canvas.width - 50 - 10;
        const cageY = canvas.height - 50 - 10;
        if (Math.abs(cowPosition.x - cageX) < 50 && Math.abs(cowPosition.y - cageY) < 50) {
            cageReplaced = true;
        }
    }
});

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tile grass image with scaling
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = grassImage.width / 5;
    patternCanvas.height = grassImage.height / 5;
    const patternCtx = patternCanvas.getContext('2d');
    patternCtx.drawImage(grassImage, 0, 0, patternCanvas.width, patternCanvas.height);
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw diffused light blue selection behind trees
    ctx.save();
    ctx.fillStyle = 'rgba(173, 216, 230, 0.5)'; // Light blue color
    ctx.shadowColor = 'rgba(173, 216, 230, 0.5)';
    ctx.shadowBlur = 20;
    highlightedTrees.forEach(tree => {
        ctx.fillRect(tree.x - 37.5, tree.y - 37.5, 75, 75);
    });
    ctx.restore();

    // Draw trees from stored positions
    trees.forEach(tree => {
        ctx.drawImage(tree.treeType, tree.x - 37.5, tree.y - 37.5, 75, 75);
    });

    // Draw logs
    logs.forEach(log => {
        ctx.drawImage(logImage, log.x - 37.5, log.y - 37.5, 75, 75);
    });

    // Draw button in front of all trees
    if (highlightedTrees.length > 0) {
        const firstTree = highlightedTrees[0];
        ctx.drawImage(buttonImage, firstTree.x - 37.5, firstTree.y - 37.5, 75, 75);
    }

    // Draw counter or key
    if (logCount >= 54) {
        if (keyFollowingCow) {
            ctx.drawImage(keyImage, cowPosition.x - 25, cowPosition.y - 25, 50, 50); // Key follows cow
        } else {
            ctx.drawImage(keyImage, 10, 10, 150, 75); // Replace counter with key
        }
    } else {
        ctx.drawImage(counterImage, 10, 10, 150, 75); // Make counter bigger
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial'; // Increase font size
        ctx.fillText(logCount, 100, 55); // Position number in the box
    }

    // Draw timer in the top right corner
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial'; // Increase size by 2x
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3; // Make outline 1.5x thicker
    ctx.strokeText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, canvas.width - 80, 30);
    ctx.fillText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, canvas.width - 80, 30);

    // Draw cage or winner image in the bottom-right corner
    const cageWidth = 100; // 2x bigger
    const cageHeight = 100; // 2x bigger
    if (cageReplaced) {
        ctx.drawImage(winnerImage, canvas.width - cageWidth - 10, canvas.height - cageHeight - 10, cageWidth, cageHeight);

        // Draw winning banner in the center
        const bannerWidth = 900; // 3x bigger
        const bannerHeight = 450; // 3x bigger
        ctx.drawImage(winningBannerImage, canvas.width / 2 - bannerWidth / 2, canvas.height / 2 - bannerHeight / 2, bannerWidth, bannerHeight);
    } else {
        ctx.drawImage(cageImage, canvas.width - cageWidth - 10, canvas.height - cageHeight - 10, cageWidth, cageHeight);
    }

    // Draw cow image
    const cowWidth = 50 * 1.25;
    const cowHeight = 50 * 1.25;
    ctx.drawImage(cowImage, cowPosition.x - cowWidth / 2, cowPosition.y - cowHeight / 2, cowWidth, cowHeight);

    requestAnimationFrame(drawScene);
} 