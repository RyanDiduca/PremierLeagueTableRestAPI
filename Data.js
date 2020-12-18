var baseUrl = "https://api.football-data.org/v2/";
async function getData(url) {
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors', 
        headers: {
            // NOTE: The program will not work without the API Key added in the following variable
        'X-Auth-Token': '',
        },
    });
    return response.json(); 
}

async function findStandingsByCompetition(id) {
	var resource = 'competitions/' + id + '/standings';
    return getData(baseUrl + resource);
}

async function findTeamLastMatch(teamId) {
    var resource = 'teams/' + teamId + '/matches/?status=FINISHED&limit=1';
    return getData(baseUrl + resource);
}

async function findTeamNextMatch(teamId) {
    var resource = 'teams/' + teamId + '/matches/?status=SCHEDULED&limit=1';
    return getData(baseUrl + resource);
}

async function findTeamById(id) {
    var resource = 'teams/' + id;
    return getData(baseUrl + resource);
}  

var modal = document.getElementById("modalPopout");
var modalContent = document.getElementById("modalContent");

window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      modalContent.innerHTML = '';
    }
}

function populateModal(teamData) {
    const img = document.createElement("img");
    const table = document.createElement("table");
    const matchTable = document.createElement("table");
    img.className = "modalImg";
    table.className = "modalTable";
    matchTable.className = "modalTable";

    var tr1 = table.insertRow(0);
    var tr2 = table.insertRow(1);
    var tr3 = table.insertRow(2);
    var tr4 = table.insertRow(3);
    matchTable.insertRow(0).insertCell(0).outerHTML = "<th colspan='3'>Latest Result</th>";
    var mtr2 = matchTable.insertRow(1);
    matchTable.insertRow(2).insertCell(0).outerHTML = "<th colspan='3'>Next Game</th>";
    var mtr4 = matchTable.insertRow(3);

    tr1.insertCell(0).outerHTML = "<th>Name</th>";
    tr1.insertCell(1).outerHTML = "<th>Venue</th>";
    tr2.insertCell(0).innerHTML = teamData.name;
    tr2.insertCell(1).innerHTML = teamData.venue;
    tr3.insertCell(0).outerHTML = "<th>Founded</th>";
    tr3.insertCell(1).outerHTML = "<th>Club Colours</th>";
    tr4.insertCell(0).innerHTML = teamData.founded;
    tr4.insertCell(1).innerHTML = teamData.clubColors;

    findTeamLastMatch(teamData.id).then(data => {
        mtr2.insertCell(0).innerHTML = data.matches[0].homeTeam.name;
        mtr2.insertCell(1).innerHTML = data.matches[0].score.fullTime.homeTeam + " - " + data.matches[0].score.fullTime.awayTeam;
        mtr2.insertCell(2).innerHTML = data.matches[0].awayTeam.name;
    });

    findTeamNextMatch(teamData.id).then(data => {
        mtr4.insertCell(0).innerHTML = data.matches[0].homeTeam.name;
        mtr4.insertCell(1).innerHTML = "-";
        mtr4.insertCell(2).innerHTML = data.matches[0].awayTeam.name;
    });

    img.src = teamData.crestUrl;

    modalContent.appendChild(img);
    modalContent.appendChild(table);
    modalContent.appendChild(matchTable);
}

function openTeamModal(name, id) {
    var heading = document.createElement("h1");
    document.getElementById("overlay").display = "block";
    findTeamById(id).then(data => {
        heading.innerHTML = name;
        modalContent.appendChild(heading);
        populateModal(data);
        modal.style.display = "block";
        });
}

function createFootyTableData(newRow)
{
    return function innerTableData(value, link = false, extraData = {}) {
        const td = document.createElement("td");
        if(link) {
            const ref = document.createElement("a");
            ref.innerHTML = value;
            ref.onclick = () => openTeamModal(value, extraData.teamId);
            td.appendChild(ref);
        }
        else {
            td.innerHTML = value;
        }
        newRow.appendChild(td)
    }
}

function createTable(item) {
    var leaguetable = document.getElementById("league");
    item.standings[0].table.forEach(s => {
        var newRow = document.createElement("tr");
        const addToNewRow = createFootyTableData(newRow);
        addToNewRow(s.position);
        addToNewRow(s.team.name, true, {teamId: s.team.id});
        addToNewRow(s.playedGames);
        addToNewRow(s.won);
        addToNewRow(s.draw);
        addToNewRow(s.lost);
        addToNewRow(s.goalsFor);
        addToNewRow(s.goalsAgainst);
        addToNewRow(s.goalDifference);
        addToNewRow(s.points);
        leaguetable.appendChild(newRow);
    });
}

findStandingsByCompetition(2021).then(data => {
    createTable(data);
});
