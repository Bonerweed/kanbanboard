if (document.readyState !== "loading") {
        initialize();
  }
  else {
    document.addEventListener("DOMContentLoaded", async () => {
        var elems = document.querySelectorAll('select');
        var instances = M.FormSelect.init(elems);
        await initialize();
  });
};

_ticketList = [];
_laneList = [];
_target = undefined;
_dbTarget = undefined;
_toolbox = undefined;
_pointerdown = false;
_newDivamount = 0;
_newTicketAmount = 0;
_newticket = false;
_newlane = false;
_boardID = undefined;

async function initialize() {;
    const boardId = document.getElementsByName("board")[0].id;
    _boardID = boardId;
    //document.getElementById("create-new").addEventListener("click", showCreate);
    _toolbox = document.getElementById("toolbox");
    //document.getElementById(boardId).addEventListener("click", this.deselect);
    const fetchOpts = {
        method: "GET",
        headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded"
    })
    };
    //const boardId = document.getElementByName("board").id;
    const response = await fetch(`./${boardId}/tics`, fetchOpts);
    console.log(response);
    const tjson = await response.json();
    const tickets = tjson.tickets;
    console.log(tickets);
    const lanes = tjson.lanes;
    for (let j = 0; j < lanes.length; j++) {
        _laneList.push(lanes[j]);
    }
    for (let i = 0; i < tickets.length; i++) {
        _ticketList.push(tickets[i]);
        console.log(i, tickets[i]._id, tickets[i]);
        const ticDiv = document.getElementById(tickets[i]._id);
        ticDiv.innerHTML += `
            <h9 id="title"><b>${tickets[i].title}</b></h9><br>
            <p id="content">${tickets[i].text}</p>
        `;
        if (tickets[i].color == "white" ||
            tickets[i].color == "green" ||
            tickets[i].color == "yellow" ||
            tickets[i].color == "red"
        ) {
            ticDiv.classList.add(tickets[i].color);
        }
        else {
            ticDiv.classList.add("white");
        }
    };
    console.log("TICS", _ticketList);
    console.log("LANES", _laneList);
};

//select editable node
function select(id) {
    //prevent clickthrough
    if (_pointerdown) {
        return;
    }
    _pointerdown = true;

    _newticket=false;
    _newlanes=false;
    _dbTarget = undefined;
    _target = undefined;
    if (!document.getElementById("newTicket").classList.contains("hide")) {
        document.getElementById("newTicket").classList.add("hide");
    }

    //fetch element
    console.log(id);
    _target = document.getElementById(id);
    _toolbox.classList.remove("hide");
    //let ticket = undefined;
    if (_target.id.indexOf("_")>-1) {
        console.log("NEW THING");
        if(_target.id.split("_")[1] == "LANE"){
            _newlane = true;
            for (let i = 0; i < _target.children.length; i++) {
                if (_target.children[i].id == "title") {
                    document.getElementById("toolTitle").value = _target.children[i].innerHTML;
                    break;
                }
            }
            //document.getElementById("toolTitle").value = _target.title;
            hideTicketTools();
            if (document.getElementById("delete").classList.contains("hide")) {
                document.getElementById("delete").classList.remove("hide");
            }
            if (document.getElementById("newTicket").classList.contains("hide")) {
                document.getElementById("newTicket").classList.remove("hide");
            }
            return;
        }
        if(_target.id.split("_")[1] == "TICKET"){
            _newticket = true;
            for (let i = 0; i < _target.children.length; i++) {
                console.log(_target.children[i]);
                if (_target.children[i].id == "title") {
                    console.log(_target.children[i].innerHTML);
                    document.getElementById("toolTitle").value = _target.children[i].innerHTML.split(">")[1].split("<")[0];
                }
                else if (_target.children[i].id == "content") {
                    document.getElementById("toolContent").value = _target.children[i].innerHTML;
                }
            }
            showTicketTools();
            if (!document.getElementById("newTicket").classList.contains("hide")) {
                document.getElementById("newTicket").classList.add("hide");
            }
            //document.getElementById("toolTitle").value = _dbTarget.title;
            //document.getElementById("toolContent").value = _target.title;
            return;
        }
    }

    for (let i = 0; i < _ticketList.length; i++) {
        if (_ticketList[i]._id == id) {
            console.log("FOUND ONE");
            _dbTarget = _ticketList[i];
            break;
        }
    }
    if (typeof _dbTarget !== "undefined") {
        showTicketTools()
        document.getElementById("toolTitle").value = _dbTarget.title;
        document.getElementById("toolContent").value = _dbTarget.text;
    }
    else {
        for (let i = 0; i < _laneList.length; i++) {
            if (_laneList[i]._id == id) {
                console.log("FOUND LANE");
                _dbTarget = _laneList[i];
                break;
            }
        }
        hideTicketTools();
        if (document.getElementById("delete").classList.contains("hide")) {
            document.getElementById("delete").classList.remove("hide");
        }
        if (document.getElementById("newTicket").classList.contains("hide")) {
            document.getElementById("newTicket").classList.remove("hide");
        }
        document.getElementById("toolTitle").value = _dbTarget.title;
    }
}


//add color to ticket
function addColor(color){
    console.log(color, _dbTarget, typeof _dbTarget != "undefined");
    console.log(_target, _target.classList, _target.classList.length);
    for (i=0; i < _target.classList.length; i++) {
        if (_target.classList[i] == "white" ||
            _target.classList[i] == "green" ||
            _target.classList[i] == "yellow" ||
            _target.classList[i] == "red"
        ) {
            _target.classList.remove(_target.classList[i]);
            _target.colorVal = color;
            break;
        }
    }
    _target.classList.add(color);
    if (typeof _dbTarget !== "undefined") {
        _dbTarget.color = color;
        console.log(_dbTarget);
    }
}
//move ticket left/right
function moveLR(direction) {
    console.log(_target, _target.parentNode);
    const moves = {
        right: undefined,
        left: undefined
    }
    const origParent = _target.parentNode;
    const currentlanes = document.querySelectorAll("div.lane");
    console.log(origParent, currentlanes);
    //get left right moves
    for (let i = 0; i < currentlanes.length; i++) {
        console.log(currentlanes[i].id == origParent.id, currentlanes[i].id, origParent.id);
        if (currentlanes[i].id == origParent.id) {
            if ( i - 1 > -1) {
                moves.left = currentlanes[i-1];
            }
            if (i + 1 < currentlanes.length) {
                moves.right = currentlanes[i+1];
            }
            console.log(moves);
            break;
        }
    }
    let fragment = document.createDocumentFragment();
    if (direction == "left" && typeof moves.left != "undefined") {
        fragment.appendChild(_target);
        moves.left.appendChild(fragment);
    }
    else if (direction == "right" && typeof moves.right != "undefined") {
        fragment.appendChild(_target);
        moves.right.appendChild(fragment);
    }
    deselect();
}

//move ticket up/down
function moveUD(direction) {
    console.log(_target, _target.parentNode);
    const moves = {
        up: undefined,
        down: undefined,
    }
    const origParent = _target.parentNode;
    
    //get up down moves
    const ticdren = origParent.getElementsByTagName("div");
    console.log(ticdren);
    for (let j= 0; j < ticdren.length;j++) {
        console.log(ticdren[j].id == _target.id, ticdren[j].id, _target.id);
        if (ticdren[j].id == _target.id) {
            if (j-1 > -1) {
                moves.up = ticdren[j-1];
            }
            if (j+1 < ticdren.length) {
                moves.down = ticdren[j+1];
            }
            console.log(moves);
            break;
        }
    }
    if (direction == "up" && typeof moves.up != "undefined") {
        console.log("MOVING UP");
        origParent.insertBefore(_target, moves.up);
    }
    else if (direction == "down" && typeof moves.down != "undefined") {
        console.log("MOVING DOWN");
        origParent.insertBefore(moves.down, _target);

    }
    deselect();
}

//create new lane
function newLane() {
    console.log("new lane");
    const div = document.createElement("div");
    div.id = "NEW_LANE_"+_newDivamount.toString();
    div.title = "NEW_LANE_"+_newDivamount.toString();
    div.classList = "mustardcol col lane s1 rowlette";
    div.innerHTML = "<h9 id=\"title\">NEW LANE</h9>"
    document.getElementById("content-stuff").appendChild(div);
    div.addEventListener("pointerdown", () => {
        select(div.id);
    });
    div.addEventListener("pointerup", () => {
        resetPointer();
    });
    _newDivamount++
}

//new ticket
function newTicket() {
    console.log("new ticket");
    const div = document.createElement("div");
    div.id = "NEW_TICKET_"+_newTicketAmount.toString();
    div.title = "NEW_LANE_"+_newTicketAmount.toString();
    div.classList = "ticlette white lighten-2";
    div.innerHTML = "<h9 id=\"title\"><b>NEW Ticket</b></h9><br><p id=\"content\">$PLACEHOLDERTEXT</p>"
    _target.appendChild(div);
    div.addEventListener("pointerdown", () => {
        console.log("BWEEN");
        select(div.id);
    });
    div.addEventListener("pointerup", () => {
        resetPointer();
    });
    _newTicketAmount++
}

//change content of ticket
function invokeContent() {
    console.log("INVOKE CONTENT");
    let dbTarget = undefined;
    for (let i = 0; i < _ticketList.length; i++) {
        if (_ticketList[i]._id == _target.id) {
            dbTarget = _ticketList[i];
            break;
        }
    }
    for (let i = 0; i < _target.children.length; i++) {
        if (_target.children[i].id == "content") {
            _target.children[i].innerHTML = document.getElementById("toolContent").value;
            break;
        }
    }
    if (typeof dbTarget !== "undefined") {
        //_target.children.getElementById = document.getElementById("toolTitle").value;
        dbTarget.text = document.getElementById("toolContent").value;
    }
}

//change title
function invokeTitle() {
    let isticket = false;
    if (_target.id.indexOf("_")>-1) {
        isticket = _target.id.split("_")[1] == "TICKET";
    }
    else {
        for (let i = 0; i < _ticketList.length; i++) {
            if (_ticketList[i]._id == _target.id) {
                console.log("THIS IS TICKET");
                isticket = true;
                dbTarget = _ticketList[i];
                break;
            }
        }
    }
    console.log("isticket", isticket);
    for (let i = 0; i < _target.children.length; i++) {
        if (_target.children[i].id == "title") {
            if (isticket) {
                _target.children[i].innerHTML = `<b>${document.getElementById("toolTitle").value}</b>`;
            }
            else {
                _target.children[i].innerHTML = `${document.getElementById("toolTitle").value}`;
            }
            break;
        }
    }
    if (typeof _dbTarget !== "undefined") {
        //_target.children.getElementById = document.getElementById("toolTitle").value;
        _dbTarget.title = document.getElementById("toolTitle").value;
    }
    console.log(_dbTarget, _target);
}

//hide ticket tools form tool menu
function hideTicketTools() {
    if (document.getElementById("generalTools").classList.contains("hide")) {
        document.getElementById("generalTools").classList.remove("hide");
    }
    if (!document.getElementById("moveTools").classList.contains("hide")) {
        document.getElementById("moveTools").classList.add("hide");
    }
    const ticketStuff = [
        document.getElementById("toolContent"),
        document.getElementById("contentBtn"),
        document.getElementById("contentLabel"),
        document.getElementById("colorBox"),
        document.getElementById("delete")
    ];
    for (let i = 0; i < ticketStuff.length; i++) {
        if (!ticketStuff[i].classList.contains("hide")) {
            ticketStuff[i].classList.add("hide");
        }
    }
}

//show them
function showTicketTools() {
    if (!document.getElementById("generalTools").classList.contains("hide")) {
        document.getElementById("generalTools").classList.add("hide");
    }
    if (document.getElementById("moveTools").classList.contains("hide")) {
        document.getElementById("moveTools").classList.remove("hide");
    }
    const ticketStuff = [
        document.getElementById("toolContent"),
        document.getElementById("contentBtn"),
        document.getElementById("contentLabel"),
        document.getElementById("colorBox"),
        document.getElementById("delete")
    ];
    for (let i = 0; i < ticketStuff.length; i++) {
        if (ticketStuff[i].classList.contains("hide")) {
            ticketStuff[i].classList.remove("hide");
        }
    }
}

//prevents clickthrough of elements
function resetPointer() {
    console.log("POINTUP");
    _pointerdown = false;
}

//hides tool div
function deselect() {
    console.log("CALENCSD");
    _target = undefined;
    _toolbox.classList.add("hide");
    hideTicketTools();
    if (!document.getElementById("newTicket").classList.contains("hide")) {
        document.getElementById("newTicket").classList.add("hide");
    }
    if (document.getElementById("generalTools").classList.contains("hide")) {
        document.getElementById("generalTools").classList.remove("hide");
    }
    document.getElementById("toolTitle").value = "";
    document.getElementById("toolContent").value = "";
}

function deleteItem() {
    console.log("BEGONE", _target,_target.children, _dbTarget);
    for (let i = 0; i < _target.children.length; i) {
        _target.children[i].remove();
    }
    console.log(_target.children);
    /*_target.children.forEach(child => {
        child.remove();
    });*/
    _target.remove();
    deselect();

}

//bundle the info of the whole board and send it to server for saving
function save() {
    console.log("THIS WILL HURT");
    console.log(_boardID);
    const dataBlob = {
        boardId: _boardID,
        lanes: []
    };
    const content = document.getElementById("content-stuff");
    console.log(content.children);
    for (let i = 0; i < content.children.length; i++) {
        console.log(content.children[i].id, content.children[i].children);
        const laneBlob = {
            id: content.children[i].id,
            title: "",
            tickets: []
        };
        const laneChilds = content.children[i].children;
        for (let j = 0; j < laneChilds.length; j++) {
            const child = laneChilds[j];
            if (child.id == "title") {
                laneBlob.title = child.innerHTML;
            }
            else {
                const ticketBlob = {
                    id: child.id,
                    title: "",
                    content: "",
                    color: ""
                }
                console.log(child.classList);
                for (let f = 0; f < child.classList.length; f++) {

                    if (child.classList[f] == "white" ||
                        child.classList[f] == "green" ||
                        child.classList[f] == "yellow" ||
                        child.classList[f] == "red"
                    ) {
                        ticketBlob.color = child.classList[f];
                    }
                }
                for (let h = 0; h < child.children.length; h++) {
                    const grandChild = child.children[h];
                    if (grandChild.id == "title") {
                        ticketBlob.title = grandChild.innerHTML.split(">")[1].split("<")[0];
                    }
                    else if (grandChild.id == "content") {
                        ticketBlob.content = grandChild.innerHTML;
                    }
                }
                laneBlob.tickets.push(ticketBlob);
            }
        }
        dataBlob.lanes.push(laneBlob);
    }
    console.log(dataBlob, JSON.stringify(dataBlob));
    fetch(`./${_boardID}/save`, {
        method: "POST",
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify(dataBlob)
    }).then((response) => response.json())
    .then(body => {
        if (body.redirect) {
            window.location.href = body.redirect;
        }
    });
}