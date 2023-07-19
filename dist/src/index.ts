import {QInputDialog, QCheckBox, QStackedWidget, QFileDialog, FileMode, QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QIcon, QTreeWidget, QWidgetSignals, FlexLayoutSignals, QTreeWidgetItem, QDialog, QLineEdit, QAbstractButton, QMenu, QMenuBar, QComboBox, QPalette, QColor, QBrush, QTextEdit, QMimeData, QSlider, QPicture, QPainter, QImage, QPaintEvent, QRect, QRectF, QKeyEvent, QMouseEvent, QPixmap, WidgetEventTypes, GlobalColor, QRadioButton, QScrollArea, QTabWidget, QMessageBox, ButtonRole, QFontDatabase, QCursor, QShortcut, QKeySequence, QClipboard, QApplication,} from '@nodegui/nodegui';
import {gameRunner, randInt} from '../src/scripts/main.js'
import xlsx from 'node-xlsx';
import {gameTextSplitter, powerScore,teamToObject, updateStats, statsToObject, nameExp, playerToObject, individualStats, careerStats, updateTeamStats, getTeamStats} from '../src/scripts/stats.js'
import fs from 'fs';
import {runOffseason} from "../src/scripts/offseason.js";
import { QEvent } from '@nodegui/nodegui/dist/lib/QtGui/QEvent/QEvent';
import { nameGenerator, playerOverall, potGen, speedGen, statGen } from '../src/scripts/playernames.js';
import { clearInterval } from 'timers';
import basesloaded from "../src/assets/basesloaded.bmp";
import field from '../src/assets/field.bmp';
import manonfirst from '../src/assets/manonfirst.bmp';
import manonfirstandsecond from '../src/assets/manonfirstandsecond.bmp';
import manonfirstandthird from '../src/assets/manonfirstandthird.bmp';
import manonsecond from '../src/assets/manonsecond.bmp';
import manonsecondandthird from '../src/assets/manonsecondandthird.bmp';
import manonthird from '../src/assets/manonthird.bmp';
import pause from '../src/assets/pause.bmp';
import play from '../src/assets/play.bmp';
import nextpbp from '../src/assets/next.bmp'


try {
let stackedIndexes: any[] = [0];
let goneback = false;
let seas = fs.readFileSync('./dist/src/tracker/tracker.txt', 'utf8');
let season = Number(seas);
let statchoice = 0;
let teams = fs.readdirSync(`./dist/src/teams`);
let teamcount = 0;
let teamviewinfo: any[] = [];
let individual: String = "";
let players: string[] = fs.readdirSync(`./dist/src/players/active`);
let playercount = 0;
let teamobjects: any[] = [];
let dropMenuItems: any[] = [];
for (let hi=0;hi<teams.length;hi++) {
  let data = fs.readFileSync(`./dist/src/teams/${teams[hi]}`, "utf8");
  let team: any = {name: "", roster: []};
  let thisteam: any = teamToObject(nameExp.exec(data)![1]);
  team.name = thisteam.name!;
  let ros1: any = thisteam.roster[0].name;
  let ros2: any = thisteam.roster[1].name;
  let ros3: any = thisteam.roster[2].name;
  let ros4: any = thisteam.roster[3].name;
  let ros5: any = thisteam.roster[4].name;
  let ros6: any = thisteam.roster[5].name;
  team.roster = [ros1, ros2, ros3, ros4, ros5, ros6];
  teamobjects.push(team);
}

const backButton = new QPushButton();

backButton.setObjectName('backButton');
backButton.setText("Back");
backButton.addEventListener("released", () => {
  
  goneback = true;
  stackedIndexes = stackedIndexes.slice(0,(stackedIndexes.length-1));
  stacked.setCurrentIndex(Number(stackedIndexes[stackedIndexes.length-1]));
  stacked.repaint();
})

const offenseheaders: string[] = ["Name", "Age", "Years Pro", "Team", "Points Scored", "Assists", "Assist Points", "Broken Tackles", "Balls Fielded (OFF)", "Blocks", "Turnovers"];
const defenseheaders: string[] = ["Name", "Age", "Years Pro", "Team", "Tackles", "Blocks Shed", "Interceptions", "Balls Fielded (DEF)", "Total Outs Recorded"];
const battingheaders: string[] = ["Name", "Age", "Years Pro", "Team", "At-Bats", "Hits", "Slams", "Hits to Out", "Hits to Offense", "Strikeouts", "Foulouts"];
const pitchingheaders: string[] = ["Name", "Age", "Years Pro", "Team", "Pitches", "Strikes", "Balls", "Fouls", "Strikeouts", "Ballouts", "Slams Given"];
const ratingheaders: string[] = ["Name", "Overall", "Years Pro", "Power", "Speed", "Eye", "Tackle", "Break Tackle", "Block", "Break Block", "Awareness", "Potential", "Age"];

function buildSchedule (teams: any[]) {
  let raw = teams;
  let finarray = [];
  let matchup = [];
  let count = 0;
  for (let i=0;i<raw.length;i++) {
      if (raw[i].length > 0) {
          matchup.push(raw[i][0]);
          count++;
      }
      if (count === 2) {
          finarray.push(matchup);
          count = 0;
          matchup = [];
      }
  } return finarray;
}

const win = new QMainWindow();
win.setWindowTitle("Tackle Baseball");

const stacked = new QStackedWidget();
stacked.setObjectName("stacked");
stacked.addEventListener("currentChanged", () => {
  if (goneback == false) {
  stackedIndexes.push(stacked.currentIndex());
  } else {
    goneback = false;
  }
  if (stacked.currentIndex() === 0) {
    backButton.hide();
  } else {
    backButton.show();
  }
  if (stacked.currentIndex() === 8) {
if (    dropMenu !== null) {
      dropMenu.clear();
};
  if (playerfirstnamelabel.text().length > 0) {
    let data = fs.readFileSync(`./dist/src/players/active/${playerfirstnamelabel.text()}.txt`, 'utf8');
    let seasonEx = new RegExp(/\d\d\d\d/g);
    let seasons = data.match(seasonEx);
    let itemsupdate: any[] = [];
    dropMenu.addItem(undefined, `Season ${season}`);
    dropMenu.addItem(undefined, "Career");
    for (let i=0;i<seasons!.length;i++) {
      if (seasons![i] !== season.toString() && dropMenuItems.includes(`Season ${seasons![i]}`) == false) {
      dropMenu.addItem(undefined, `Season ${seasons![i]}`);
      itemsupdate.push(`Season ${seasons![i]}`);
      }
    }
    dropMenuItems = itemsupdate;
  }
}
})

stacked.setInlineStyle("width: 900px");

//STATS WIDGET AND BUTTONS::
let stats = new QTreeWidget();
stats.setSortingEnabled(true);
stats.setObjectName("stats");
stats.addEventListener("itemDoubleClicked", (item) => {
  individual = `${item?.text(0)}.txt`;
  playercount = players.indexOf(`${item?.text(0)}.txt`);
if (  dropMenu !== null) {
    dropMenu.clear();
};
  let data = fs.readFileSync(`./dist/src/players/active/${players[playercount]}`, 'utf8');
  let seasonEx = new RegExp(/\d\d\d\d/g);
  let seasons = data.match(seasonEx);
  let name = nameExp.exec(data)![1];
  let numX = new RegExp(/\d+/);
  if (numX.exec(players[playercount]) !== null) {
    name = name + ` ${numX.exec(players[playercount])![0]}`;
    console.log(name);
  }
  let player = playerToObject(name);
  let firstname = player.name!;
  let itemsupdate: any[] = [];
  playerfirstnamelabel.setText(firstname);
  dropMenu.addItem(undefined, `Season ${season}`);
  dropMenu.addItem(undefined, "Career");
    for (let i=0;i<seasons!.length;i++) {
      if (seasons![i] !== season.toString() && dropMenuItems.includes(`Season ${seasons![i]}`) == false) {
      dropMenu.addItem(undefined, `Season ${seasons![i]}`);
      itemsupdate.push(`Season ${seasons![i]}`);
      }
    }
    dropMenuItems = itemsupdate;
  let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
  let thesestats = individualStats(name, season);
  let years = data.match(/Season/g);
  let pro = years?.length;
  let vetdata: any = 0;
  if (pro === 1) {
    vetdata = "Rookie";
  } else {
    vetdata = pro!-1;
  }
  overallrating.setText(`${overall}`);
  yearsprorating.setText(`${vetdata}`);
  powerrating.setText(`${player.power}`);
  speedrating.setText(`${player.speed}`);
  eyerating.setText(`${player.eye}`);
  tacklerating.setText(`${player.tackle}`);
  breaktacklerating.setText(`${player.breaktackle}`);
  blockrating.setText(`${player.block}`);
  breakblockrating.setText(`${player.breakblock}`);
  awarenessrating.setText(`${player.awareness}`);
  agerating.setText(`${player.age}`);
  potentialrating.setText(`${player.potential}`);
  playerfirstnamelabel.setText(firstname);
  pointsStat.setText(thesestats.pointsScored);
  assistsStat.setText(thesestats.assists);
  assistpointsStat.setText(thesestats.assistpoints);
  brokentacklesStat.setText(thesestats.brokentackles);
  ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
  blocksStat.setText(thesestats.blocks);
  turnoversStat.setText(thesestats.turnovers);
  pitchesStat.setText(thesestats.pitches);
  strikesStat.setText(thesestats.strikes);
  ballsStat.setText(thesestats.balls);
  foulsStat.setText(thesestats.fouls);
  strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
  balloutsStat.setText(thesestats.ballouts);
  slamsgivenStat.setText(thesestats.slamsgiven);
  atbatsStat.setText(thesestats.atbats);
  hitsStat.setText(thesestats.hits);
  slamsStat.setText(thesestats.slams);
  hitstooutStat.setText(thesestats.hitstoout);
  hitstooffenseStat.setText(thesestats.hitstooffense);
  fouloutsStat.setText(thesestats.foulouts);
  strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
  tacklesStat.setText(thesestats.tackles);
  blocksshedStat.setText(thesestats.blocksshed);
  interceptionsStat.setText(thesestats.interceptions);
  ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
  totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
  for (let z=0;z<teamobjects.length;z++) {
    if (teamobjects[z].roster.includes(player.name!)) {
      playerteambutton.setText(teamobjects[z].name);
    }
  }
  stacked.setCurrentWidget(playerview);
});

let teamview = new QWidget();
teamview.setObjectName("teamview");
const teamLayout = new FlexLayout();
teamview.setLayout(teamLayout);

let playerview = new QWidget();
playerview.setObjectName("playerview");
const playerviewLayout = new FlexLayout();
playerview.setLayout(playerviewLayout);


let playeroverall = new QLabel();
playeroverall.setText("OVERALL");
playeroverall.setObjectName("playeroverall");
let overallrating = new QLabel();
overallrating.setObjectName("overallrating");

const overallTile = new QWidget();
overallTile.setObjectName("overalltile");
const overallTileLayout = new FlexLayout();
overallTile.setLayout(overallTileLayout);

overallTileLayout.addWidget(playeroverall);
overallTileLayout.addWidget(overallrating);

let playerfirstnamelabel = new QLabel();
playerfirstnamelabel.setObjectName("playerfirstnamelabel");
let playerteambutton = new QPushButton();
playerteambutton.setObjectName("playerteambutton")
playerteambutton.addEventListener("released", () => {
  
  let data = fs.readFileSync(`./dist/src/teams/${playerteambutton.text()}.txt`, 'utf8');
  let thisteamname = nameExp.exec(data)![1];
  teamnamelabel.setText(thisteamname);
  let thisteam = teamToObject(thisteamname);
  let roster: any[] = thisteam.roster;
  let teamrating = 0;
  for (let v=0;v<6;v++) {
    const item = teamroster.takeTopLevelItem(0);
  }
  for (let k=0;k<roster.length;k++) {
    let overall = Math.round((roster[k].power + roster[k].speed + roster[k].eye + roster[k].tackle + roster[k].breaktackle + roster[k].block + roster[k].breakblock + roster[k].awareness) / 8);
    teamrating = teamrating + overall;
    let item = new QTreeWidgetItem();
    let player = fs.readFileSync(`./dist/src/players/active/${roster[k].name}.txt`, 'utf8');
    let years = player.match(/Season/g);
    let pro = years?.length;
    let vetdata: any = 0;
    if (pro === 1) {
      vetdata = "Rookie";
    } else {
      vetdata = pro!-1;
    }
    item.setText(0, roster[k].name);
    item.setData(1, 0, overall);
    item.setData(2, 0, vetdata);
    item.setData(3, 0, roster[k].power);
    item.setData(4, 0, roster[k].speed);
    item.setData(5, 0, roster[k].eye);
    item.setData(6, 0, roster[k].tackle);
    item.setData(7, 0, roster[k].breaktackle);
    item.setData(8, 0, roster[k].block);
    item.setData(9, 0, roster[k].breakblock);
    item.setData(10, 0, roster[k].awareness);
    item.setText(11, roster[k].potential);
    item.setData(12, 0, roster[k].age);
    teamroster.addTopLevelItem(item);
  }
  teamrating = Math.round(teamrating/6);
  teamoverall.setText(`overall: ${teamrating}`);
  stacked.setCurrentWidget(teamview);
})

const nameOverpl = new QWidget();
nameOverpl.setObjectName("nameOverpl");
const nameOverplLayout = new FlexLayout();
nameOverpl.setLayout(nameOverplLayout);

nameOverplLayout.addWidget(playerfirstnamelabel);
nameOverplLayout.addWidget(playerteambutton);

const nextplayerButton = new QPushButton();

nextplayerButton.setObjectName("nextbutton");
nextplayerButton.setText(">");
nextplayerButton.addEventListener("released", () => {
  
if (  dropMenu !== null) {
    dropMenu.clear();
};
  playercount++;
  if (playercount > players.length-1) {
    playercount = 0;
  }
  let data = fs.readFileSync(`./dist/src/players/active/${players[playercount]}`, 'utf8');
  let seasonEx = new RegExp(/\d\d\d\d/g);
  let seasons = data.match(seasonEx);
  let numReg = new RegExp(/\d\d\d\d/);
  let name = nameExp.exec(data)![1];
  let numX = new RegExp(/\d+/);
  if (numX.exec(players[playercount]) !== null) {
    name = name + ` ${numX.exec(players[playercount])![0]}`;
  }
  let player = playerToObject(name);
  dropPlayer = player;
  let firstname = player.name!;
  let itemsupdate: any[] = [];
  playerfirstnamelabel.setText(firstname);
  dropMenu.addItem(undefined, "Season 2023");
  dropMenu.addItem(undefined, "Career");
    for (let i=0;i<seasons!.length;i++) {
      if (seasons![i] !== season.toString() && dropMenuItems.includes(`Season ${seasons![i]}`) == false) {
      dropMenu.addItem(undefined, `Season ${seasons![i]}`);
      itemsupdate.push(`Season ${seasons![i]}`);
      }
    }
    dropMenuItems = itemsupdate;
  let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
  let thesestats = individualStats(name, season);
  let years = data.match(/Season/g);
  let pro = years?.length;
  let vetdata: any = 0;
  if (pro === 1) {
    vetdata = "Rookie";
  } else {
    vetdata = pro!-1;
  }
  overallrating.setText(`${overall}`);
  yearsprorating.setText(`${vetdata}`);
  powerrating.setText(`${player.power}`);
  speedrating.setText(`${player.speed}`);
  eyerating.setText(`${player.eye}`);
  tacklerating.setText(`${player.tackle}`);
  breaktacklerating.setText(`${player.breaktackle}`);
  blockrating.setText(`${player.block}`);
  breakblockrating.setText(`${player.breakblock}`);
  awarenessrating.setText(`${player.awareness}`);
  agerating.setText(`${player.age}`);
  potentialrating.setText(`${player.potential}`);
  
  pointsStat.setText(thesestats.pointsScored);
  assistsStat.setText(thesestats.assists);
  assistpointsStat.setText(thesestats.assistpoints);
  brokentacklesStat.setText(thesestats.brokentackles);
  ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
  blocksStat.setText(thesestats.blocks);
  turnoversStat.setText(thesestats.turnovers);
  pitchesStat.setText(thesestats.pitches);
  strikesStat.setText(thesestats.strikes);
  ballsStat.setText(thesestats.balls);
  foulsStat.setText(thesestats.fouls);
  strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
  balloutsStat.setText(thesestats.ballouts);
  slamsgivenStat.setText(thesestats.slamsgiven);
  atbatsStat.setText(thesestats.atbats);
  hitsStat.setText(thesestats.hits);
  slamsStat.setText(thesestats.slams);
  hitstooutStat.setText(thesestats.hitstoout);
  hitstooffenseStat.setText(thesestats.hitstooffense);
  fouloutsStat.setText(thesestats.foulouts);
  strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
  tacklesStat.setText(thesestats.tackles);
  blocksshedStat.setText(thesestats.blocksshed);
  interceptionsStat.setText(thesestats.interceptions);
  ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
  totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
  for (let z=0;z<teamobjects.length;z++) {
    if (teamobjects[z].roster.includes(player.name!)) {
      playerteambutton.setText(teamobjects[z].name);
    }
  }
  stacked.setCurrentWidget(playerview);
})
nextplayerButton.setInlineStyle("color: #4169e1");

const previousplayerButton = new QPushButton();

previousplayerButton.setObjectName("previousbutton");
previousplayerButton.setText("<");
previousplayerButton.addEventListener("released", () => {
  
if (  dropMenu !== null) {
    dropMenu.clear();
};
  playercount--;
  if (playercount < 0) {
    playercount = players.length-1;
  }
  let data = fs.readFileSync(`./dist/src/players/active/${players[playercount]}`, 'utf8');
  let seasonEx = new RegExp(/\d\d\d\d/g);
  let seasons = data.match(seasonEx);
  let numReg = new RegExp(/\d\d\d\d/);
  let name = nameExp.exec(data)![1];
  let numX = new RegExp(/\d+/);
  if (numX.exec(players[playercount]) !== null) {
    name = name + ` ${numX.exec(players[playercount])![0]}`;
    console.log(name);
  }
  let player = playerToObject(name);
  dropPlayer = player;
  let firstname = player.name!;
  let itemsupdate: any[] = [];
  playerfirstnamelabel.setText(firstname);
  dropMenu.addItem(undefined, "Season 2023");
  dropMenu.addItem(undefined, "Career");
    for (let i=0;i<seasons!.length;i++) {
      if (seasons![i] !== season.toString() && dropMenuItems.includes(`Season ${seasons![i]}`) == false) {
      dropMenu.addItem(undefined, `Season ${seasons![i]}`);
      itemsupdate.push(`Season ${seasons![i]}`);
      }
    }
    dropMenuItems = itemsupdate;
  let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
  let thesestats = individualStats(name, season);
  let years = data.match(/Season/g);
  let pro = years?.length;
  let vetdata: any = 0;
  if (pro === 1) {
    vetdata = "Rookie";
  } else {
    vetdata = pro!-1;
  }
  overallrating.setText(`${overall}`);
  yearsprorating.setText(`${vetdata}`);
  powerrating.setText(`${player.power}`);
  speedrating.setText(`${player.speed}`);
  eyerating.setText(`${player.eye}`);
  tacklerating.setText(`${player.tackle}`);
  breaktacklerating.setText(`${player.breaktackle}`);
  blockrating.setText(`${player.block}`);
  breakblockrating.setText(`${player.breakblock}`);
  awarenessrating.setText(`${player.awareness}`);
  agerating.setText(`${player.age}`);
  potentialrating.setText(`${player.potential}`);
  playerfirstnamelabel.setText(firstname);
  pointsStat.setText(thesestats.pointsScored);
  assistsStat.setText(thesestats.assists);
  assistpointsStat.setText(thesestats.assistpoints);
  brokentacklesStat.setText(thesestats.brokentackles);
  ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
  blocksStat.setText(thesestats.blocks);
  turnoversStat.setText(thesestats.turnovers);
  pitchesStat.setText(thesestats.pitches);
  strikesStat.setText(thesestats.strikes);
  ballsStat.setText(thesestats.balls);
  foulsStat.setText(thesestats.fouls);
  strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
  balloutsStat.setText(thesestats.ballouts);
  slamsgivenStat.setText(thesestats.slamsgiven);
  atbatsStat.setText(thesestats.atbats);
  hitsStat.setText(thesestats.hits);
  slamsStat.setText(thesestats.slams);
  hitstooutStat.setText(thesestats.hitstoout);
  hitstooffenseStat.setText(thesestats.hitstooffense);
  fouloutsStat.setText(thesestats.foulouts);
  strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
  tacklesStat.setText(thesestats.tackles);
  blocksshedStat.setText(thesestats.blocksshed);
  interceptionsStat.setText(thesestats.interceptions);
  ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
  totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
  for (let z=0;z<teamobjects.length;z++) {
    if (teamobjects[z].roster.includes(player.name!)) {
      playerteambutton.setText(teamobjects[z].name);
    }
  }
  stacked.setCurrentWidget(playerview);
})
previousplayerButton.setInlineStyle("color: #4169e1");

const prevnextPlayer = new QWidget();
prevnextPlayer.setObjectName("prevnextPlayer");
const prevnextPlayerLayout = new FlexLayout();
prevnextPlayer.setLayout(prevnextPlayerLayout);
prevnextPlayerLayout.addWidget(previousplayerButton);
prevnextPlayerLayout.addWidget(nextplayerButton);

const playersearch = new QLineEdit();
playersearch.addEventListener("returnPressed", () => {
  playercount = players.indexOf(`${playersearch.text()}.txt`);
  if (playercount == -1) {
    for (let bn=0;playercount==-1;bn++) {
      playercount = players.indexOf(`${playersearch.text()} ${bn}.txt`);
    }
  }
if (  dropMenu !== null) {
    dropMenu.clear();
};
  let data = fs.readFileSync(`./dist/src/players/active/${players[playercount]}`, 'utf8');
  let seasonEx = new RegExp(/\d\d\d\d/g);
  let seasons = data.match(seasonEx);
  let numReg = new RegExp(/\d\d\d\d/);
  let name = nameExp.exec(data)![1];
  let numX = new RegExp(/\d+/);
  if (numX.exec(players[playercount]) !== null) {
    name = name + ` ${numX.exec(players[playercount])![0]}`;
  }
  let player = playerToObject(name);
  dropPlayer = player;
  let firstname = player.name!;
  let itemsupdate: any[] = [];
  playerfirstnamelabel.setText(firstname);
  dropMenu.addItem(undefined, "Season 2023");
  dropMenu.addItem(undefined, "Career");
    for (let i=0;i<seasons!.length;i++) {
      if (seasons![i] !== season.toString() && dropMenuItems.includes(`Season ${seasons![i]}`) == false) {
      dropMenu.addItem(undefined, `Season ${seasons![i]}`);
      itemsupdate.push(`Season ${seasons![i]}`);
      }
    }
    dropMenuItems = itemsupdate;
  let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
  let thesestats = individualStats(name, season);
  let years = data.match(/Season/g);
  let pro = years?.length;
  let vetdata: any = 0;
  if (pro === 1) {
    vetdata = "Rookie";
  } else {
    vetdata = pro!-1;
  }
  overallrating.setText(`${overall}`);
  yearsprorating.setText(`${vetdata}`);
  powerrating.setText(`${player.power}`);
  speedrating.setText(`${player.speed}`);
  eyerating.setText(`${player.eye}`);
  tacklerating.setText(`${player.tackle}`);
  breaktacklerating.setText(`${player.breaktackle}`);
  blockrating.setText(`${player.block}`);
  breakblockrating.setText(`${player.breakblock}`);
  awarenessrating.setText(`${player.awareness}`);
  agerating.setText(`${player.age}`);
  potentialrating.setText(`${player.potential}`);
  playerfirstnamelabel.setText(firstname);
  pointsStat.setText(thesestats.pointsScored);
  assistsStat.setText(thesestats.assists);
  assistpointsStat.setText(thesestats.assistpoints);
  brokentacklesStat.setText(thesestats.brokentackles);
  ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
  blocksStat.setText(thesestats.blocks);
  turnoversStat.setText(thesestats.turnovers);
  pitchesStat.setText(thesestats.pitches);
  strikesStat.setText(thesestats.strikes);
  ballsStat.setText(thesestats.balls);
  foulsStat.setText(thesestats.fouls);
  strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
  balloutsStat.setText(thesestats.ballouts);
  slamsgivenStat.setText(thesestats.slamsgiven);
  atbatsStat.setText(thesestats.atbats);
  hitsStat.setText(thesestats.hits);
  slamsStat.setText(thesestats.slams);
  hitstooutStat.setText(thesestats.hitstoout);
  hitstooffenseStat.setText(thesestats.hitstooffense);
  fouloutsStat.setText(thesestats.foulouts);
  strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
  tacklesStat.setText(thesestats.tackles);
  blocksshedStat.setText(thesestats.blocksshed);
  interceptionsStat.setText(thesestats.interceptions);
  ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
  totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
  for (let z=0;z<teamobjects.length;z++) {
    if (teamobjects[z].roster.includes(player.name!) == true) {
      playerteambutton.setText(teamobjects[z].name);
      break;
    }
  }
  stacked.setCurrentWidget(playerview);
})
playersearch.setText("Search player.")
playersearch.setInlineStyle("font-size: 10px;");

const prevnextPlayerSearch = new QWidget();
prevnextPlayerSearch.setObjectName("prevnextPlayerSearch");
const prevnextPlayerSearchLayout = new FlexLayout();
prevnextPlayerSearch.setLayout(prevnextPlayerSearchLayout);

prevnextPlayerSearchLayout.addWidget(prevnextPlayer);
prevnextPlayerSearchLayout.addWidget(playersearch);


const ratingtable = new QWidget();
ratingtable.setObjectName("ratingtable");
const ratingtableLayout = new FlexLayout();
ratingtable.setLayout(ratingtableLayout);

const statlineage = new QWidget();
statlineage.setObjectName("statline");
const statlineageLayout = new FlexLayout();
statlineage.setLayout(statlineageLayout);
const statlineyears = new QWidget();
statlineyears.setObjectName("statline");
const statlineyearsLayout = new FlexLayout();
statlineyears.setLayout(statlineyearsLayout);
const statlinepower = new QWidget();
statlinepower.setObjectName("statline");
const statlinepowerLayout = new FlexLayout();
statlinepower.setLayout(statlinepowerLayout);
const statlinespeed = new QWidget();
statlinespeed.setObjectName("statline");
const statlinespeedLayout = new FlexLayout();
statlinespeed.setLayout(statlinespeedLayout);
const statlineeye = new QWidget();
statlineeye.setObjectName("statline");
const statlineeyeLayout = new FlexLayout();
statlineeye.setLayout(statlineeyeLayout);
const statlinetackle = new QWidget();
statlinetackle.setObjectName("statline");
const statlinetackleLayout = new FlexLayout();
statlinetackle.setLayout(statlinetackleLayout);
const statlinebreaktackle = new QWidget();
statlinebreaktackle.setObjectName("statline");
const statlinebreaktackleLayout = new FlexLayout();
statlinebreaktackle.setLayout(statlinebreaktackleLayout);
const statlineblock = new QWidget();
statlineblock.setObjectName("statline");
const statlineblockLayout = new FlexLayout();
statlineblock.setLayout(statlineblockLayout);
const statlinebreakblock = new QWidget();
statlinebreakblock.setObjectName("statline");
const statlinebreakblockLayout = new FlexLayout();
statlinebreakblock.setLayout(statlinebreakblockLayout);
const statlineawareness = new QWidget();
statlineawareness.setObjectName("statline");
const statlineawarenessLayout = new FlexLayout();
statlineawareness.setLayout(statlineawarenessLayout);
const statlinepotential = new QWidget();
statlinepotential.setObjectName("statline");
const statlinepotentialLayout = new FlexLayout();
statlinepotential.setLayout(statlinepotentialLayout);


const agelabel = new QLabel();
agelabel.setObjectName("statlabel");
agelabel.setText("Age");
let agerating = new QLabel();
agerating.setObjectName("ratinglabel");
const yearsprolabel = new QLabel();
yearsprolabel.setObjectName("statlabel");
yearsprolabel.setText("Years Pro");
let yearsprorating = new QLabel();
yearsprorating.setObjectName("ratinglabel");
const powerlabel = new QLabel();
powerlabel.setObjectName("statlabel")
powerlabel.setText("Power");
let powerrating = new QLabel();
powerrating.setObjectName("ratinglabel");
const speedlabel = new QLabel();
speedlabel.setObjectName("statlabel");
speedlabel.setText("Speed");
let speedrating = new QLabel();
speedrating.setObjectName("ratinglabel");
const eyelabel = new QLabel();
eyelabel.setObjectName("statlabel");
eyelabel.setText("Eye");
let eyerating = new QLabel();
eyerating.setObjectName("ratinglabel");
const tacklelabel = new QLabel();
tacklelabel.setObjectName("statlabel");
tacklelabel.setText("Tackle");
let tacklerating = new QLabel();
tacklerating.setObjectName("ratinglabel");
const breaktacklelabel = new QLabel();
breaktacklelabel.setObjectName("statlabel");
breaktacklelabel.setText("Break Tackle");
let breaktacklerating = new QLabel();
breaktacklerating.setObjectName("ratinglabel");
const blocklabel = new QLabel();
blocklabel.setObjectName("statlabel");
blocklabel.setText("Block");
let blockrating = new QLabel();
blockrating.setObjectName("ratinglabel");
const breakblocklabel = new QLabel();
breakblocklabel.setObjectName("statlabel");
breakblocklabel.setText("Break Block");
let breakblockrating = new QLabel();
breakblockrating.setObjectName("ratinglabel");
const awarenesslabel = new QLabel();
awarenesslabel.setObjectName("statlabel");
awarenesslabel.setText("Awareness");
let awarenessrating = new QLabel();
awarenessrating.setObjectName("ratinglabel");
const potentiallabel = new QLabel();
potentiallabel.setObjectName("statlabel");
potentiallabel.setText("Potential");
let potentialrating = new QLabel();
potentialrating.setObjectName("ratinglabel");

statlineageLayout.addWidget(agelabel);
statlineageLayout.addWidget(agerating);

statlineyearsLayout.addWidget(yearsprolabel);
statlineyearsLayout.addWidget(yearsprorating);

statlinepowerLayout.addWidget(powerlabel);
statlinepowerLayout.addWidget(powerrating);

statlinespeedLayout.addWidget(speedlabel);
statlinespeedLayout.addWidget(speedrating);

statlineeyeLayout.addWidget(eyelabel);
statlineeyeLayout.addWidget(eyerating);

statlinetackleLayout.addWidget(tacklelabel);
statlinetackleLayout.addWidget(tacklerating);

statlinebreaktackleLayout.addWidget(breaktacklelabel);
statlinebreaktackleLayout.addWidget(breaktacklerating);

statlineblockLayout.addWidget(blocklabel);
statlineblockLayout.addWidget(blockrating);

statlinebreakblockLayout.addWidget(breakblocklabel);
statlinebreakblockLayout.addWidget(breakblockrating);

statlineawarenessLayout.addWidget(awarenesslabel);
statlineawarenessLayout.addWidget(awarenessrating);

statlinepotentialLayout.addWidget(potentiallabel);
statlinepotentialLayout.addWidget(potentialrating);

ratingtableLayout.addWidget(statlineage);
ratingtableLayout.addWidget(statlineyears);
ratingtableLayout.addWidget(statlinepower);
ratingtableLayout.addWidget(statlinespeed);
ratingtableLayout.addWidget(statlineeye);
ratingtableLayout.addWidget(statlinetackle);
ratingtableLayout.addWidget(statlinebreaktackle);
ratingtableLayout.addWidget(statlineblock);
ratingtableLayout.addWidget(statlinebreakblock);
ratingtableLayout.addWidget(statlineawareness);
ratingtableLayout.addWidget(statlinepotential);

const playerstats = new QWidget();
playerstats.setObjectName("playerstats");
const playerstatsLayout = new FlexLayout();
playerstats.setLayout(playerstatsLayout);

const pointsLabel = new QLabel();
pointsLabel.setObjectName("statlabel");
pointsLabel.setText("Points Scored");
let pointsStat = new QLabel();
pointsStat.setObjectName("ratinglabel");
const statlinepoints = new QWidget();
statlinepoints.setObjectName("statline");
const statlinepointsLayout = new FlexLayout();
statlinepoints.setLayout(statlinepointsLayout);
statlinepointsLayout.addWidget(pointsLabel);
statlinepointsLayout.addWidget(pointsStat);

const assistsLabel = new QLabel();
assistsLabel.setObjectName("statlabel");
assistsLabel.setText("Assists");
let assistsStat = new QLabel();
assistsStat.setObjectName("ratinglabel");
const statlineassists = new QWidget();
statlineassists.setObjectName("statline");
const statlineassistsLayout = new FlexLayout();
statlineassists.setLayout(statlineassistsLayout);
statlineassistsLayout.addWidget(assistsLabel);
statlineassistsLayout.addWidget(assistsStat);

const assistpointsLabel = new QLabel();
assistpointsLabel.setObjectName("statlabel");
assistpointsLabel.setText("Assist Points");
let assistpointsStat = new QLabel();
assistpointsStat.setObjectName("ratinglabel");
const statlineassistpoints = new QWidget();
statlineassistpoints.setObjectName("statline");
const statlineassistpointsLayout = new FlexLayout();
statlineassistpoints.setLayout(statlineassistpointsLayout);
statlineassistpointsLayout.addWidget(assistpointsLabel);
statlineassistpointsLayout.addWidget(assistpointsStat);

const brokentacklesLabel = new QLabel();
brokentacklesLabel.setObjectName("statlabel");
brokentacklesLabel.setText("Broken Tackles");
let brokentacklesStat = new QLabel();
brokentacklesStat.setObjectName("ratinglabel");
const statlinebrokentackles = new QWidget();
statlinebrokentackles.setObjectName("statline");
const statlinebrokentacklesLayout = new FlexLayout();
statlinebrokentackles.setLayout(statlinebrokentacklesLayout);
statlinebrokentacklesLayout.addWidget(brokentacklesLabel);
statlinebrokentacklesLayout.addWidget(brokentacklesStat);

const ballsfieldedoffLabel = new QLabel();
ballsfieldedoffLabel.setObjectName("statlabel");
ballsfieldedoffLabel.setText("Balls Fielded (OFF)");
let ballsfieldedoffStat = new QLabel();
ballsfieldedoffStat.setObjectName("ratinglabel");
const statlineballsfieldedoff = new QWidget();
statlineballsfieldedoff.setObjectName("statline");
const statlineballsfieldedoffLayout = new FlexLayout();
statlineballsfieldedoff.setLayout(statlineballsfieldedoffLayout);
statlineballsfieldedoffLayout.addWidget(ballsfieldedoffLabel);
statlineballsfieldedoffLayout.addWidget(ballsfieldedoffStat);

const blocksLabel = new QLabel();
blocksLabel.setObjectName("statlabel");
blocksLabel.setText("Blocks");
let blocksStat = new QLabel();
blocksStat.setObjectName("ratinglabel");
const statlineblocks = new QWidget();
statlineblocks.setObjectName("statline");
const statlineblocksLayout = new FlexLayout();
statlineblocks.setLayout(statlineblocksLayout);
statlineblocksLayout.addWidget(blocksLabel);
statlineblocksLayout.addWidget(blocksStat);

const turnoversLabel = new QLabel();
turnoversLabel.setObjectName("statlabel");
turnoversLabel.setText("Turnovers");
let turnoversStat = new QLabel();
turnoversStat.setObjectName("ratinglabel");
const statlineturnovers = new QWidget();
statlineturnovers.setObjectName("statline");
const statlineturnoversLayout = new FlexLayout();
statlineturnovers.setLayout(statlineturnoversLayout);
statlineturnoversLayout.addWidget(turnoversLabel);
statlineturnoversLayout.addWidget(turnoversStat);

const pitchesLabel = new QLabel();
pitchesLabel.setObjectName("statlabel");
pitchesLabel.setText("Pitches");
let pitchesStat = new QLabel();
pitchesStat.setObjectName("ratinglabel");
const statlinepitches = new QWidget();
statlinepitches.setObjectName("statline");
const statlinepitchesLayout = new FlexLayout();
statlinepitches.setLayout(statlinepitchesLayout);
statlinepitchesLayout.addWidget(pitchesLabel);
statlinepitchesLayout.addWidget(pitchesStat);

const strikesLabel = new QLabel();
strikesLabel.setObjectName("statlabel");
strikesLabel.setText("Strikes");
let strikesStat = new QLabel();
strikesStat.setObjectName("ratinglabel");
const statlinestrikes = new QWidget();
statlinestrikes.setObjectName("statline");
const statlinestrikesLayout = new FlexLayout();
statlinestrikes.setLayout(statlinestrikesLayout);
statlinestrikesLayout.addWidget(strikesLabel);
statlinestrikesLayout.addWidget(strikesStat);

const ballsLabel = new QLabel();
ballsLabel.setObjectName("statlabel");
ballsLabel.setText("Balls");
let ballsStat = new QLabel();
ballsStat.setObjectName("ratinglabel");
const statlineballs = new QWidget();
statlineballs.setObjectName("statline");
const statlineballsLayout = new FlexLayout();
statlineballs.setLayout(statlineballsLayout);
statlineballsLayout.addWidget(ballsLabel);
statlineballsLayout.addWidget(ballsStat);

const foulsLabel = new QLabel();
foulsLabel.setObjectName("statlabel");
foulsLabel.setText("Fouls");
let foulsStat = new QLabel();
foulsStat.setObjectName("ratinglabel");
const statlinefouls = new QWidget();
statlinefouls.setObjectName("statline");
const statlinefoulsLayout = new FlexLayout();
statlinefouls.setLayout(statlinefoulsLayout);
statlinefoulsLayout.addWidget(foulsLabel);
statlinefoulsLayout.addWidget(foulsStat);

const strikeoutspitchingLabel = new QLabel();
strikeoutspitchingLabel.setObjectName("statlabel");
strikeoutspitchingLabel.setText("Strikeouts Pitching");
let strikeoutspitchingStat = new QLabel();
strikeoutspitchingStat.setObjectName("ratinglabel");
const statlinestrikeoutspitching = new QWidget();
statlinestrikeoutspitching.setObjectName("statline");
const statlinestrikeoutspitchingLayout = new FlexLayout();
statlinestrikeoutspitching.setLayout(statlinestrikeoutspitchingLayout);
statlinestrikeoutspitchingLayout.addWidget(strikeoutspitchingLabel);
statlinestrikeoutspitchingLayout.addWidget(strikeoutspitchingStat);

const balloutsLabel = new QLabel();
balloutsLabel.setObjectName("statlabel");
balloutsLabel.setText("Ballouts");
let balloutsStat = new QLabel();
balloutsStat.setObjectName("ratinglabel");
const statlineballouts = new QWidget();
statlineballouts.setObjectName("statline");
const statlineballoutsLayout = new FlexLayout();
statlineballouts.setLayout(statlineballoutsLayout);
statlineballoutsLayout.addWidget(balloutsLabel);
statlineballoutsLayout.addWidget(balloutsStat);

const slamsgivenLabel = new QLabel();
slamsgivenLabel.setObjectName("statlabel");
slamsgivenLabel.setText("Slams Given");
let slamsgivenStat = new QLabel();
slamsgivenStat.setObjectName("ratinglabel");
const statlineslamsgiven = new QWidget();
statlineslamsgiven.setObjectName("statline");
const statlineslamsgivenLayout = new FlexLayout();
statlineslamsgiven.setLayout(statlineslamsgivenLayout);
statlineslamsgivenLayout.addWidget(slamsgivenLabel);
statlineslamsgivenLayout.addWidget(slamsgivenStat);

const atbatsLabel = new QLabel();
atbatsLabel.setObjectName("statlabel");
atbatsLabel.setText("At-Bats");
let atbatsStat = new QLabel();
atbatsStat.setObjectName("ratinglabel");
const statlineatbats = new QWidget();
statlineatbats.setObjectName("statline");
const statlineatbatsLayout = new FlexLayout();
statlineatbats.setLayout(statlineatbatsLayout);
statlineatbatsLayout.addWidget(atbatsLabel);
statlineatbatsLayout.addWidget(atbatsStat);

const hitsLabel = new QLabel();
hitsLabel.setObjectName("statlabel");
hitsLabel.setText("Hits");
let hitsStat = new QLabel();
hitsStat.setObjectName("ratinglabel");
const statlinehits = new QWidget();
statlinehits.setObjectName("statline");
const statlinehitsLayout = new FlexLayout();
statlinehits.setLayout(statlinehitsLayout);
statlinehitsLayout.addWidget(hitsLabel);
statlinehitsLayout.addWidget(hitsStat);

const slamsLabel = new QLabel();
slamsLabel.setObjectName("statlabel");
slamsLabel.setText("Slams");
let slamsStat = new QLabel();
slamsStat.setObjectName("ratinglabel");
const statlineslams = new QWidget();
statlineslams.setObjectName("statline");
const statlineslamsLayout = new FlexLayout();
statlineslams.setLayout(statlineslamsLayout);
statlineslamsLayout.addWidget(slamsLabel);
statlineslamsLayout.addWidget(slamsStat);

const hitstooutLabel = new QLabel();
hitstooutLabel.setObjectName("statlabel");
hitstooutLabel.setText("Hits to Out");
let hitstooutStat = new QLabel();
hitstooutStat.setObjectName("ratinglabel");
const statlinehitstoout = new QWidget();
statlinehitstoout.setObjectName("statline");
const statlinehitstooutLayout = new FlexLayout();
statlinehitstoout.setLayout(statlinehitstooutLayout);
statlinehitstooutLayout.addWidget(hitstooutLabel);
statlinehitstooutLayout.addWidget(hitstooutStat);

const hitstooffenseLabel = new QLabel();
hitstooffenseLabel.setObjectName("statlabel");
hitstooffenseLabel.setText("Hits to Offense");
let hitstooffenseStat = new QLabel();
hitstooffenseStat.setObjectName("ratinglabel");
const statlinehitstooffense = new QWidget();
statlinehitstooffense.setObjectName("statline");
const statlinehitstooffenseLayout = new FlexLayout();
statlinehitstooffense.setLayout(statlinehitstooffenseLayout);
statlinehitstooffenseLayout.addWidget(hitstooffenseLabel);
statlinehitstooffenseLayout.addWidget(hitstooffenseStat);

const fouloutsLabel = new QLabel();
fouloutsLabel.setObjectName("statlabel");
fouloutsLabel.setText("Foulouts");
let fouloutsStat = new QLabel();
fouloutsStat.setObjectName("ratinglabel");
const statlinefoulouts = new QWidget();
statlinefoulouts.setObjectName("statline");
const statlinefouloutsLayout = new FlexLayout();
statlinefoulouts.setLayout(statlinefouloutsLayout);
statlinefouloutsLayout.addWidget(fouloutsLabel);
statlinefouloutsLayout.addWidget(fouloutsStat);

const strikeoutsbattingLabel = new QLabel();
strikeoutsbattingLabel.setObjectName("statlabel");
strikeoutsbattingLabel.setText("Strikeouts Batting");
let strikeoutsbattingStat = new QLabel();
strikeoutsbattingStat.setObjectName("ratinglabel");
const statlinestrikeoutsbatting = new QWidget();
statlinestrikeoutsbatting.setObjectName("statline");
const statlinestrikeoutsbattingLayout = new FlexLayout();
statlinestrikeoutsbatting.setLayout(statlinestrikeoutsbattingLayout);
statlinestrikeoutsbattingLayout.addWidget(strikeoutsbattingLabel);
statlinestrikeoutsbattingLayout.addWidget(strikeoutsbattingStat);

const tacklesLabel = new QLabel();
tacklesLabel.setObjectName("statlabel");
tacklesLabel.setText("Tackles");
let tacklesStat = new QLabel();
tacklesStat.setObjectName("ratinglabel");
const statlinetackles = new QWidget();
statlinetackles.setObjectName("statline");
const statlinetacklesLayout = new FlexLayout();
statlinetackles.setLayout(statlinetacklesLayout);
statlinetacklesLayout.addWidget(tacklesLabel);
statlinetacklesLayout.addWidget(tacklesStat);

const blocksshedLabel = new QLabel();
blocksshedLabel.setObjectName("statlabel");
blocksshedLabel.setText("Blocks Shed");
let blocksshedStat = new QLabel();
blocksshedStat.setObjectName("ratinglabel");
const statlineblocksshed = new QWidget();
statlineblocksshed.setObjectName("statline");
const statlineblocksshedLayout = new FlexLayout();
statlineblocksshed.setLayout(statlineblocksshedLayout);
statlineblocksshedLayout.addWidget(blocksshedLabel);
statlineblocksshedLayout.addWidget(blocksshedStat);

const interceptionsLabel = new QLabel();
interceptionsLabel.setObjectName("statlabel");
interceptionsLabel.setText("Interceptions");
let interceptionsStat = new QLabel();
interceptionsStat.setObjectName("ratinglabel");
const statlineinterceptions = new QWidget();
statlineinterceptions.setObjectName("statline");
const statlineinterceptionsLayout = new FlexLayout();
statlineinterceptions.setLayout(statlineinterceptionsLayout);
statlineinterceptionsLayout.addWidget(interceptionsLabel);
statlineinterceptionsLayout.addWidget(interceptionsStat);

const ballsfieldeddefLabel = new QLabel();
ballsfieldeddefLabel.setObjectName("statlabel");
ballsfieldeddefLabel.setText("Balls Fielded (DEF)");
let ballsfieldeddefStat = new QLabel();
ballsfieldeddefStat.setObjectName("ratinglabel");
const statlineballsfieldeddef = new QWidget();
statlineballsfieldeddef.setObjectName("statline");
const statlineballsfieldeddefLayout = new FlexLayout();
statlineballsfieldeddef.setLayout(statlineballsfieldeddefLayout);
statlineballsfieldeddefLayout.addWidget(ballsfieldeddefLabel);
statlineballsfieldeddefLayout.addWidget(ballsfieldeddefStat);

const totaloutsrecordedLabel = new QLabel();
totaloutsrecordedLabel.setObjectName("statlabel");
totaloutsrecordedLabel.setText("Total Outs Recorded");
let totaloutsrecordedStat = new QLabel();
totaloutsrecordedStat.setObjectName("ratinglabel");
const statlinetotaloutsrecorded = new QWidget();
statlinetotaloutsrecorded.setObjectName("statline");
const statlinetotaloutsrecordedLayout = new FlexLayout();
statlinetotaloutsrecorded.setLayout(statlinetotaloutsrecordedLayout);
statlinetotaloutsrecordedLayout.addWidget(totaloutsrecordedLabel);
statlinetotaloutsrecordedLayout.addWidget(totaloutsrecordedStat);

let dropMenu = new QComboBox();
dropMenu.setObjectName("dropMenu");
dropMenu.addItem(undefined, "Season 2023");
dropMenu.addItem(undefined, "Career");
dropMenu.addEventListener("currentIndexChanged", () => {
  if (dropMenu.count() < 1) {
    return;
  } else {
  if (dropMenu.currentText() !== "Career") {
    let numReg = new RegExp(/\d+/);
    let selection = Number(numReg.exec(dropMenu.currentText()));
    let thisone = playerfirstnamelabel.text();
    let player = dropPlayer;
    if (player.number !== 0) {
      thisone = thisone + ` ${player.number}`;
    }
    let data = fs.readFileSync(`./dist/src/players/active/${thisone}.txt`, "utf8");
    let name = nameExp.exec(data)![1];
    let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
    if (player.number !== 0) {
      name = name + ` ${player.number}`
    }
    let thesestats = individualStats(name, selection);
    let years = data.match(/Season/g);
    let pro = years?.length;
    let vetdata: any = 0;
    if (pro === 1) {
      vetdata = "Rookie";
    } else {
      vetdata = pro!-1;
    }
    let firstname = player.name!;
    overallrating.setText(`${overall}`);
    yearsprorating.setText(`${vetdata}`);
    powerrating.setText(`${player.power}`);
    speedrating.setText(`${player.speed}`);
    eyerating.setText(`${player.eye}`);
    tacklerating.setText(`${player.tackle}`);
    breaktacklerating.setText(`${player.breaktackle}`);
    blockrating.setText(`${player.block}`);
    breakblockrating.setText(`${player.breakblock}`);
    awarenessrating.setText(`${player.awareness}`);
    agerating.setText(`${player.age}`);
    potentialrating.setText(`${player.potential}`);
    playerfirstnamelabel.setText(firstname);
    pointsStat.setText(thesestats.pointsScored);
    assistsStat.setText(thesestats.assists);
    assistpointsStat.setText(thesestats.assistpoints);
    brokentacklesStat.setText(thesestats.brokentackles);
    ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
    blocksStat.setText(thesestats.blocks);
    turnoversStat.setText(thesestats.turnovers);
    pitchesStat.setText(thesestats.pitches);
    strikesStat.setText(thesestats.strikes);
    ballsStat.setText(thesestats.balls);
    foulsStat.setText(thesestats.fouls);
    strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
    balloutsStat.setText(thesestats.ballouts);
    slamsgivenStat.setText(thesestats.slamsgiven);
    atbatsStat.setText(thesestats.atbats);
    hitsStat.setText(thesestats.hits);
    slamsStat.setText(thesestats.slams);
    hitstooutStat.setText(thesestats.hitstoout);
    hitstooffenseStat.setText(thesestats.hitstooffense);
    fouloutsStat.setText(thesestats.foulouts);
    strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
    tacklesStat.setText(thesestats.tackles);
    blocksshedStat.setText(thesestats.blocksshed);
    interceptionsStat.setText(thesestats.interceptions);
    ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
    totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
    for (let z=0;z<teamobjects.length;z++) {
      if (teamobjects[z].roster.includes(player.name!)) {
        playerteambutton.setText(teamobjects[z].name);
        break;
      }
    }
    stacked.setCurrentWidget(playerview);
  } else {
    let seasonExp = new RegExp(/Season (\d+)/g);
    let thisone = playerfirstnamelabel.text();
    let data = fs.readFileSync(`./dist/src/players/active/${thisone}.txt`, "utf8");
    let name = nameExp.exec(data)![1];
    let player = dropPlayer;
    if (player.number !== 0) {
      name = name + ` ${player.number}`
    }
    let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
    let seasonsDirty = data.match(seasonExp);
    let seasonsClean = [];
    for (let gy=0;gy<seasonsDirty!.length;gy++) {
      let numReg = new RegExp(/\d+/g);
      seasonsClean.push(seasonsDirty![gy].match(numReg));
    }
    let thesestats = careerStats(name, seasonsClean);
    let years = data.match(/Season/g);
    let pro = years?.length;
    let vetdata: any = 0;
    if (pro === 1) {
      vetdata = "Rookie";
    } else {
      vetdata = pro!-1;
    }
    let firstname = player.name!;
    overallrating.setText(`${overall}`);
    yearsprorating.setText(`${vetdata}`);
    powerrating.setText(`${player.power}`);
    speedrating.setText(`${player.speed}`);
    eyerating.setText(`${player.eye}`);
    tacklerating.setText(`${player.tackle}`);
    breaktacklerating.setText(`${player.breaktackle}`);
    blockrating.setText(`${player.block}`);
    breakblockrating.setText(`${player.breakblock}`);
    awarenessrating.setText(`${player.awareness}`);
    agerating.setText(`${player.age}`);
    potentialrating.setText(`${player.potential}`);
    playerfirstnamelabel.setText(firstname);
    pointsStat.setText(thesestats.pointsScored);
    assistsStat.setText(thesestats.assists);
    assistpointsStat.setText(thesestats.assistpoints);
    brokentacklesStat.setText(thesestats.brokentackles);
    ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
    blocksStat.setText(thesestats.blocks);
    turnoversStat.setText(thesestats.turnovers);
    pitchesStat.setText(thesestats.pitches);
    strikesStat.setText(thesestats.strikes);
    ballsStat.setText(thesestats.balls);
    foulsStat.setText(thesestats.fouls);
    strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
    balloutsStat.setText(thesestats.ballouts);
    slamsgivenStat.setText(thesestats.slamsgiven);
    atbatsStat.setText(thesestats.atbats);
    hitsStat.setText(thesestats.hits);
    slamsStat.setText(thesestats.slams);
    hitstooutStat.setText(thesestats.hitstoout);
    hitstooffenseStat.setText(thesestats.hitstooffense);
    fouloutsStat.setText(thesestats.foulouts);
    strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
    tacklesStat.setText(thesestats.tackles);
    blocksshedStat.setText(thesestats.blocksshed);
    interceptionsStat.setText(thesestats.interceptions);
    ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
    totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
    for (let z=0;z<teamobjects.length;z++) {
      if (teamobjects[z].roster.includes(player.name!)) {
        playerteambutton.setText(teamobjects[z].name);
        break;
      }
    }
    stacked.setCurrentWidget(playerview);
  }
}
});



playerstatsLayout.addWidget(statlinepoints);
playerstatsLayout.addWidget(statlineassists);
playerstatsLayout.addWidget(statlineassistpoints);
playerstatsLayout.addWidget(statlinebrokentackles);
playerstatsLayout.addWidget(statlineballsfieldedoff);
playerstatsLayout.addWidget(statlineblocks);
playerstatsLayout.addWidget(statlineturnovers);
playerstatsLayout.addWidget(statlinepitches);
playerstatsLayout.addWidget(statlinestrikes);
playerstatsLayout.addWidget(statlineballs);
playerstatsLayout.addWidget(statlinefouls);
playerstatsLayout.addWidget(statlinestrikeoutspitching);
playerstatsLayout.addWidget(statlineballouts);
playerstatsLayout.addWidget(statlineslamsgiven);
playerstatsLayout.addWidget(statlineatbats);
playerstatsLayout.addWidget(statlinehits);
playerstatsLayout.addWidget(statlineslams);
playerstatsLayout.addWidget(statlinehitstoout);
playerstatsLayout.addWidget(statlinehitstooffense);
playerstatsLayout.addWidget(statlinefoulouts);
playerstatsLayout.addWidget(statlinestrikeoutsbatting);
playerstatsLayout.addWidget(statlinetackles);
playerstatsLayout.addWidget(statlineblocksshed);
playerstatsLayout.addWidget(statlineinterceptions);
playerstatsLayout.addWidget(statlineballsfieldeddef);
playerstatsLayout.addWidget(statlinetotaloutsrecorded);
playerstatsLayout.addWidget(dropMenu);


const statsandratings = new QWidget();
statsandratings.setObjectName("statsandratings");
const statsandratingsLayout = new FlexLayout();
statsandratings.setLayout(statsandratingsLayout);
statsandratingsLayout.addWidget(ratingtable);
statsandratingsLayout.addWidget(overallTile);
statsandratingsLayout.addWidget(playerstats);


const playerviewTop = new QWidget();
playerviewTop.setObjectName("playerviewTop");
const playerviewTopLayout = new FlexLayout();
playerviewTop.setLayout(playerviewTopLayout);
playerviewTopLayout.addWidget(nameOverpl);
playerviewTopLayout.addWidget(prevnextPlayerSearch);
playerviewLayout.addWidget(playerviewTop);
playerviewLayout.addWidget(statsandratings);


let teamnamelabel = new QLabel();
teamnamelabel.setObjectName("teamnamelabel");
let teamoverall = new QLabel();

let teamroster = new QTreeWidget();
teamroster.setObjectName("teamroster");
teamroster.setHeaderLabels(ratingheaders);
teamroster.setSortingEnabled(true);
teamroster.addEventListener("itemDoubleClicked", (item) => {
  individual = `${item?.text(0)}.txt`;
  playercount = players.indexOf(`${item?.text(0)}.txt`);
if (  dropMenu !== null) {
    dropMenu.clear();
};
  let data = fs.readFileSync(`./dist/src/players/active/${players[playercount]}`, 'utf8');
  let seasonEx = new RegExp(/\d\d\d\d/g);
  let seasons = data.match(seasonEx);
  let numReg = new RegExp(/\d\d\d\d/);
  let name = nameExp.exec(data)![1];
  let numX = new RegExp(/\d+/);
  if (numX.exec(players[playercount]) !== null) {
    name = name + ` ${numX.exec(players[playercount])![0]}`;
    console.log(name);
  }
  let player = playerToObject(name);
  let firstname = player.name!;
  let itemsupdate: any[] = [];
  playerfirstnamelabel.setText(firstname);
  dropMenu.addItem(undefined, "Season 2023");
  dropMenu.addItem(undefined, "Career");
    for (let i=0;i<seasons!.length;i++) {
      if (seasons![i] !== season.toString() && dropMenuItems.includes(`Season ${seasons![i]}`) == false) {
      dropMenu.addItem(undefined, `Season ${seasons![i]}`);
      itemsupdate.push(`Season ${seasons![i]}`);
      }
    }
    dropMenuItems = itemsupdate;
  let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
  let thesestats = individualStats(name, season);
  let years = data.match(/Season/g);
  let pro = years?.length;
  let vetdata: any = 0;
  if (pro === 1) {
    vetdata = "Rookie";
  } else {
    vetdata = pro!-1;
  }
  overallrating.setText(`${overall}`);
  yearsprorating.setText(`${vetdata}`);
  powerrating.setText(`${player.power}`);
  speedrating.setText(`${player.speed}`);
  eyerating.setText(`${player.eye}`);
  tacklerating.setText(`${player.tackle}`);
  breaktacklerating.setText(`${player.breaktackle}`);
  blockrating.setText(`${player.block}`);
  breakblockrating.setText(`${player.breakblock}`);
  awarenessrating.setText(`${player.awareness}`);
  agerating.setText(`${player.age}`);
  potentialrating.setText(`${player.potential}`);
  playerfirstnamelabel.setText(firstname);
  pointsStat.setText(thesestats.pointsScored);
  assistsStat.setText(thesestats.assists);
  assistpointsStat.setText(thesestats.assistpoints);
  brokentacklesStat.setText(thesestats.brokentackles);
  ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
  blocksStat.setText(thesestats.blocks);
  turnoversStat.setText(thesestats.turnovers);
  pitchesStat.setText(thesestats.pitches);
  strikesStat.setText(thesestats.strikes);
  ballsStat.setText(thesestats.balls);
  foulsStat.setText(thesestats.fouls);
  strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
  balloutsStat.setText(thesestats.ballouts);
  slamsgivenStat.setText(thesestats.slamsgiven);
  atbatsStat.setText(thesestats.atbats);
  hitsStat.setText(thesestats.hits);
  slamsStat.setText(thesestats.slams);
  hitstooutStat.setText(thesestats.hitstoout);
  hitstooffenseStat.setText(thesestats.hitstooffense);
  fouloutsStat.setText(thesestats.foulouts);
  strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
  tacklesStat.setText(thesestats.tackles);
  blocksshedStat.setText(thesestats.blocksshed);
  interceptionsStat.setText(thesestats.interceptions);
  ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
  totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
  for (let z=0;z<teamobjects.length;z++) {
    if (teamobjects[z].roster.includes(player.name!)) {
      playerteambutton.setText(teamobjects[z].name);
    }
  }
  stacked.setCurrentWidget(playerview);
})

let nextbutton = new QPushButton();
nextbutton.setObjectName("nextbutton");
nextbutton.setText(">");
nextbutton.addEventListener("released", () => {
  
  teamcount++;
  if (teamcount > teams.length-1) {
    teamcount = 0;
  }
  let data = fs.readFileSync(`./dist/src/teams/${teams[teamcount]}`, 'utf8');
  let thisteamname = nameExp.exec(data)![1];
  teamnamelabel.setText(thisteamname);
  teamnamelabel.repaint();
  let thisteam = teamToObject(thisteamname);
  let roster: any[] = thisteam.roster;
  let teamrating = 0;
  for (let v=0;v<6;v++) {
    teamroster.takeTopLevelItem(0);
  }
  for (let k=0;k<roster.length;k++) {
    let overall = Math.round((roster[k].power + roster[k].speed + roster[k].eye + roster[k].tackle + roster[k].breaktackle + roster[k].block + roster[k].breakblock + roster[k].awareness) / 8);
    teamrating = teamrating + overall;
    let item = new QTreeWidgetItem();
    let player = fs.readFileSync(`./dist/src/players/active/${roster[k].name}.txt`, 'utf8');
    let years = player.match(/Season/g);
    let pro = years?.length;
    let vetdata: any = 0;
    if (pro === 1) {
      vetdata = "Rookie";
    } else {
      vetdata = pro!-1;
    }
    item.setText(0, roster[k].name);
    item.setData(1, 0, overall);
    item.setData(2, 0, vetdata);
    item.setData(3, 0, roster[k].power);
    item.setData(4, 0, roster[k].speed);
    item.setData(5, 0, roster[k].eye);
    item.setData(6, 0, roster[k].tackle);
    item.setData(7, 0, roster[k].breaktackle);
    item.setData(8, 0, roster[k].block);
    item.setData(9, 0, roster[k].breakblock);
    item.setData(10, 0, roster[k].awareness);
    item.setText(11, roster[k].potential);
    item.setData(12, 0, roster[k].age);
    teamroster.addTopLevelItem(item);
  }
  teamrating = Math.round(teamrating/6);
  teamoverall.setText(`overall: ${teamrating}`);
  stacked.setCurrentWidget(teamview);
})

let previousbutton = new QPushButton();
previousbutton.setObjectName("previousbutton");
previousbutton.setText("<");
previousbutton.addEventListener("released", () => {
  
  teamcount--;
  if (teamcount < 0) {
    teamcount = teams.length-1;
  }
  let data = fs.readFileSync(`./dist/src/teams/${teams[teamcount]}`, 'utf8');
  let thisteamname = nameExp.exec(data)![1];
  teamnamelabel.setText(thisteamname);
  teamnamelabel.repaint();
  let thisteam = teamToObject(thisteamname);
  let roster: any[] = thisteam.roster;
  let teamrating = 0;
  for (let v=0;v<6;v++) {
    teamroster.takeTopLevelItem(0);
  }
  for (let k=0;k<roster.length;k++) {
    let overall = Math.round((roster[k].power + roster[k].speed + roster[k].eye + roster[k].tackle + roster[k].breaktackle + roster[k].block + roster[k].breakblock + roster[k].awareness) / 8);
    teamrating = teamrating + overall;
    let item = new QTreeWidgetItem();
    let player = fs.readFileSync(`./dist/src/players/active/${roster[k].name}.txt`, 'utf8');
    let years = player.match(/Season/g);
    let pro = years?.length;
    let vetdata: any = 0;
    if (pro === 1) {
      vetdata = "Rookie";
    } else {
      vetdata = pro!-1;
    }
    item.setText(0, roster[k].name);
    item.setData(1, 0, overall);
    item.setData(2, 0, vetdata);
    item.setData(3, 0, roster[k].power);
    item.setData(4, 0, roster[k].speed);
    item.setData(5, 0, roster[k].eye);
    item.setData(6, 0, roster[k].tackle);
    item.setData(7, 0, roster[k].breaktackle);
    item.setData(8, 0, roster[k].block);
    item.setData(9, 0, roster[k].breakblock);
    item.setData(10, 0, roster[k].awareness);
    item.setText(11, roster[k].potential);
    item.setData(12, 0, roster[k].age);
    teamroster.addTopLevelItem(item);
  }
  teamrating = Math.round(teamrating/6);
  teamoverall.setText(`overall: ${teamrating}`);
  stacked.setCurrentWidget(teamview);
})

const prevnextStyle = `
  #nextbutton {
    background: #fffdd0;
    text-align: 'center';
    color: #4169e1;
  }
  #previousbutton {
    background: #fffdd0;
    text-align: 'center';
    color: #4169e1;
  }
`;
previousbutton.setStyleSheet(prevnextStyle);
nextbutton.setStyleSheet(prevnextStyle);
previousplayerButton.setStyleSheet(prevnextStyle);
nextplayerButton.setStyleSheet(prevnextStyle);
const nameOvr = new QWidget();
nameOvr.setObjectName("nameOvr");
const nameOvrLayout = new FlexLayout();
nameOvr.setLayout(nameOvrLayout);

nameOvrLayout.addWidget(teamnamelabel);
nameOvrLayout.addWidget(teamoverall);

const nameovrNext = new QWidget();
nameovrNext.setObjectName("nameovrNext");
const nameovrNextLayout = new FlexLayout();
nameovrNext.setLayout(nameovrNextLayout);

const stupid = new QWidget();
const stupidLayout = new FlexLayout();
stupid.setLayout(stupidLayout);
stupidLayout.addWidget(teamroster);

const prevnext = new QWidget();
prevnext.setObjectName("prevnext");
const prevnextLayout = new FlexLayout();
prevnext.setLayout(prevnextLayout);

const prevnextsearch = new QWidget();
prevnextsearch.setObjectName("prevnextsearch");
const prevnextsearchLayout = new FlexLayout;
prevnextsearch.setLayout(prevnextsearchLayout);

const searchteam = new QLineEdit();
searchteam.setObjectName("searchteam");
searchteam.setText("Search team.")
searchteam.addEventListener("returnPressed", () => {
  let teamsearched = searchteam.text();
  teamcount = teams.indexOf(`${teamsearched}.txt`);
  let data = fs.readFileSync(`./dist/src/teams/${teams[teamcount]}`, 'utf8');
  let thisteamname = nameExp.exec(data)![1];
  teamnamelabel.setText(thisteamname);
  teamnamelabel.repaint();
  let thisteam = teamToObject(thisteamname);
  let roster: any[] = thisteam.roster;
  let teamrating = 0;
  for (let v=0;v<6;v++) {
    teamroster.takeTopLevelItem(0);
  }
  for (let k=0;k<roster.length;k++) {
    let overall = Math.round((roster[k].power + roster[k].speed + roster[k].eye + roster[k].tackle + roster[k].breaktackle + roster[k].block + roster[k].breakblock + roster[k].awareness) / 8);
    teamrating = teamrating + overall;
    let item = new QTreeWidgetItem();
    let player = fs.readFileSync(`./dist/src/players/active/${roster[k].name}.txt`, 'utf8');
    let years = player.match(/Season/g);
    let pro = years?.length;
    let vetdata: any = 0;
    if (pro === 1) {
      vetdata = "Rookie";
    } else {
      vetdata = pro!-1;
    }
    item.setText(0, roster[k].name);
    item.setData(1, 0, overall);
    item.setData(2, 0, vetdata);
    item.setData(3, 0, roster[k].power);
    item.setData(4, 0, roster[k].speed);
    item.setData(5, 0, roster[k].eye);
    item.setData(6, 0, roster[k].tackle);
    item.setData(7, 0, roster[k].breaktackle);
    item.setData(8, 0, roster[k].block);
    item.setData(9, 0, roster[k].breakblock);
    item.setData(10, 0, roster[k].awareness);
    item.setText(11, roster[k].potential);
    item.setData(12, 0, roster[k].age);
    teamroster.addTopLevelItem(item);
  }
  teamrating = Math.round(teamrating/6);
  teamoverall.setText(`overall: ${teamrating}`);
  stacked.setCurrentWidget(teamview);
})
searchteam.setInlineStyle("font-size: 10px;");

prevnextLayout.addWidget(previousbutton);
prevnextLayout.addWidget(nextbutton);

prevnextsearchLayout.addWidget(prevnext);
prevnextsearchLayout.addWidget(searchteam);

nameovrNextLayout.addWidget(nameOvr);
nameovrNextLayout.addWidget(prevnextsearch);

teamLayout.addWidget(nameovrNext);
teamLayout.addWidget(stupid);


const statsSelect = new QWidget;
statsSelect.setObjectName("statsSelect");
const statsSelectLayout = new FlexLayout();
statsSelect.setLayout(statsSelectLayout);

const sportPhase = new QWidget;
sportPhase.setObjectName("sportPhase");
const phaseLayout = new FlexLayout();
sportPhase.setLayout(phaseLayout);

let statitems: QTreeWidgetItem[] = [];
const offenseStats = new QPushButton();

offenseStats.setText("Offense");
offenseStats.addEventListener("released", () => {
  
  for (let v=0;v<statitems.length;v++) {
    stats.takeTopLevelItem(0);
  }
  statitems = [];
  if (statchoice === 3) {
    try {
    let allstats = statsToObject(season);
    stats.setColumnCount(8);
    for (let q=0;q<allstats.length;q++) {
      const item = new QTreeWidgetItem();
      stats.setHeaderLabels(offenseheaders);
      let player;
      if (allstats[q].number === 0) {
      player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name}.txt`, 'utf8');
      } else {
      player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name} ${allstats[q].number}.txt`, 'utf8');
      }
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      item.setText(0, allstats[q].name);
      item.setData(1, 0, allstats[q].age);
      item.setData(2, 0, vetdata);
      item.setText(3, allstats[q].team);
      if (allstats[q].pointsScored > 0) {
      item.setData(4, 0, allstats[q].pointsScored);
      } else {
        item.setText(4, "0");
      }
      if (allstats[q].assists > 0) {
      item.setData(5, 0, allstats[q].assists);
      } else {
        item.setText(5, "0");
      }
      if (allstats[q].assistpoints > 0) {
      item.setData(6, 0, allstats[q].assistpoints);
    } else {
      item.setText(6, "0");
    }
      if (allstats[q].brokentackles > 0) {
      item.setData(7, 0, allstats[q].brokentackles);
    } else {
      item.setText(7, "0");
    }
      if (allstats[q].ballsfieldedoff > 0) {
      item.setData(8, 0, allstats[q].ballsfieldedoff);
    } else {
      item.setText(8, "0");
    }
      if (allstats[q].blocks > 0) {
      item.setData(9, 0, allstats[q].blocks);
    } else {
      item.setText(9, "0");
    }
      if (allstats[q].turnovers > 0) {
      item.setData(10, 0, allstats[q].turnovers);
    } else {
      item.setText(10, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
  } catch (err) {
    fs.writeFileSync('Error.txt', `${err}`, {flag: "W"});
  }
  } else if (statchoice === 4) {
    stats.setHeaderLabels(offenseheaders);
    for (let i=0;i<players.length;i++) {
      const item = new QTreeWidgetItem();
      let player = fs.readFileSync(`./dist/src/players/active/${players[i]}`, 'utf8');
      let seasonExp = new RegExp(/Season (\d+)/g);
      let seasonsDirty = player.match(seasonExp);
      let seasonsClean = [];
    for (let gy=0;gy<seasonsDirty!.length;gy++) {
      let numReg = new RegExp(/\d+/g);
      seasonsClean.push(seasonsDirty![gy].match(numReg));
    }
      let playername = nameExp.exec(player)![1];
      let numX = new RegExp(/\d+/);
      if (numX.exec(players[i]) !== null) {
        playername = playername + ` ${numX.exec(players[i])![0]}`
      }
      let statitem = careerStats(playername, seasonsClean);
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      for (let z=0;z<teamobjects.length;z++) {
        if (teamobjects[z].roster.includes(nameExp.exec(player)![1])) {
          statitem.team = (teamobjects[z].name);
        }
      }
      item.setText(0, statitem.name);
      item.setData(1, 0, statitem.age);
      item.setData(2, 0, vetdata);
      item.setText(3, statitem.team);
      if (statitem.pointsScored > 0) {
      item.setData(4, 0, statitem.pointsScored);
      } else {
        item.setText(4, "0");
      }
      if (statitem.assists > 0) {
      item.setData(5, 0, statitem.assists);
      } else {
        item.setText(5, "0");
      }
      if (statitem.assistpoints > 0) {
      item.setData(6, 0, statitem.assistpoints);
    } else {
      item.setText(6, "0");
    }
      if (statitem.brokentackles > 0) {
      item.setData(7, 0, statitem.brokentackles);
    } else {
      item.setText(7, "0");
    }
      if (statitem.ballsfieldedoff > 0) {
      item.setData(8, 0, statitem.ballsfieldedoff);
    } else {
      item.setText(8, "0");
    }
      if (statitem.blocks > 0) {
      item.setData(9, 0, statitem.blocks);
    } else {
      item.setText(9, "0");
    }
      if (statitem.turnovers > 0) {
      item.setData(10, 0, statitem.turnovers);
    } else {
      item.setText(10, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
  }
  });

const defenseStats = new QPushButton();

defenseStats.setText("Defense");
defenseStats.addEventListener("released", () => {
  
  for (let v=0;v<statitems.length;v++) {
    stats.takeTopLevelItem(0);
  }
  statitems = [];
  if (statchoice === 3) {
    let allstats = statsToObject(season);
    stats.setColumnCount(defenseheaders.length);
    for (let q=0;q<allstats.length;q++) {
      const item = new QTreeWidgetItem();
      stats.setHeaderLabels(defenseheaders);
      let player;
      if (allstats[q].number === 0) {
        player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name}.txt`, 'utf8');
        } else {
        player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name} ${allstats[q].number}.txt`, 'utf8');
        }
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      item.setText(0, allstats[q].name);
      item.setData(1, 0, allstats[q].age);
      item.setData(2, 0, vetdata);
      item.setText(3, allstats[q].team);
      if (allstats[q].tackles > 0) {
      item.setData(4, 0, allstats[q].tackles);
      } else {
        item.setText(4, "0");
      }
      if (allstats[q].blocksshed > 0) {
      item.setData(5, 0, allstats[q].blocksshed);
      } else {
        item.setText(5, "0");
      }
      if (allstats[q].interceptions > 0) {
      item.setData(6, 0, allstats[q].interceptions);
    } else {
      item.setText(6, "0");
    }
      if (allstats[q].ballsfieldeddef > 0) {
      item.setData(7, 0, allstats[q].ballsfieldeddef);
    } else {
      item.setText(7, "0");
    }
      if (allstats[q].totaloutsrecorded > 0) {
      item.setData(8, 0, allstats[q].totaloutsrecorded);
    } else {
      item.setText(8, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
  } else if (statchoice === 4) {
    stats.setHeaderLabels(defenseheaders);
    for (let i=0;i<players.length;i++) {
      const item = new QTreeWidgetItem();
      let player = fs.readFileSync(`./dist/src/players/active/${players[i]}`, 'utf8');
      let seasonExp = new RegExp(/Season (\d+)/g);
      let seasonsDirty = player.match(seasonExp);
      let seasonsClean = [];
    for (let gy=0;gy<seasonsDirty!.length;gy++) {
      let numReg = new RegExp(/\d+/g);
      seasonsClean.push(seasonsDirty![gy].match(numReg));
    }
      let playername = nameExp.exec(player)![1];
      let numX = new RegExp(/\d+/);
      if (numX.exec(players[i]) !== null) {
        playername = playername + ` ${numX.exec(players[i])![0]}`
      }
      let statitem = careerStats(playername, seasonsClean);
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      for (let z=0;z<teamobjects.length;z++) {
        if (teamobjects[z].roster.includes(nameExp.exec(player)![1])) {
          statitem.team = (teamobjects[z].name);
        }
      }
      item.setText(0, statitem.name);
      item.setData(1, 0, statitem.age);
      item.setData(2, 0, vetdata);
      item.setText(3,statitem.team);
      if (statitem.tackles > 0) {
      item.setData(4, 0,statitem.tackles);
      } else {
        item.setText(4, "0");
      }
      if (statitem.blocksshed > 0) {
      item.setData(5, 0,statitem.blocksshed);
      } else {
        item.setText(5, "0");
      }
      if (statitem.interceptions > 0) {
      item.setData(6, 0,statitem.interceptions);
    } else {
      item.setText(6, "0");
    }
      if (statitem.ballsfieldeddef > 0) {
      item.setData(7, 0,statitem.ballsfieldeddef);
    } else {
      item.setText(7, "0");
    }
      if (statitem.totaloutsrecorded > 0) {
      item.setData(8, 0,statitem.totaloutsrecorded);
    } else {
      item.setText(8, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
}
});

const pitchingStats = new QPushButton();

pitchingStats.setText("Pitching");
pitchingStats.addEventListener("released", () => {
  
  for (let v=0;v<statitems.length;v++) {
    stats.takeTopLevelItem(0);
  }
  statitems = [];
  if (statchoice === 3) {
    let allstats = statsToObject(season);
    for (let q=0;q<allstats.length;q++) {
      const item = new QTreeWidgetItem();
      stats.setHeaderLabels(pitchingheaders);
      let player;
      if (allstats[q].number === 0) {
        player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name}.txt`, 'utf8');
        } else {
        player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name} ${allstats[q].number}.txt`, 'utf8');
        }
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      item.setText(0, allstats[q].name);
      item.setData(1, 0, allstats[q].age);
      item.setData(2, 0, vetdata);
      item.setText(3, allstats[q].team);
      if (allstats[q].pitches > 0) {
      item.setData(4, 0, allstats[q].pitches);
      } else {
        item.setText(4, "0");
      }
      if (allstats[q].strikes > 0) {
      item.setData(5, 0, allstats[q].strikes);
      } else {
        item.setText(5, "0");
      }
      if (allstats[q].balls > 0) {
      item.setData(6, 0, allstats[q].balls);
    } else {
      item.setText(6, "0");
    }
      if (allstats[q].fouls > 0) {
      item.setData(7, 0, allstats[q].fouls);
    } else {
      item.setText(7, "0");
    }
      if (allstats[q].strikeoutspitching > 0) {
      item.setData(8, 0, allstats[q].strikeoutspitching);
    } else {
      item.setText(8, "0");
    }
    if (allstats[q].ballouts > 0) {
      item.setData(9, 0, allstats[q].ballouts);
    } else {
      item.setText(9, "0");
    }
    if (allstats[q].slamsgiven > 0) {
      item.setData(10, 0, allstats[q].slamsgiven);
    } else {
      item.setText(10, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
  } else if (statchoice === 4) {
    stats.setHeaderLabels(defenseheaders);
    for (let i=0;i<players.length;i++) {
      const item = new QTreeWidgetItem();
      let player = fs.readFileSync(`./dist/src/players/active/${players[i]}`, 'utf8');
      let seasonExp = new RegExp(/Season (\d+)/g);
      let seasonsDirty = player.match(seasonExp);
      let seasonsClean = [];
    for (let gy=0;gy<seasonsDirty!.length;gy++) {
      let numReg = new RegExp(/\d+/g);
      seasonsClean.push(seasonsDirty![gy].match(numReg));
    }
      let playername = nameExp.exec(player)![1];
      let numX = new RegExp(/\d+/);
      if (numX.exec(players[i]) !== null) {
        playername = playername + ` ${numX.exec(players[i])![0]}`
      }
      let statitem = careerStats(playername, seasonsClean);
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      for (let z=0;z<teamobjects.length;z++) {
        if (teamobjects[z].roster.includes(nameExp.exec(player)![1])) {
          statitem.team = (teamobjects[z].name);
        }
      }
      item.setText(0, statitem.name);
      item.setData(1, 0, statitem.age);
      item.setData(2, 0, vetdata);
      item.setText(3, statitem.team);
      if (statitem.pitches > 0) {
      item.setData(4, 0, statitem.pitches);
      } else {
        item.setText(4, "0");
      }
      if (statitem.strikes > 0) {
      item.setData(5, 0, statitem.strikes);
      } else {
        item.setText(5, "0");
      }
      if (statitem.balls > 0) {
      item.setData(6, 0, statitem.balls);
    } else {
      item.setText(6, "0");
    }
      if (statitem.fouls > 0) {
      item.setData(7, 0, statitem.fouls);
    } else {
      item.setText(7, "0");
    }
      if (statitem.strikeoutspitching > 0) {
      item.setData(8, 0, statitem.strikeoutspitching);
    } else {
      item.setText(8, "0");
    }
    if (statitem.ballouts > 0) {
      item.setData(9, 0, statitem.ballouts);
    } else {
      item.setText(9, "0");
    }
    if (statitem.slamsgiven > 0) {
      item.setData(10, 0, statitem.slamsgiven);
    } else {
      item.setText(10, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
}
});

const battingStats = new QPushButton();

battingStats.setText("Batting");
battingStats.addEventListener("released", () => {
  
  for (let v=0;v<statitems.length;v++) {
    stats.takeTopLevelItem(0);
  }
  statitems = [];
  if (statchoice === 3) {
    let allstats = statsToObject(season);
    for (let q=0;q<allstats.length;q++) {
      const item = new QTreeWidgetItem();
      stats.setHeaderLabels(battingheaders);
      let player;
      if (allstats[q].number === 0) {
        player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name}.txt`, 'utf8');
        } else {
        player = fs.readFileSync(`./dist/src/players/active/${allstats[q].name} ${allstats[q].number}.txt`, 'utf8');
        }
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      item.setText(0, allstats[q].name);
      item.setData(1, 0, allstats[q].age);
      item.setData(2, 0, vetdata);
      item.setText(3, allstats[q].team);
      if (allstats[q].atbats > 0) {
      item.setData(4, 0, allstats[q].atbats);
      } else {
        item.setText(4, "0");
      }
      if (allstats[q].hits > 0) {
      item.setData(5, 0, allstats[q].hits);
      } else {
        item.setText(5, "0");
      }
      if (allstats[q].slams > 0) {
      item.setData(6, 0, allstats[q].slams);
    } else {
      item.setText(6, "0");
    }
      if (allstats[q].hitstoout > 0) {
      item.setData(7, 0, allstats[q].hitstoout);
    } else {
      item.setText(7, "0");
    }
      if (allstats[q].hitstooffense > 0) {
      item.setData(8, 0, allstats[q].hitstooffense);
    } else {
      item.setText(8, "0");
    }
    if (allstats[q].strikeoutsbatting > 0) {
      item.setData(9, 0, allstats[q].strikeoutsbatting);
    } else {
      item.setText(9, "0");
    }
    if (allstats[q].foulouts > 0) {
      item.setData(10, 0, allstats[q].foulouts);
    } else {
      item.setText(10, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
  } else if (statchoice === 4) {
    stats.setHeaderLabels(battingheaders);
    for (let i=0;i<players.length;i++) {
      const item = new QTreeWidgetItem();
      let player = fs.readFileSync(`./dist/src/players/active/${players[i]}`, 'utf8');
      let seasonExp = new RegExp(/Season (\d+)/g);
      let seasonsDirty = player.match(seasonExp);
      let seasonsClean = [];
    for (let gy=0;gy<seasonsDirty!.length;gy++) {
      let numReg = new RegExp(/\d+/g);
      seasonsClean.push(seasonsDirty![gy].match(numReg));
    }
      let playername = nameExp.exec(player)![1];
      let numX = new RegExp(/\d+/);
      if (numX.exec(players[i]) !== null) {
        playername = playername + ` ${numX.exec(players[i])![0]}`
      }
      let statitem = careerStats(playername, seasonsClean);
      let years = player.match(/Season/g);
      let pro = years?.length;
      let vetdata: any = 0;
      if (pro === 1) {
        vetdata = "Rookie";
      } else {
        vetdata = pro!-1;
      }
      for (let z=0;z<teamobjects.length;z++) {
        if (teamobjects[z].roster.includes(nameExp.exec(player)![1])) {
          statitem.team = (teamobjects[z].name);
        }
      }
      item.setText(0, statitem.name);
      item.setData(1, 0, statitem.age);
      item.setData(2, 0, vetdata);
      item.setText(3, statitem.team);
      if (statitem.atbats > 0) {
      item.setData(4, 0, statitem.atbats);
      } else {
        item.setText(4, "0");
      }
      if (statitem.hits > 0) {
      item.setData(5, 0, statitem.hits);
      } else {
        item.setText(5, "0");
      }
      if (statitem.slams > 0) {
      item.setData(6, 0, statitem.slams);
    } else {
      item.setText(6, "0");
    }
      if (statitem.hitstoout > 0) {
      item.setData(7, 0, statitem.hitstoout);
    } else {
      item.setText(7, "0");
    }
      if (statitem.hitstooffense > 0) {
      item.setData(8, 0, statitem.hitstooffense);
    } else {
      item.setText(8, "0");
    }
    if (statitem.strikeoutsbatting > 0) {
      item.setData(9, 0, statitem.strikeoutsbatting);
    } else {
      item.setText(9, "0");
    }
    if (statitem.foulouts > 0) {
      item.setData(10, 0, statitem.foulouts);
    } else {
      item.setText(10, "0");
    }
    statitems.push(item);
      stats.addTopLevelItem(item);
    }
    stacked.setCurrentWidget(stats);
  }
})

phaseLayout.addWidget(offenseStats);
phaseLayout.addWidget(defenseStats);
phaseLayout.addWidget(pitchingStats);
phaseLayout.addWidget(battingStats);

let dropPlayer: any;
const playersButton = new QPushButton();

playersButton.setFlat(true);
playersButton.setText("Players");
playersButton.addEventListener("released", () => {
  
  try {
  let data = fs.readFileSync(`./dist/src/players/active/${players[playercount]}`, "utf8");
  let name = nameExp.exec(data)![1];
  let numX = new RegExp(/\d+/);
  if (numX.exec(players[playercount]) !== null) {
    name = name + ` ${numX.exec(players[playercount])![0]}`;
  }
  let player = playerToObject(name);
  dropPlayer = player;
  let overall = Math.round((player.power! + player.speed! + player.eye! + player.tackle! + player.breaktackle! + player.block! + player.breakblock! + player.awareness!) / 8);
  let thesestats = individualStats(player.name, season);
  let years = data.match(/Season/g);
  let pro = years?.length;
  let vetdata: any = 0;
  if (pro === 1) {
    vetdata = "Rookie";
  } else {
    vetdata = pro!-1;
  }
  let firstname = player.name!;
  overallrating.setText(`${overall}`);
  yearsprorating.setText(`${vetdata}`);
  powerrating.setText(`${player.power}`);
  speedrating.setText(`${player.speed}`);
  eyerating.setText(`${player.eye}`);
  tacklerating.setText(`${player.tackle}`);
  breaktacklerating.setText(`${player.breaktackle}`);
  blockrating.setText(`${player.block}`);
  breakblockrating.setText(`${player.breakblock}`);
  awarenessrating.setText(`${player.awareness}`);
  agerating.setText(`${player.age}`);
  potentialrating.setText(`${player.potential}`);
  playerfirstnamelabel.setText(firstname);
  pointsStat.setText(thesestats.pointsScored);
  assistsStat.setText(thesestats.assists);
  assistpointsStat.setText(thesestats.assistpoints);
  brokentacklesStat.setText(thesestats.brokentackles);
  ballsfieldedoffStat.setText(thesestats.ballsfieldedoff);
  blocksStat.setText(thesestats.blocks);
  turnoversStat.setText(thesestats.turnovers);
  pitchesStat.setText(thesestats.pitches);
  strikesStat.setText(thesestats.strikes);
  ballsStat.setText(thesestats.balls);
  foulsStat.setText(thesestats.fouls);
  strikeoutspitchingStat.setText(thesestats.strikeoutspitching);
  balloutsStat.setText(thesestats.ballouts);
  slamsgivenStat.setText(thesestats.slamsgiven);
  atbatsStat.setText(thesestats.atbats);
  hitsStat.setText(thesestats.hits);
  slamsStat.setText(thesestats.slams);
  hitstooutStat.setText(thesestats.hitstoout);
  hitstooffenseStat.setText(thesestats.hitstooffense);
  fouloutsStat.setText(thesestats.foulouts);
  strikeoutsbattingStat.setText(thesestats.strikeoutsbatting);
  tacklesStat.setText(thesestats.tackles);
  blocksshedStat.setText(thesestats.blocksshed);
  interceptionsStat.setText(thesestats.interceptions);
  ballsfieldeddefStat.setText(thesestats.ballsfieldeddef);
  totaloutsrecordedStat.setText(thesestats.totaloutsrecorded);
  for (let z=0;z<teamobjects.length;z++) {
    if (teamobjects[z].roster.includes(player.name!)) {
      playerteambutton.setText(teamobjects[z].name);
      break;
    }
  }
  stacked.setCurrentWidget(playerview);
} catch (err) {
  if (err) {
    fs.writeFileSync(`Error.txt`, `${err}`, {flag: "w"});
  }
}
});

const rosters = new QPushButton();

rosters.setFlat(true);
rosters.setText("Rosters");
const rostersButtonLayout = new FlexLayout();
rosters.setLayout(rostersButtonLayout);
rosters.addEventListener("released", () => {
  
  statchoice = 1;
  let data = fs.readFileSync(`./dist/src/teams/${teams[teamcount]}`, 'utf8');
  let thisteamname = nameExp.exec(data)![1];
  teamnamelabel.setText(thisteamname);
  let thisteam = teamToObject(thisteamname);
  let roster: any[] = thisteam.roster;
  let teamrating = 0;
  for (let v=0;v<6;v++) {
    teamroster.takeTopLevelItem(0);
  }
  for (let k=0;k<roster.length;k++) {
    let overall = Math.round((roster[k].power + roster[k].speed + roster[k].eye + roster[k].tackle + roster[k].breaktackle + roster[k].block + roster[k].breakblock + roster[k].awareness) / 8);
    teamrating = teamrating + overall;
    let item = new QTreeWidgetItem();
    let player = fs.readFileSync(`./dist/src/players/active/${roster[k].name}.txt`, 'utf8');
    let years = player.match(/Season/g);
    let pro = years?.length;
    let vetdata: any = 0;
    if (pro === 1) {
      vetdata = "Rookie";
    } else {
      vetdata = pro!-1;
    }
    item.setText(0, roster[k].name);
    item.setData(1, 0, overall);
    item.setData(2, 0, vetdata);
    item.setData(3, 0, roster[k].power);
    item.setData(4, 0, roster[k].speed);
    item.setData(5, 0, roster[k].eye);
    item.setData(6, 0, roster[k].tackle);
    item.setData(7, 0, roster[k].breaktackle);
    item.setData(8, 0, roster[k].block);
    item.setData(9, 0, roster[k].breakblock);
    item.setData(10, 0, roster[k].awareness);
    item.setText(11, roster[k].potential);
    item.setData(12, 0, roster[k].age);
    teamroster.addTopLevelItem(item);
  }
  teamrating = Math.round(teamrating/6);
  teamoverall.setText(`overall: ${teamrating}`);
  stacked.setCurrentWidget(teamview);
})

const recordsButton = new QPushButton();

recordsButton.setText("Records");
recordsButton.setObjectName('recordsButton');
recordsButton.addEventListener("released", () => {
  
  stacked.setCurrentWidget(recordTypesMenu);
})


const teamStatsView = new QWidget();
teamStatsView.setObjectName("teamStatsView");
const teamStatsViewLayout = new FlexLayout();
teamStatsView.setLayout(teamStatsViewLayout);

const tsvLeftCol = new QWidget();
tsvLeftCol.setObjectName("tsvLeftCol");
const tsvLeftColLayout = new FlexLayout();
tsvLeftCol.setLayout(tsvLeftColLayout);

let tsvRightCol = new QTreeWidget();
tsvRightCol.setObjectName('tsvRightCol');
let teamstatsheaders = ["Team Name", "Power Ranking", "Points For", "Points Against", "Assists", "Assist Points", "Broken Tackles", "Balls Fielded (OFF)", "Blocks", "Turnovers", "Tackles", "Blocks Shed", "Interceptions", "Balls Fielded (DEF)", "Total Outs Recorded", "At-Bats", "Hits", "Slams", "Hits to Out", "Hits to Offense", "Strikeouts Batting", "Foulouts", "Pitches", "Strikes", "Balls", "Fouls", "Strikeouts Pitching", "Ballouts", "Slams Given"]
tsvRightCol.setHeaderLabels(teamstatsheaders);
tsvRightCol.setSortingEnabled(true);

let teamsputlist: any[] = [];
let teamInput = new QTextEdit();
teamInput.setObjectName("teamInput");
let powerrankingsRecord: string = "Team,Rank,Points For,Points Against,Assists,Assist Points,Broken Tackles,Balls Fielded (OFF),Blocks,Turnovers,Tackles,Blocks Shed,Interceptions,Balls Fielded (DEF),Total Outs Recorded,At-Bats,Hits,Slams,Hits to Out,Hits to Offense,Strikeouts Batting,Foulouts,Pitches,Strikes,Balls,Fouls,Strikeouts Pitching,Ballouts,Slams Given\n";
const exportRankings = new QPushButton();
exportRankings.setText("Export Stats");
exportRankings.addEventListener("released", () => {
  fs.writeFileSync(`./dist/src/records/Power Rankings.csv`, powerrankingsRecord, {flag: "w"});
  powerrankingsRecord = "Team,Rank,Points For,Points Against,Assists,Assist Points,Broken Tackles,Balls Fielded (OFF),Blocks,Turnovers,Tackles,Blocks Shed,Interceptions,Balls Fielded (DEF),Total Outs Recorded,At-Bats,Hits,Slams,Hits to Out,Hits to Offense,Strikeouts Batting,Foulouts,Pitches,Strikes,Balls,Fouls,Strikeouts Pitching,Ballouts,Slams Given\n";
  const successmsg = new QMessageBox;
  successmsg.setText("Rankings exported to records folder!");
  const gotit = new QPushButton;
  gotit.setText("Good news");
  successmsg.addButton(gotit, ButtonRole.AcceptRole);
  successmsg.exec();
})
const logButton = new QPushButton()
logButton.setObjectName("logButton");
logButton.setText("Get Stats");
logButton.addEventListener("released", ()=> {
if (  tsvRightCol !== null) {
    tsvRightCol.clear();
};
  let data = teamInput;
  let testReg = new RegExp(/\b.+\b/g);
  let enteredlist = data.toPlainText().match(testReg);
  let cleaner = new RegExp(/(\w|\s|'|-|\&|\d|\.)+([A-Za-z]|\d)(?=--*|)/);
  let secondreg = new RegExp(/.+\w[^\d*]/);
  let thirdreg = new RegExp(/.+\w/)
  let teamsput: any[] = [];
  for (let yu = 0; yu < enteredlist!.length; yu++) {
  try {
    let cleaned = cleaner.exec(enteredlist![yu])![0];
      const filePath = `./dist/src/teams/${cleaned}.txt`;
      fs.statSync(filePath);
      teamsput.push(cleaned);
  } catch (err) {
    try {
      let cleaned = secondreg.exec(cleaner.exec(enteredlist![yu])![0])![0];
      const filePath = `./dist/src/teams/${cleaned}.txt`;
      fs.statSync(filePath);
      teamsput.push(cleaned);
    } catch (err) {
      try {
        let cleaned = thirdreg.exec(secondreg.exec(cleaner.exec(enteredlist![yu])![0])![0])![0];
        const filePath = `./dist/src/teams/${cleaned}.txt`;
        fs.statSync(filePath);
        teamsput.push(cleaned);
      } catch (err) {
        fs.writeFileSync("Team Stats Error.txt", `${err}`, {flag: "w"});
        continue;
      }
    }
  }
}
  let powerarr: any[] = [];
  let rankings: any[] = [];
  for (let ni=0;ni<teamsput!.length;ni++) {
    let teampower = powerScore(teamsput![ni], season);
    powerarr.push([teamsput![ni], teampower]);
  }
  for (let hi=0;hi<powerarr.length;hi++) {
    let count = 0;
    for (let fi=0;fi<powerarr.length;fi++) {
      if (powerarr[hi][1] >= powerarr[fi][1]) {
          continue;
      } else {
        count++;
        break;
      }
    }
    if (count === 0) {
      rankings.push(powerarr[hi][0]);
      powerarr[hi][1] = 1;
    }
    count = 0;
    if (rankings.length < powerarr.length && hi >= powerarr.length - 1) {
      hi = -1;
    } else if (rankings.length >= powerarr.length) {
      break;
    }
  }
  for (let ni=0;ni<teamsput!.length;ni++) {
    let item = new QTreeWidgetItem();
    let rankingitem;
    let thisteamdata = getTeamStats(teamsput![ni], season);
    item.setText(0, thisteamdata.team.name);
    rankingitem = `${thisteamdata.team.name},`;
    item.setData(1, 0, rankings.indexOf(thisteamdata.team.name)+1);
    rankingitem = rankingitem + `${rankings.indexOf(thisteamdata.team.name)+1},`;
    if (thisteamdata.team.pointsScored > 0) {
    item.setData(2, 0, thisteamdata.team.pointsScored)
    rankingitem = rankingitem + `${thisteamdata.team.pointsScored},`
    } else {
      item.setText(2, "0");
      rankingitem = rankingitem + "0,";
    }
    if (thisteamdata.team.pointsagainst > 0) {
    item.setData(3, 0, thisteamdata.team.pointsagainst)
    rankingitem = rankingitem + `${thisteamdata.team.pointsagainst},`
    } else {
      item.setText(3, "0");
      rankingitem = rankingitem + "0,"
    }
    if (thisteamdata.team.assists  > 0) {
    item.setData(4, 0, thisteamdata.team.assists);
    rankingitem = rankingitem + `${thisteamdata.team.assists},`
  } else {
    item.setText(4, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.assistpoints  > 0) {
    item.setData(5, 0, thisteamdata.team.assistpoints);
    rankingitem = rankingitem + `${thisteamdata.team.assistpoints},`
  } else {
    item.setText(5, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.brokentackles  > 0) {
    item.setData(6, 0, thisteamdata.team.brokentackles);
    rankingitem = rankingitem + `${thisteamdata.team.brokentackles},`
  } else {
    item.setText(6, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.ballsfieldedoff  > 0) {
    item.setData(7, 0, thisteamdata.team.ballsfieldedoff);
    rankingitem = rankingitem + `${thisteamdata.team.ballsfieldedoff},`
  } else {
    item.setText(7, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.blocks > 0) {
    item.setData(8, 0, thisteamdata.team.blocks);
    rankingitem = rankingitem + `${thisteamdata.team.blocks},`
  } else {
    item.setText(8, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.turnovers > 0) {
    item.setData(9, 0, thisteamdata.team.turnovers);
    rankingitem = rankingitem + `${thisteamdata.team.turnovers},`
  } else {
    item.setText(9, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.tackles  > 0) {
    item.setData(10, 0, thisteamdata.team.tackles);
    rankingitem = rankingitem + `${thisteamdata.team.tackles},`
  } else {
    item.setText(10, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.blocksshed  > 0) {
    item.setData(11, 0, thisteamdata.team.blocksshed);
    rankingitem = rankingitem + `${thisteamdata.team.blocksshed},`
  } else {
    item.setText(11, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.interceptions  > 0) {
    item.setData(12, 0, thisteamdata.team.interceptions);
    rankingitem = rankingitem + `${thisteamdata.team.interceptions},`
  } else {
    item.setText(12, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.ballsfieldeddef  > 0) {
    item.setData(13, 0, thisteamdata.team.ballsfieldeddef);
    rankingitem = rankingitem + `${thisteamdata.team.ballsfieldeddef},`
  } else {
    item.setText(13, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.totaloutsrecorded  > 0) {
    item.setData(14, 0, thisteamdata.team.totaloutsrecorded);
    rankingitem = rankingitem + `${thisteamdata.team.totaloutsrecorded},`
  } else {
    item.setText(14, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.atbats  > 0) {
    item.setData(15, 0, thisteamdata.team.atbats);
    rankingitem = rankingitem + `${thisteamdata.team.atbats},`
  } else {
    item.setText(15, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.hits  > 0) {
    item.setData(16, 0, thisteamdata.team.hits);
    rankingitem = rankingitem + `${thisteamdata.team.hits},`
  } else {
    item.setText(16, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.slams  > 0) {
    item.setData(17, 0, thisteamdata.team.slams);
    rankingitem = rankingitem + `${thisteamdata.team.slams},`
  } else {
    item.setText(17, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.hitstoout  > 0) {
    item.setData(18, 0, thisteamdata.team.hitstoout);
    rankingitem = rankingitem + `${thisteamdata.team.hitstoout},`
  } else {
    item.setText(18, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.hitstooffense  > 0) {
    item.setData(19, 0, thisteamdata.team.hitstooffense);
    rankingitem = rankingitem + `${thisteamdata.team.hitstooffense},`
  } else {
    item.setText(19, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.strikeoutsbatting  > 0) {
    item.setData(20, 0, thisteamdata.team.strikeoutsbatting);
    rankingitem = rankingitem + `${thisteamdata.team.strikeoutsbatting},`
  } else {
    item.setText(20, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.foulouts  > 0) {
    item.setData(21, 0, thisteamdata.team.foulouts);
    rankingitem = rankingitem + `${thisteamdata.team.foulouts},`
  } else {
    item.setText(21, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.pitches  > 0) {
    item.setData(22, 0, thisteamdata.team.pitches);
    rankingitem = rankingitem + `${thisteamdata.team.pitches},`
  } else {
    item.setText(22, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.strikes  > 0) {
    item.setData(23, 0, thisteamdata.team.strikes);
    rankingitem = rankingitem + `${thisteamdata.team.strikes},`
  } else {
    item.setText(23, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.balls  > 0) {
    item.setData(24, 0, thisteamdata.team.balls);
    rankingitem = rankingitem + `${thisteamdata.team.balls},`
  } else {
    item.setText(24, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.fouls  > 0) {
    item.setData(25, 0, thisteamdata.team.fouls);
    rankingitem = rankingitem + `${thisteamdata.team.fouls},`
  } else {
    item.setText(25, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.strikeoutspitching  > 0) {
    item.setData(26, 0, thisteamdata.team.strikeoutspitching);
    rankingitem = rankingitem + `${thisteamdata.team.strikeoutspitching},`
  } else {
    item.setText(26, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.ballouts  > 0) {
    item.setData(27, 0, thisteamdata.team.ballouts);
    rankingitem = rankingitem + `${thisteamdata.team.ballouts},`
  } else {
    item.setText(27, "0");
    rankingitem = rankingitem + "0,"
  }
    if (thisteamdata.team.slamsgiven  > 0) {
    item.setData(28, 0, thisteamdata.team.slamsgiven);
    rankingitem = rankingitem + `${thisteamdata.team.slamsgiven}\n`
  } else {
    item.setText(28, "0");
    rankingitem = rankingitem + "0\n"
  }
  if (powerrankingsRecord == undefined) {
    powerrankingsRecord = rankingitem;
  } else {
    powerrankingsRecord = powerrankingsRecord + rankingitem;
  }
    tsvRightCol.addTopLevelItem(item);
  }
})
teamInput.setInlineStyle("font-size: 10px;");

tsvLeftColLayout.addWidget(teamInput);

tsvLeftColLayout.addWidget(logButton);
tsvLeftColLayout.addWidget(exportRankings);

teamStatsViewLayout.addWidget(tsvLeftCol);
teamStatsViewLayout.addWidget(tsvRightCol);

const teamStats = new QPushButton();

teamStats.setText("Team Stats");
teamStats.setObjectName("statsSelectButton");
teamStats.addEventListener("released", () => {
  
  statchoice = 2;
  stacked.setCurrentWidget(teamStatsView);
})

const seasonworldStats = new QPushButton();

seasonworldStats.setText("Season World Stats");
seasonworldStats.setObjectName("statsSelectButton");
seasonworldStats.addEventListener("released", () => {
  
  statchoice = 3;
  stacked.setCurrentWidget(sportPhase);
})

const careerworldStats = new QPushButton();

careerworldStats.setText("Career World Stats");
careerworldStats.setObjectName("statsSelectButton");
careerworldStats.addEventListener("released", () => {
  
  statchoice = 4;
  stacked.setCurrentWidget(sportPhase);
})

const pointsTile = new QWidget();
pointsTile.setObjectName('pointsTile');
const pointsTileLayout = new FlexLayout();
pointsTile.setLayout(pointsTileLayout);
pointsTile.setInlineStyle("flex-direction: 'column';");

let pointsTitle = new QLabel();
pointsTitle.setText("POINTS SCORED");
pointsTitle.setInlineStyle("height: 50px;");
let points1 = new QLabel();
points1.setInlineStyle("width: '150px';");
points1.setObjectName("recordLabel");
let points1val = new QLabel();
points1val.setInlineStyle("width: '50px';");
points1val.setObjectName("recordLabel");
let points2 = new QLabel();
points2.setInlineStyle("width: '150px';");
points2.setObjectName("recordLabel");
let points2val = new QLabel();
points2val.setInlineStyle("width: '50px';");
points2val.setObjectName("recordLabel");
let points3 = new QLabel();
points3.setInlineStyle("width: '150px';");
points3.setObjectName("recordLabel");
let points3val = new QLabel();
points3val.setInlineStyle("width: '50px';");
points3val.setObjectName("recordLabel");
let points4 = new QLabel();
points4.setInlineStyle("width: '150px';");
points4.setObjectName("recordLabel");
let points4val = new QLabel();
points4val.setInlineStyle("width: '50px';");
points4val.setObjectName("recordLabel");
let points5 = new QLabel();
points5.setInlineStyle("width: '150px';");
points5.setObjectName("recordLabel");
let points5val = new QLabel();
points5val.setInlineStyle("width: '50px';");
points5val.setObjectName("recordLabel");
let points6 = new QLabel();
points6.setInlineStyle("width: '150px';");
points6.setObjectName("recordLabel");
let points6val = new QLabel();
points6val.setInlineStyle("width: '50px';");
points6val.setObjectName("recordLabel");
let points7 = new QLabel();
points7.setInlineStyle("width: '150px';");
points7.setObjectName("recordLabel");
let points7val = new QLabel();
points7val.setInlineStyle("width: '50px';");
points7val.setObjectName("recordLabel");
let points8 = new QLabel();
points8.setInlineStyle("width: '150px';");
points8.setObjectName("recordLabel");
let points8val = new QLabel();
points8val.setInlineStyle("width: '50px';");
points8val.setObjectName("recordLabel");
let points9 = new QLabel();
points9.setInlineStyle("width: '150px';");
points9.setObjectName("recordLabel");
let points9val = new QLabel();
points9val.setInlineStyle("width: '50px';");
points9val.setObjectName("recordLabel");
let points10 = new QLabel();
points10.setInlineStyle("width: '150px';");
points10.setObjectName("recordLabel");
let points10val = new QLabel();
points10val.setInlineStyle("width: '50px';");
points10val.setObjectName("recordLabel");

const points1bar = new QWidget();
points1bar.setObjectName('points1bar');
const points1barLayout = new FlexLayout();
points1bar.setLayout(points1barLayout);
points1bar.setInlineStyle("flex-direction: 'row';")

points1barLayout.addWidget(points1);
points1barLayout.addWidget(points1val);

const points2bar = new QWidget();
points2bar.setObjectName('points2bar');
const points2barLayout = new FlexLayout();
points2bar.setLayout(points2barLayout);
points2bar.setInlineStyle("flex-direction: 'row';")

points2barLayout.addWidget(points2);
points2barLayout.addWidget(points2val);

const points3bar = new QWidget();
points3bar.setObjectName('points3bar');
const points3barLayout = new FlexLayout();
points3bar.setLayout(points3barLayout);
points3bar.setInlineStyle("flex-direction: 'row';")

points3barLayout.addWidget(points3);
points3barLayout.addWidget(points3val);

const points4bar = new QWidget();
points4bar.setObjectName('points4bar');
const points4barLayout = new FlexLayout();
points4bar.setLayout(points4barLayout);
points4bar.setInlineStyle("flex-direction: 'row';")

points4barLayout.addWidget(points4);
points4barLayout.addWidget(points4val);

const points5bar = new QWidget();
points5bar.setObjectName('points5bar');
const points5barLayout = new FlexLayout();
points5bar.setLayout(points5barLayout);
points5bar.setInlineStyle("flex-direction: 'row';")

points5barLayout.addWidget(points5);
points5barLayout.addWidget(points5val);

const points6bar = new QWidget();
points6bar.setObjectName('points6bar');
const points6barLayout = new FlexLayout();
points6bar.setLayout(points6barLayout);
points6bar.setInlineStyle("flex-direction: 'row';")

points6barLayout.addWidget(points6);
points6barLayout.addWidget(points6val);

const points7bar = new QWidget();
points7bar.setObjectName('points7bar');
const points7barLayout = new FlexLayout();
points7bar.setLayout(points7barLayout);
points7bar.setInlineStyle("flex-direction: 'row';")

points7barLayout.addWidget(points7);
points7barLayout.addWidget(points7val);

const points8bar = new QWidget();
points8bar.setObjectName('points8bar');
const points8barLayout = new FlexLayout();
points8bar.setLayout(points8barLayout);
points8bar.setInlineStyle("flex-direction: 'row';")

points8barLayout.addWidget(points8);
points8barLayout.addWidget(points8val);

const points9bar = new QWidget();
points9bar.setObjectName('points9bar');
const points9barLayout = new FlexLayout();
points9bar.setLayout(points9barLayout);
points9bar.setInlineStyle("flex-direction: 'row';")

points9barLayout.addWidget(points9);
points9barLayout.addWidget(points9val);

const points10bar = new QWidget();
points10bar.setObjectName('points10bar');
const points10barLayout = new FlexLayout();
points10bar.setLayout(points10barLayout);
points10bar.setInlineStyle("flex-direction: 'row';")

points10barLayout.addWidget(points10);
points10barLayout.addWidget(points10val);

const pointBarsArr = [[points1, points1val], [points2, points2val], [points3, points3val], [points4, points4val], [points5, points5val], [points6, points6val], [points7, points7val], [points8, points8val], [points9, points9val], [points10, points10val]]

pointsTileLayout.addWidget(pointsTitle);
pointsTileLayout.addWidget(points1bar);
pointsTileLayout.addWidget(points2bar);
pointsTileLayout.addWidget(points3bar);
pointsTileLayout.addWidget(points4bar);
pointsTileLayout.addWidget(points5bar);
pointsTileLayout.addWidget(points6bar);
pointsTileLayout.addWidget(points7bar);
pointsTileLayout.addWidget(points8bar);
pointsTileLayout.addWidget(points9bar);
pointsTileLayout.addWidget(points10bar);

const assistsTile = new QWidget();
assistsTile.setObjectName('assistsTile');
const assistsTileLayout = new FlexLayout();
assistsTile.setLayout(assistsTileLayout);
assistsTile.setInlineStyle("flex-direction: 'column';");

let assistsTitle = new QLabel();
assistsTitle.setText("ASSISTS");
assistsTitle.setInlineStyle("height: 50px;");
let assists1 = new QLabel();
assists1.setInlineStyle("width: '150px';");
assists1.setObjectName("recordLabel");
let assists1val = new QLabel();
assists1val.setInlineStyle("width: '50px';");
assists1val.setObjectName("recordLabel");
let assists2 = new QLabel();
assists2.setInlineStyle("width: '150px';");
assists2.setObjectName("recordLabel");
let assists2val = new QLabel();
assists2val.setInlineStyle("width: '50px';");
assists2val.setObjectName("recordLabel");
let assists3 = new QLabel();
assists3.setInlineStyle("width: '150px';");
assists3.setObjectName("recordLabel");
let assists3val = new QLabel();
assists3val.setInlineStyle("width: '50px';");
assists3val.setObjectName("recordLabel");
let assists4 = new QLabel();
assists4.setInlineStyle("width: '150px';");
assists4.setObjectName("recordLabel");
let assists4val = new QLabel();
assists4val.setInlineStyle("width: '50px';");
assists4val.setObjectName("recordLabel");
let assists5 = new QLabel();
assists5.setInlineStyle("width: '150px';");
assists5.setObjectName("recordLabel");
let assists5val = new QLabel();
assists5val.setInlineStyle("width: '50px';");
assists5val.setObjectName("recordLabel");
let assists6 = new QLabel();
assists6.setInlineStyle("width: '150px';");
assists6.setObjectName("recordLabel");
let assists6val = new QLabel();
assists6val.setInlineStyle("width: '50px';");
assists6val.setObjectName("recordLabel");
let assists7 = new QLabel();
assists7.setInlineStyle("width: '150px';");
assists7.setObjectName("recordLabel");
let assists7val = new QLabel();
assists7val.setInlineStyle("width: '50px';");
assists7val.setObjectName("recordLabel");
let assists8 = new QLabel();
assists8.setInlineStyle("width: '150px';");
assists8.setObjectName("recordLabel");
let assists8val = new QLabel();
assists8val.setInlineStyle("width: '50px';");
assists8val.setObjectName("recordLabel");
let assists9 = new QLabel();
assists9.setInlineStyle("width: '150px';");
assists9.setObjectName("recordLabel");
let assists9val = new QLabel();
assists9val.setInlineStyle("width: '50px';");
assists9val.setObjectName("recordLabel");
let assists10 = new QLabel();
assists10.setInlineStyle("width: '150px';");
assists10.setObjectName("recordLabel");
let assists10val = new QLabel();
assists10val.setInlineStyle("width: '50px';");
assists10val.setObjectName("recordLabel");

const assists1bar = new QWidget();
assists1bar.setObjectName('assists1bar');
const assists1barLayout = new FlexLayout();
assists1bar.setLayout(assists1barLayout);
assists1bar.setInlineStyle("flex-direction: 'row';")

assists1barLayout.addWidget(assists1);
assists1barLayout.addWidget(assists1val);

const assists2bar = new QWidget();
assists2bar.setObjectName('assists2bar');
const assists2barLayout = new FlexLayout();
assists2bar.setLayout(assists2barLayout);
assists2bar.setInlineStyle("flex-direction: 'row';")

assists2barLayout.addWidget(assists2);
assists2barLayout.addWidget(assists2val);

const assists3bar = new QWidget();
assists3bar.setObjectName('assists3bar');
const assists3barLayout = new FlexLayout();
assists3bar.setLayout(assists3barLayout);
assists3bar.setInlineStyle("flex-direction: 'row';")

assists3barLayout.addWidget(assists3);
assists3barLayout.addWidget(assists3val);

const assists4bar = new QWidget();
assists4bar.setObjectName('assists4bar');
const assists4barLayout = new FlexLayout();
assists4bar.setLayout(assists4barLayout);
assists4bar.setInlineStyle("flex-direction: 'row';")

assists4barLayout.addWidget(assists4);
assists4barLayout.addWidget(assists4val);

const assists5bar = new QWidget();
assists5bar.setObjectName('assists5bar');
const assists5barLayout = new FlexLayout();
assists5bar.setLayout(assists5barLayout);
assists5bar.setInlineStyle("flex-direction: 'row';")

assists5barLayout.addWidget(assists5);
assists5barLayout.addWidget(assists5val);

const assists6bar = new QWidget();
assists6bar.setObjectName('assists6bar');
const assists6barLayout = new FlexLayout();
assists6bar.setLayout(assists6barLayout);
assists6bar.setInlineStyle("flex-direction: 'row';")

assists6barLayout.addWidget(assists6);
assists6barLayout.addWidget(assists6val);

const assists7bar = new QWidget();
assists7bar.setObjectName('assists7bar');
const assists7barLayout = new FlexLayout();
assists7bar.setLayout(assists7barLayout);
assists7bar.setInlineStyle("flex-direction: 'row';")

assists7barLayout.addWidget(assists7);
assists7barLayout.addWidget(assists7val);

const assists8bar = new QWidget();
assists8bar.setObjectName('assists8bar');
const assists8barLayout = new FlexLayout();
assists8bar.setLayout(assists8barLayout);
assists8bar.setInlineStyle("flex-direction: 'row';")

assists8barLayout.addWidget(assists8);
assists8barLayout.addWidget(assists8val);

const assists9bar = new QWidget();
assists9bar.setObjectName('assists9bar');
const assists9barLayout = new FlexLayout();
assists9bar.setLayout(assists9barLayout);
assists9bar.setInlineStyle("flex-direction: 'row';")

assists9barLayout.addWidget(assists9);
assists9barLayout.addWidget(assists9val);

const assists10bar = new QWidget();
assists10bar.setObjectName('assists10bar');
const assists10barLayout = new FlexLayout();
assists10bar.setLayout(assists10barLayout);
assists10bar.setInlineStyle("flex-direction: 'row';")

assists10barLayout.addWidget(assists10);
assists10barLayout.addWidget(assists10val);

const assistsBarsArr = [[assists1, assists1val], [assists2, assists2val], [assists3, assists3val], [assists4, assists4val], [assists5, assists5val], [assists6, assists6val], [assists7, assists7val], [assists8, assists8val], [assists9, assists9val], [assists10, assists10val]]

assistsTileLayout.addWidget(assistsTitle);
assistsTileLayout.addWidget(assists1bar);
assistsTileLayout.addWidget(assists2bar);
assistsTileLayout.addWidget(assists3bar);
assistsTileLayout.addWidget(assists4bar);
assistsTileLayout.addWidget(assists5bar);
assistsTileLayout.addWidget(assists6bar);
assistsTileLayout.addWidget(assists7bar);
assistsTileLayout.addWidget(assists8bar);
assistsTileLayout.addWidget(assists9bar);
assistsTileLayout.addWidget(assists10bar);



const assistpointsTile = new QWidget();
assistpointsTile.setObjectName('assistpointsTile');
const assistpointsTileLayout = new FlexLayout();
assistpointsTile.setLayout(assistpointsTileLayout);
assistpointsTile.setInlineStyle("flex-direction: 'column';");

let assistpointsTitle = new QLabel();
assistpointsTitle.setText("ASSIST POINTS");
assistpointsTitle.setInlineStyle("height: 50px;");
let assistpoints1 = new QLabel();
assistpoints1.setInlineStyle("width: '150px';");
assistpoints1.setObjectName("recordLabel");
let assistpoints1val = new QLabel();
assistpoints1val.setInlineStyle("width: '50px';");
assistpoints1val.setObjectName("recordLabel");
let assistpoints2 = new QLabel();
assistpoints2.setInlineStyle("width: '150px';");
assistpoints2.setObjectName("recordLabel");
let assistpoints2val = new QLabel();
assistpoints2val.setInlineStyle("width: '50px';");
assistpoints2val.setObjectName("recordLabel");
let assistpoints3 = new QLabel();
assistpoints3.setInlineStyle("width: '150px';");
assistpoints3.setObjectName("recordLabel");
let assistpoints3val = new QLabel();
assistpoints3val.setInlineStyle("width: '50px';");
assistpoints3val.setObjectName("recordLabel");
let assistpoints4 = new QLabel();
assistpoints4.setInlineStyle("width: '150px';");
assistpoints4.setObjectName("recordLabel");
let assistpoints4val = new QLabel();
assistpoints4val.setInlineStyle("width: '50px';");
assistpoints4val.setObjectName("recordLabel");
let assistpoints5 = new QLabel();
assistpoints5.setInlineStyle("width: '150px';");
assistpoints5.setObjectName("recordLabel");
let assistpoints5val = new QLabel();
assistpoints5val.setInlineStyle("width: '50px';");
assistpoints5val.setObjectName("recordLabel");
let assistpoints6 = new QLabel();
assistpoints6.setInlineStyle("width: '150px';");
assistpoints6.setObjectName("recordLabel");
let assistpoints6val = new QLabel();
assistpoints6val.setInlineStyle("width: '50px';");
assistpoints6val.setObjectName("recordLabel");
let assistpoints7 = new QLabel();
assistpoints7.setInlineStyle("width: '150px';");
assistpoints7.setObjectName("recordLabel");
let assistpoints7val = new QLabel();
assistpoints7val.setInlineStyle("width: '50px';");
assistpoints7val.setObjectName("recordLabel");
let assistpoints8 = new QLabel();
assistpoints8.setInlineStyle("width: '150px';");
assistpoints8.setObjectName("recordLabel");
let assistpoints8val = new QLabel();
assistpoints8val.setInlineStyle("width: '50px';");
assistpoints8val.setObjectName("recordLabel");
let assistpoints9 = new QLabel();
assistpoints9.setInlineStyle("width: '150px';");
assistpoints9.setObjectName("recordLabel");
let assistpoints9val = new QLabel();
assistpoints9val.setInlineStyle("width: '50px';");
assistpoints9val.setObjectName("recordLabel");
let assistpoints10 = new QLabel();
assistpoints10.setInlineStyle("width: '150px';");
assistpoints10.setObjectName("recordLabel");
let assistpoints10val = new QLabel();
assistpoints10val.setInlineStyle("width: '50px';");
assistpoints10val.setObjectName("recordLabel");

const assistpoints1bar = new QWidget();
assistpoints1bar.setObjectName('assistpoints1bar');
const assistpoints1barLayout = new FlexLayout();
assistpoints1bar.setLayout(assistpoints1barLayout);
assistpoints1bar.setInlineStyle("flex-direction: 'row';")

assistpoints1barLayout.addWidget(assistpoints1);
assistpoints1barLayout.addWidget(assistpoints1val);

const assistpoints2bar = new QWidget();
assistpoints2bar.setObjectName('assistpoints2bar');
const assistpoints2barLayout = new FlexLayout();
assistpoints2bar.setLayout(assistpoints2barLayout);
assistpoints2bar.setInlineStyle("flex-direction: 'row';")

assistpoints2barLayout.addWidget(assistpoints2);
assistpoints2barLayout.addWidget(assistpoints2val);

const assistpoints3bar = new QWidget();
assistpoints3bar.setObjectName('assistpoints3bar');
const assistpoints3barLayout = new FlexLayout();
assistpoints3bar.setLayout(assistpoints3barLayout);
assistpoints3bar.setInlineStyle("flex-direction: 'row';")

assistpoints3barLayout.addWidget(assistpoints3);
assistpoints3barLayout.addWidget(assistpoints3val);

const assistpoints4bar = new QWidget();
assistpoints4bar.setObjectName('assistpoints4bar');
const assistpoints4barLayout = new FlexLayout();
assistpoints4bar.setLayout(assistpoints4barLayout);
assistpoints4bar.setInlineStyle("flex-direction: 'row';")

assistpoints4barLayout.addWidget(assistpoints4);
assistpoints4barLayout.addWidget(assistpoints4val);

const assistpoints5bar = new QWidget();
assistpoints5bar.setObjectName('assistpoints5bar');
const assistpoints5barLayout = new FlexLayout();
assistpoints5bar.setLayout(assistpoints5barLayout);
assistpoints5bar.setInlineStyle("flex-direction: 'row';")

assistpoints5barLayout.addWidget(assistpoints5);
assistpoints5barLayout.addWidget(assistpoints5val);

const assistpoints6bar = new QWidget();
assistpoints6bar.setObjectName('assistpoints6bar');
const assistpoints6barLayout = new FlexLayout();
assistpoints6bar.setLayout(assistpoints6barLayout);
assistpoints6bar.setInlineStyle("flex-direction: 'row';")

assistpoints6barLayout.addWidget(assistpoints6);
assistpoints6barLayout.addWidget(assistpoints6val);

const assistpoints7bar = new QWidget();
assistpoints7bar.setObjectName('assistpoints7bar');
const assistpoints7barLayout = new FlexLayout();
assistpoints7bar.setLayout(assistpoints7barLayout);
assistpoints7bar.setInlineStyle("flex-direction: 'row';")

assistpoints7barLayout.addWidget(assistpoints7);
assistpoints7barLayout.addWidget(assistpoints7val);

const assistpoints8bar = new QWidget();
assistpoints8bar.setObjectName('assistpoints8bar');
const assistpoints8barLayout = new FlexLayout();
assistpoints8bar.setLayout(assistpoints8barLayout);
assistpoints8bar.setInlineStyle("flex-direction: 'row';")

assistpoints8barLayout.addWidget(assistpoints8);
assistpoints8barLayout.addWidget(assistpoints8val);

const assistpoints9bar = new QWidget();
assistpoints9bar.setObjectName('assistpoints9bar');
const assistpoints9barLayout = new FlexLayout();
assistpoints9bar.setLayout(assistpoints9barLayout);
assistpoints9bar.setInlineStyle("flex-direction: 'row';")

assistpoints9barLayout.addWidget(assistpoints9);
assistpoints9barLayout.addWidget(assistpoints9val);

const assistpoints10bar = new QWidget();
assistpoints10bar.setObjectName('assistpoints10bar');
const assistpoints10barLayout = new FlexLayout();
assistpoints10bar.setLayout(assistpoints10barLayout);
assistpoints10bar.setInlineStyle("flex-direction: 'row';")

assistpoints10barLayout.addWidget(assistpoints10);
assistpoints10barLayout.addWidget(assistpoints10val);


const assistpointsBarsArr = [[assistpoints1, assistpoints1val], [assistpoints2, assistpoints2val], [assistpoints3, assistpoints3val], [assistpoints4, assistpoints4val], [assistpoints5, assistpoints5val], [assistpoints6, assistpoints6val], [assistpoints7, assistpoints7val], [assistpoints8, assistpoints8val], [assistpoints9, assistpoints9val], [assistpoints10, assistpoints10val]]

assistpointsTileLayout.addWidget(assistpointsTitle);
assistpointsTileLayout.addWidget(assistpoints1bar);
assistpointsTileLayout.addWidget(assistpoints2bar);
assistpointsTileLayout.addWidget(assistpoints3bar);
assistpointsTileLayout.addWidget(assistpoints4bar);
assistpointsTileLayout.addWidget(assistpoints5bar);
assistpointsTileLayout.addWidget(assistpoints6bar);
assistpointsTileLayout.addWidget(assistpoints7bar);
assistpointsTileLayout.addWidget(assistpoints8bar);
assistpointsTileLayout.addWidget(assistpoints9bar);
assistpointsTileLayout.addWidget(assistpoints10bar);


const brokentacklesTile = new QWidget();
brokentacklesTile.setObjectName('brokentacklesTile');
const brokentacklesTileLayout = new FlexLayout();
brokentacklesTile.setLayout(brokentacklesTileLayout);
brokentacklesTile.setInlineStyle("flex-direction: 'column';");

let brokentacklesTitle = new QLabel();
brokentacklesTitle.setText("BROKEN TACKLES");
brokentacklesTitle.setInlineStyle("height: 50px;");
let brokentackles1 = new QLabel();
brokentackles1.setInlineStyle("width: '150px';");
brokentackles1.setObjectName("recordLabel");
let brokentackles1val = new QLabel();
brokentackles1val.setInlineStyle("width: '50px';");
brokentackles1val.setObjectName("recordLabel");
let brokentackles2 = new QLabel();
brokentackles2.setInlineStyle("width: '150px';");
brokentackles2.setObjectName("recordLabel");
let brokentackles2val = new QLabel();
brokentackles2val.setInlineStyle("width: '50px';");
brokentackles2val.setObjectName("recordLabel");
let brokentackles3 = new QLabel();
brokentackles3.setInlineStyle("width: '150px';");
brokentackles3.setObjectName("recordLabel");
let brokentackles3val = new QLabel();
brokentackles3val.setInlineStyle("width: '50px';");
brokentackles3val.setObjectName("recordLabel");
let brokentackles4 = new QLabel();
brokentackles4.setInlineStyle("width: '150px';");
brokentackles4.setObjectName("recordLabel");
let brokentackles4val = new QLabel();
brokentackles4val.setInlineStyle("width: '50px';");
brokentackles4val.setObjectName("recordLabel");
let brokentackles5 = new QLabel();
brokentackles5.setInlineStyle("width: '150px';");
brokentackles5.setObjectName("recordLabel");
let brokentackles5val = new QLabel();
brokentackles5val.setInlineStyle("width: '50px';");
brokentackles5val.setObjectName("recordLabel");
let brokentackles6 = new QLabel();
brokentackles6.setInlineStyle("width: '150px';");
brokentackles6.setObjectName("recordLabel");
let brokentackles6val = new QLabel();
brokentackles6val.setInlineStyle("width: '50px';");
brokentackles6val.setObjectName("recordLabel");
let brokentackles7 = new QLabel();
brokentackles7.setInlineStyle("width: '150px';");
brokentackles7.setObjectName("recordLabel");
let brokentackles7val = new QLabel();
brokentackles7val.setInlineStyle("width: '50px';");
brokentackles7val.setObjectName("recordLabel");
let brokentackles8 = new QLabel();
brokentackles8.setInlineStyle("width: '150px';");
brokentackles8.setObjectName("recordLabel");
let brokentackles8val = new QLabel();
brokentackles8val.setInlineStyle("width: '50px';");
brokentackles8val.setObjectName("recordLabel");
let brokentackles9 = new QLabel();
brokentackles9.setInlineStyle("width: '150px';");
brokentackles9.setObjectName("recordLabel");
let brokentackles9val = new QLabel();
brokentackles9val.setInlineStyle("width: '50px';");
brokentackles9val.setObjectName("recordLabel");
let brokentackles10 = new QLabel();
brokentackles10.setInlineStyle("width: '150px';");
brokentackles10.setObjectName("recordLabel");
let brokentackles10val = new QLabel();
brokentackles10val.setInlineStyle("width: '50px';");
brokentackles10val.setObjectName("recordLabel");

const brokentackles1bar = new QWidget();
brokentackles1bar.setObjectName('brokentackles1bar');
const brokentackles1barLayout = new FlexLayout();
brokentackles1bar.setLayout(brokentackles1barLayout);
brokentackles1bar.setInlineStyle("flex-direction: 'row';")

brokentackles1barLayout.addWidget(brokentackles1);
brokentackles1barLayout.addWidget(brokentackles1val);

const brokentackles2bar = new QWidget();
brokentackles2bar.setObjectName('brokentackles2bar');
const brokentackles2barLayout = new FlexLayout();
brokentackles2bar.setLayout(brokentackles2barLayout);
brokentackles2bar.setInlineStyle("flex-direction: 'row';")

brokentackles2barLayout.addWidget(brokentackles2);
brokentackles2barLayout.addWidget(brokentackles2val);

const brokentackles3bar = new QWidget();
brokentackles3bar.setObjectName('brokentackles3bar');
const brokentackles3barLayout = new FlexLayout();
brokentackles3bar.setLayout(brokentackles3barLayout);
brokentackles3bar.setInlineStyle("flex-direction: 'row';")

brokentackles3barLayout.addWidget(brokentackles3);
brokentackles3barLayout.addWidget(brokentackles3val);

const brokentackles4bar = new QWidget();
brokentackles4bar.setObjectName('brokentackles4bar');
const brokentackles4barLayout = new FlexLayout();
brokentackles4bar.setLayout(brokentackles4barLayout);
brokentackles4bar.setInlineStyle("flex-direction: 'row';")

brokentackles4barLayout.addWidget(brokentackles4);
brokentackles4barLayout.addWidget(brokentackles4val);

const brokentackles5bar = new QWidget();
brokentackles5bar.setObjectName('brokentackles5bar');
const brokentackles5barLayout = new FlexLayout();
brokentackles5bar.setLayout(brokentackles5barLayout);
brokentackles5bar.setInlineStyle("flex-direction: 'row';")

brokentackles5barLayout.addWidget(brokentackles5);
brokentackles5barLayout.addWidget(brokentackles5val);

const brokentackles6bar = new QWidget();
brokentackles6bar.setObjectName('brokentackles6bar');
const brokentackles6barLayout = new FlexLayout();
brokentackles6bar.setLayout(brokentackles6barLayout);
brokentackles6bar.setInlineStyle("flex-direction: 'row';")

brokentackles6barLayout.addWidget(brokentackles6);
brokentackles6barLayout.addWidget(brokentackles6val);

const brokentackles7bar = new QWidget();
brokentackles7bar.setObjectName('brokentackles7bar');
const brokentackles7barLayout = new FlexLayout();
brokentackles7bar.setLayout(brokentackles7barLayout);
brokentackles7bar.setInlineStyle("flex-direction: 'row';")

brokentackles7barLayout.addWidget(brokentackles7);
brokentackles7barLayout.addWidget(brokentackles7val);

const brokentackles8bar = new QWidget();
brokentackles8bar.setObjectName('brokentackles8bar');
const brokentackles8barLayout = new FlexLayout();
brokentackles8bar.setLayout(brokentackles8barLayout);
brokentackles8bar.setInlineStyle("flex-direction: 'row';")

brokentackles8barLayout.addWidget(brokentackles8);
brokentackles8barLayout.addWidget(brokentackles8val);

const brokentackles9bar = new QWidget();
brokentackles9bar.setObjectName('brokentackles9bar');
const brokentackles9barLayout = new FlexLayout();
brokentackles9bar.setLayout(brokentackles9barLayout);
brokentackles9bar.setInlineStyle("flex-direction: 'row';")

brokentackles9barLayout.addWidget(brokentackles9);
brokentackles9barLayout.addWidget(brokentackles9val);

const brokentackles10bar = new QWidget();
brokentackles10bar.setObjectName('brokentackles10bar');
const brokentackles10barLayout = new FlexLayout();
brokentackles10bar.setLayout(brokentackles10barLayout);
brokentackles10bar.setInlineStyle("flex-direction: 'row';")

brokentackles10barLayout.addWidget(brokentackles10);
brokentackles10barLayout.addWidget(brokentackles10val);


const brokentacklesBarsArr = [[brokentackles1, brokentackles1val], [brokentackles2, brokentackles2val], [brokentackles3, brokentackles3val], [brokentackles4, brokentackles4val], [brokentackles5, brokentackles5val], [brokentackles6, brokentackles6val], [brokentackles7, brokentackles7val], [brokentackles8, brokentackles8val], [brokentackles9, brokentackles9val], [brokentackles10, brokentackles10val]]

brokentacklesTileLayout.addWidget(brokentacklesTitle);
brokentacklesTileLayout.addWidget(brokentackles1bar);
brokentacklesTileLayout.addWidget(brokentackles2bar);
brokentacklesTileLayout.addWidget(brokentackles3bar);
brokentacklesTileLayout.addWidget(brokentackles4bar);
brokentacklesTileLayout.addWidget(brokentackles5bar);
brokentacklesTileLayout.addWidget(brokentackles6bar);
brokentacklesTileLayout.addWidget(brokentackles7bar);
brokentacklesTileLayout.addWidget(brokentackles8bar);
brokentacklesTileLayout.addWidget(brokentackles9bar);
brokentacklesTileLayout.addWidget(brokentackles10bar);


const ballsfieldedoffTile = new QWidget();
ballsfieldedoffTile.setObjectName('ballsfieldedoffTile');
const ballsfieldedoffTileLayout = new FlexLayout();
ballsfieldedoffTile.setLayout(ballsfieldedoffTileLayout);
ballsfieldedoffTile.setInlineStyle("flex-direction: 'column';");

let ballsfieldedoffTitle = new QLabel();
ballsfieldedoffTitle.setText("BALLS FIELDED (OFF)");
ballsfieldedoffTitle.setInlineStyle("height: 50px;");
let ballsfieldedoff1 = new QLabel();
ballsfieldedoff1.setInlineStyle("width: '150px';");
ballsfieldedoff1.setObjectName("recordLabel");
let ballsfieldedoff1val = new QLabel();
ballsfieldedoff1val.setInlineStyle("width: '50px';");
ballsfieldedoff1val.setObjectName("recordLabel");
let ballsfieldedoff2 = new QLabel();
ballsfieldedoff2.setInlineStyle("width: '150px';");
ballsfieldedoff2.setObjectName("recordLabel");
let ballsfieldedoff2val = new QLabel();
ballsfieldedoff2val.setInlineStyle("width: '50px';");
ballsfieldedoff2val.setObjectName("recordLabel");
let ballsfieldedoff3 = new QLabel();
ballsfieldedoff3.setInlineStyle("width: '150px';");
ballsfieldedoff3.setObjectName("recordLabel");
let ballsfieldedoff3val = new QLabel();
ballsfieldedoff3val.setInlineStyle("width: '50px';");
ballsfieldedoff3val.setObjectName("recordLabel");
let ballsfieldedoff4 = new QLabel();
ballsfieldedoff4.setInlineStyle("width: '150px';");
ballsfieldedoff4.setObjectName("recordLabel");
let ballsfieldedoff4val = new QLabel();
ballsfieldedoff4val.setInlineStyle("width: '50px';");
ballsfieldedoff4val.setObjectName("recordLabel");
let ballsfieldedoff5 = new QLabel();
ballsfieldedoff5.setInlineStyle("width: '150px';");
ballsfieldedoff5.setObjectName("recordLabel");
let ballsfieldedoff5val = new QLabel();
ballsfieldedoff5val.setInlineStyle("width: '50px';");
ballsfieldedoff5val.setObjectName("recordLabel");
let ballsfieldedoff6 = new QLabel();
ballsfieldedoff6.setInlineStyle("width: '150px';");
ballsfieldedoff6.setObjectName("recordLabel");
let ballsfieldedoff6val = new QLabel();
ballsfieldedoff6val.setInlineStyle("width: '50px';");
ballsfieldedoff6val.setObjectName("recordLabel");
let ballsfieldedoff7 = new QLabel();
ballsfieldedoff7.setInlineStyle("width: '150px';");
ballsfieldedoff7.setObjectName("recordLabel");
let ballsfieldedoff7val = new QLabel();
ballsfieldedoff7val.setInlineStyle("width: '50px';");
ballsfieldedoff7val.setObjectName("recordLabel");
let ballsfieldedoff8 = new QLabel();
ballsfieldedoff8.setInlineStyle("width: '150px';");
ballsfieldedoff8.setObjectName("recordLabel");
let ballsfieldedoff8val = new QLabel();
ballsfieldedoff8val.setInlineStyle("width: '50px';");
ballsfieldedoff8val.setObjectName("recordLabel");
let ballsfieldedoff9 = new QLabel();
ballsfieldedoff9.setInlineStyle("width: '150px';");
ballsfieldedoff9.setObjectName("recordLabel");
let ballsfieldedoff9val = new QLabel();
ballsfieldedoff9val.setInlineStyle("width: '50px';");
ballsfieldedoff9val.setObjectName("recordLabel");
let ballsfieldedoff10 = new QLabel();
ballsfieldedoff10.setInlineStyle("width: '150px';");
ballsfieldedoff10.setObjectName("recordLabel");
let ballsfieldedoff10val = new QLabel();
ballsfieldedoff10val.setInlineStyle("width: '50px';");
ballsfieldedoff10val.setObjectName("recordLabel");

const ballsfieldedoff1bar = new QWidget();
ballsfieldedoff1bar.setObjectName('ballsfieldedoff1bar');
const ballsfieldedoff1barLayout = new FlexLayout();
ballsfieldedoff1bar.setLayout(ballsfieldedoff1barLayout);
ballsfieldedoff1bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff1barLayout.addWidget(ballsfieldedoff1);
ballsfieldedoff1barLayout.addWidget(ballsfieldedoff1val);

const ballsfieldedoff2bar = new QWidget();
ballsfieldedoff2bar.setObjectName('ballsfieldedoff2bar');
const ballsfieldedoff2barLayout = new FlexLayout();
ballsfieldedoff2bar.setLayout(ballsfieldedoff2barLayout);
ballsfieldedoff2bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff2barLayout.addWidget(ballsfieldedoff2);
ballsfieldedoff2barLayout.addWidget(ballsfieldedoff2val);

const ballsfieldedoff3bar = new QWidget();
ballsfieldedoff3bar.setObjectName('ballsfieldedoff3bar');
const ballsfieldedoff3barLayout = new FlexLayout();
ballsfieldedoff3bar.setLayout(ballsfieldedoff3barLayout);
ballsfieldedoff3bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff3barLayout.addWidget(ballsfieldedoff3);
ballsfieldedoff3barLayout.addWidget(ballsfieldedoff3val);

const ballsfieldedoff4bar = new QWidget();
ballsfieldedoff4bar.setObjectName('ballsfieldedoff4bar');
const ballsfieldedoff4barLayout = new FlexLayout();
ballsfieldedoff4bar.setLayout(ballsfieldedoff4barLayout);
ballsfieldedoff4bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff4barLayout.addWidget(ballsfieldedoff4);
ballsfieldedoff4barLayout.addWidget(ballsfieldedoff4val);

const ballsfieldedoff5bar = new QWidget();
ballsfieldedoff5bar.setObjectName('ballsfieldedoff5bar');
const ballsfieldedoff5barLayout = new FlexLayout();
ballsfieldedoff5bar.setLayout(ballsfieldedoff5barLayout);
ballsfieldedoff5bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff5barLayout.addWidget(ballsfieldedoff5);
ballsfieldedoff5barLayout.addWidget(ballsfieldedoff5val);

const ballsfieldedoff6bar = new QWidget();
ballsfieldedoff6bar.setObjectName('ballsfieldedoff6bar');
const ballsfieldedoff6barLayout = new FlexLayout();
ballsfieldedoff6bar.setLayout(ballsfieldedoff6barLayout);
ballsfieldedoff6bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff6barLayout.addWidget(ballsfieldedoff6);
ballsfieldedoff6barLayout.addWidget(ballsfieldedoff6val);

const ballsfieldedoff7bar = new QWidget();
ballsfieldedoff7bar.setObjectName('ballsfieldedoff7bar');
const ballsfieldedoff7barLayout = new FlexLayout();
ballsfieldedoff7bar.setLayout(ballsfieldedoff7barLayout);
ballsfieldedoff7bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff7barLayout.addWidget(ballsfieldedoff7);
ballsfieldedoff7barLayout.addWidget(ballsfieldedoff7val);

const ballsfieldedoff8bar = new QWidget();
ballsfieldedoff8bar.setObjectName('ballsfieldedoff8bar');
const ballsfieldedoff8barLayout = new FlexLayout();
ballsfieldedoff8bar.setLayout(ballsfieldedoff8barLayout);
ballsfieldedoff8bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff8barLayout.addWidget(ballsfieldedoff8);
ballsfieldedoff8barLayout.addWidget(ballsfieldedoff8val);

const ballsfieldedoff9bar = new QWidget();
ballsfieldedoff9bar.setObjectName('ballsfieldedoff9bar');
const ballsfieldedoff9barLayout = new FlexLayout();
ballsfieldedoff9bar.setLayout(ballsfieldedoff9barLayout);
ballsfieldedoff9bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff9barLayout.addWidget(ballsfieldedoff9);
ballsfieldedoff9barLayout.addWidget(ballsfieldedoff9val);

const ballsfieldedoff10bar = new QWidget();
ballsfieldedoff10bar.setObjectName('ballsfieldedoff10bar');
const ballsfieldedoff10barLayout = new FlexLayout();
ballsfieldedoff10bar.setLayout(ballsfieldedoff10barLayout);
ballsfieldedoff10bar.setInlineStyle("flex-direction: 'row';")

ballsfieldedoff10barLayout.addWidget(ballsfieldedoff10);
ballsfieldedoff10barLayout.addWidget(ballsfieldedoff10val);


const ballsfieldedoffBarsArr = [[ballsfieldedoff1, ballsfieldedoff1val], [ballsfieldedoff2, ballsfieldedoff2val], [ballsfieldedoff3, ballsfieldedoff3val], [ballsfieldedoff4, ballsfieldedoff4val], [ballsfieldedoff5, ballsfieldedoff5val], [ballsfieldedoff6, ballsfieldedoff6val], [ballsfieldedoff7, ballsfieldedoff7val], [ballsfieldedoff8, ballsfieldedoff8val], [ballsfieldedoff9, ballsfieldedoff9val], [ballsfieldedoff10, ballsfieldedoff10val]]

ballsfieldedoffTileLayout.addWidget(ballsfieldedoffTitle);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff1bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff2bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff3bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff4bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff5bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff6bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff7bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff8bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff9bar);
ballsfieldedoffTileLayout.addWidget(ballsfieldedoff10bar);


const blocksTile = new QWidget();
blocksTile.setObjectName('blocksTile');
const blocksTileLayout = new FlexLayout();
blocksTile.setLayout(blocksTileLayout);
blocksTile.setInlineStyle("flex-direction: 'column';");

let blocksTitle = new QLabel();
blocksTitle.setText("BLOCKS");
blocksTitle.setInlineStyle("height: 50px;");
let blocks1 = new QLabel();
blocks1.setInlineStyle("width: '150px';");
blocks1.setObjectName("recordLabel");
let blocks1val = new QLabel();
blocks1val.setInlineStyle("width: '50px';");
blocks1val.setObjectName("recordLabel");
let blocks2 = new QLabel();
blocks2.setInlineStyle("width: '150px';");
blocks2.setObjectName("recordLabel");
let blocks2val = new QLabel();
blocks2val.setInlineStyle("width: '50px';");
blocks2val.setObjectName("recordLabel");
let blocks3 = new QLabel();
blocks3.setInlineStyle("width: '150px';");
blocks3.setObjectName("recordLabel");
let blocks3val = new QLabel();
blocks3val.setInlineStyle("width: '50px';");
blocks3val.setObjectName("recordLabel");
let blocks4 = new QLabel();
blocks4.setInlineStyle("width: '150px';");
blocks4.setObjectName("recordLabel");
let blocks4val = new QLabel();
blocks4val.setInlineStyle("width: '50px';");
blocks4val.setObjectName("recordLabel");
let blocks5 = new QLabel();
blocks5.setInlineStyle("width: '150px';");
blocks5.setObjectName("recordLabel");
let blocks5val = new QLabel();
blocks5val.setInlineStyle("width: '50px';");
blocks5val.setObjectName("recordLabel");
let blocks6 = new QLabel();
blocks6.setInlineStyle("width: '150px';");
blocks6.setObjectName("recordLabel");
let blocks6val = new QLabel();
blocks6val.setInlineStyle("width: '50px';");
blocks6val.setObjectName("recordLabel");
let blocks7 = new QLabel();
blocks7.setInlineStyle("width: '150px';");
blocks7.setObjectName("recordLabel");
let blocks7val = new QLabel();
blocks7val.setInlineStyle("width: '50px';");
blocks7val.setObjectName("recordLabel");
let blocks8 = new QLabel();
blocks8.setInlineStyle("width: '150px';");
blocks8.setObjectName("recordLabel");
let blocks8val = new QLabel();
blocks8val.setInlineStyle("width: '50px';");
blocks8val.setObjectName("recordLabel");
let blocks9 = new QLabel();
blocks9.setInlineStyle("width: '150px';");
blocks9.setObjectName("recordLabel");
let blocks9val = new QLabel();
blocks9val.setInlineStyle("width: '50px';");
blocks9val.setObjectName("recordLabel");
let blocks10 = new QLabel();
blocks10.setInlineStyle("width: '150px';");
blocks10.setObjectName("recordLabel");
let blocks10val = new QLabel();
blocks10val.setInlineStyle("width: '50px';");
blocks10val.setObjectName("recordLabel");

const blocks1bar = new QWidget();
blocks1bar.setObjectName('blocks1bar');
const blocks1barLayout = new FlexLayout();
blocks1bar.setLayout(blocks1barLayout);
blocks1bar.setInlineStyle("flex-direction: 'row';")

blocks1barLayout.addWidget(blocks1);
blocks1barLayout.addWidget(blocks1val);

const blocks2bar = new QWidget();
blocks2bar.setObjectName('blocks2bar');
const blocks2barLayout = new FlexLayout();
blocks2bar.setLayout(blocks2barLayout);
blocks2bar.setInlineStyle("flex-direction: 'row';")

blocks2barLayout.addWidget(blocks2);
blocks2barLayout.addWidget(blocks2val);

const blocks3bar = new QWidget();
blocks3bar.setObjectName('blocks3bar');
const blocks3barLayout = new FlexLayout();
blocks3bar.setLayout(blocks3barLayout);
blocks3bar.setInlineStyle("flex-direction: 'row';")

blocks3barLayout.addWidget(blocks3);
blocks3barLayout.addWidget(blocks3val);

const blocks4bar = new QWidget();
blocks4bar.setObjectName('blocks4bar');
const blocks4barLayout = new FlexLayout();
blocks4bar.setLayout(blocks4barLayout);
blocks4bar.setInlineStyle("flex-direction: 'row';")

blocks4barLayout.addWidget(blocks4);
blocks4barLayout.addWidget(blocks4val);

const blocks5bar = new QWidget();
blocks5bar.setObjectName('blocks5bar');
const blocks5barLayout = new FlexLayout();
blocks5bar.setLayout(blocks5barLayout);
blocks5bar.setInlineStyle("flex-direction: 'row';")

blocks5barLayout.addWidget(blocks5);
blocks5barLayout.addWidget(blocks5val);

const blocks6bar = new QWidget();
blocks6bar.setObjectName('blocks6bar');
const blocks6barLayout = new FlexLayout();
blocks6bar.setLayout(blocks6barLayout);
blocks6bar.setInlineStyle("flex-direction: 'row';")

blocks6barLayout.addWidget(blocks6);
blocks6barLayout.addWidget(blocks6val);

const blocks7bar = new QWidget();
blocks7bar.setObjectName('blocks7bar');
const blocks7barLayout = new FlexLayout();
blocks7bar.setLayout(blocks7barLayout);
blocks7bar.setInlineStyle("flex-direction: 'row';")

blocks7barLayout.addWidget(blocks7);
blocks7barLayout.addWidget(blocks7val);

const blocks8bar = new QWidget();
blocks8bar.setObjectName('blocks8bar');
const blocks8barLayout = new FlexLayout();
blocks8bar.setLayout(blocks8barLayout);
blocks8bar.setInlineStyle("flex-direction: 'row';")

blocks8barLayout.addWidget(blocks8);
blocks8barLayout.addWidget(blocks8val);

const blocks9bar = new QWidget();
blocks9bar.setObjectName('blocks9bar');
const blocks9barLayout = new FlexLayout();
blocks9bar.setLayout(blocks9barLayout);
blocks9bar.setInlineStyle("flex-direction: 'row';")

blocks9barLayout.addWidget(blocks9);
blocks9barLayout.addWidget(blocks9val);

const blocks10bar = new QWidget();
blocks10bar.setObjectName('blocks10bar');
const blocks10barLayout = new FlexLayout();
blocks10bar.setLayout(blocks10barLayout);
blocks10bar.setInlineStyle("flex-direction: 'row';")

blocks10barLayout.addWidget(blocks10);
blocks10barLayout.addWidget(blocks10val);


const blocksBarsArr = [[blocks1, blocks1val], [blocks2, blocks2val], [blocks3, blocks3val], [blocks4, blocks4val], [blocks5, blocks5val], [blocks6, blocks6val], [blocks7, blocks7val], [blocks8, blocks8val], [blocks9, blocks9val], [blocks10, blocks10val]]

blocksTileLayout.addWidget(blocksTitle);
blocksTileLayout.addWidget(blocks1bar);
blocksTileLayout.addWidget(blocks2bar);
blocksTileLayout.addWidget(blocks3bar);
blocksTileLayout.addWidget(blocks4bar);
blocksTileLayout.addWidget(blocks5bar);
blocksTileLayout.addWidget(blocks6bar);
blocksTileLayout.addWidget(blocks7bar);
blocksTileLayout.addWidget(blocks8bar);
blocksTileLayout.addWidget(blocks9bar);
blocksTileLayout.addWidget(blocks10bar);

const turnoversTile = new QWidget();
turnoversTile.setObjectName('turnoversTile');
const turnoversTileLayout = new FlexLayout();
turnoversTile.setLayout(turnoversTileLayout);
turnoversTile.setInlineStyle("flex-direction: 'column';");

let turnoversTitle = new QLabel();
turnoversTitle.setText("TURNOVERS");
turnoversTitle.setInlineStyle("height: 50px;");
let turnovers1 = new QLabel();
turnovers1.setInlineStyle("width: '150px';");
turnovers1.setObjectName("recordLabel");
let turnovers1val = new QLabel();
turnovers1val.setInlineStyle("width: '50px';");
turnovers1val.setObjectName("recordLabel");
let turnovers2 = new QLabel();
turnovers2.setInlineStyle("width: '150px';");
turnovers2.setObjectName("recordLabel");
let turnovers2val = new QLabel();
turnovers2val.setInlineStyle("width: '50px';");
turnovers2val.setObjectName("recordLabel");
let turnovers3 = new QLabel();
turnovers3.setInlineStyle("width: '150px';");
turnovers3.setObjectName("recordLabel");
let turnovers3val = new QLabel();
turnovers3val.setInlineStyle("width: '50px';");
turnovers3val.setObjectName("recordLabel");
let turnovers4 = new QLabel();
turnovers4.setInlineStyle("width: '150px';");
turnovers4.setObjectName("recordLabel");
let turnovers4val = new QLabel();
turnovers4val.setInlineStyle("width: '50px';");
turnovers4val.setObjectName("recordLabel");
let turnovers5 = new QLabel();
turnovers5.setInlineStyle("width: '150px';");
turnovers5.setObjectName("recordLabel");
let turnovers5val = new QLabel();
turnovers5val.setInlineStyle("width: '50px';");
turnovers5val.setObjectName("recordLabel");
let turnovers6 = new QLabel();
turnovers6.setInlineStyle("width: '150px';");
turnovers6.setObjectName("recordLabel");
let turnovers6val = new QLabel();
turnovers6val.setInlineStyle("width: '50px';");
turnovers6val.setObjectName("recordLabel");
let turnovers7 = new QLabel();
turnovers7.setInlineStyle("width: '150px';");
turnovers7.setObjectName("recordLabel");
let turnovers7val = new QLabel();
turnovers7val.setInlineStyle("width: '50px';");
turnovers7val.setObjectName("recordLabel");
let turnovers8 = new QLabel();
turnovers8.setInlineStyle("width: '150px';");
turnovers8.setObjectName("recordLabel");
let turnovers8val = new QLabel();
turnovers8val.setInlineStyle("width: '50px';");
turnovers8val.setObjectName("recordLabel");
let turnovers9 = new QLabel();
turnovers9.setInlineStyle("width: '150px';");
turnovers9.setObjectName("recordLabel");
let turnovers9val = new QLabel();
turnovers9val.setInlineStyle("width: '50px';");
turnovers9val.setObjectName("recordLabel");
let turnovers10 = new QLabel();
turnovers10.setInlineStyle("width: '150px';");
turnovers10.setObjectName("recordLabel");
let turnovers10val = new QLabel();
turnovers10val.setInlineStyle("width: '50px';");
turnovers10val.setObjectName("recordLabel");

const turnovers1bar = new QWidget();
turnovers1bar.setObjectName('turnovers1bar');
const turnovers1barLayout = new FlexLayout();
turnovers1bar.setLayout(turnovers1barLayout);
turnovers1bar.setInlineStyle("flex-direction: 'row';")

turnovers1barLayout.addWidget(turnovers1);
turnovers1barLayout.addWidget(turnovers1val);

const turnovers2bar = new QWidget();
turnovers2bar.setObjectName('turnovers2bar');
const turnovers2barLayout = new FlexLayout();
turnovers2bar.setLayout(turnovers2barLayout);
turnovers2bar.setInlineStyle("flex-direction: 'row';")

turnovers2barLayout.addWidget(turnovers2);
turnovers2barLayout.addWidget(turnovers2val);

const turnovers3bar = new QWidget();
turnovers3bar.setObjectName('turnovers3bar');
const turnovers3barLayout = new FlexLayout();
turnovers3bar.setLayout(turnovers3barLayout);
turnovers3bar.setInlineStyle("flex-direction: 'row';")

turnovers3barLayout.addWidget(turnovers3);
turnovers3barLayout.addWidget(turnovers3val);

const turnovers4bar = new QWidget();
turnovers4bar.setObjectName('turnovers4bar');
const turnovers4barLayout = new FlexLayout();
turnovers4bar.setLayout(turnovers4barLayout);
turnovers4bar.setInlineStyle("flex-direction: 'row';")

turnovers4barLayout.addWidget(turnovers4);
turnovers4barLayout.addWidget(turnovers4val);

const turnovers5bar = new QWidget();
turnovers5bar.setObjectName('turnovers5bar');
const turnovers5barLayout = new FlexLayout();
turnovers5bar.setLayout(turnovers5barLayout);
turnovers5bar.setInlineStyle("flex-direction: 'row';")

turnovers5barLayout.addWidget(turnovers5);
turnovers5barLayout.addWidget(turnovers5val);

const turnovers6bar = new QWidget();
turnovers6bar.setObjectName('turnovers6bar');
const turnovers6barLayout = new FlexLayout();
turnovers6bar.setLayout(turnovers6barLayout);
turnovers6bar.setInlineStyle("flex-direction: 'row';")

turnovers6barLayout.addWidget(turnovers6);
turnovers6barLayout.addWidget(turnovers6val);

const turnovers7bar = new QWidget();
turnovers7bar.setObjectName('turnovers7bar');
const turnovers7barLayout = new FlexLayout();
turnovers7bar.setLayout(turnovers7barLayout);
turnovers7bar.setInlineStyle("flex-direction: 'row';")

turnovers7barLayout.addWidget(turnovers7);
turnovers7barLayout.addWidget(turnovers7val);

const turnovers8bar = new QWidget();
turnovers8bar.setObjectName('turnovers8bar');
const turnovers8barLayout = new FlexLayout();
turnovers8bar.setLayout(turnovers8barLayout);
turnovers8bar.setInlineStyle("flex-direction: 'row';")

turnovers8barLayout.addWidget(turnovers8);
turnovers8barLayout.addWidget(turnovers8val);

const turnovers9bar = new QWidget();
turnovers9bar.setObjectName('turnovers9bar');
const turnovers9barLayout = new FlexLayout();
turnovers9bar.setLayout(turnovers9barLayout);
turnovers9bar.setInlineStyle("flex-direction: 'row';")

turnovers9barLayout.addWidget(turnovers9);
turnovers9barLayout.addWidget(turnovers9val);

const turnovers10bar = new QWidget();
turnovers10bar.setObjectName('turnovers10bar');
const turnovers10barLayout = new FlexLayout();
turnovers10bar.setLayout(turnovers10barLayout);
turnovers10bar.setInlineStyle("flex-direction: 'row';")

turnovers10barLayout.addWidget(turnovers10);
turnovers10barLayout.addWidget(turnovers10val);


const turnoversBarsArr = [[turnovers1, turnovers1val], [turnovers2, turnovers2val], [turnovers3, turnovers3val], [turnovers4, turnovers4val], [turnovers5, turnovers5val], [turnovers6, turnovers6val], [turnovers7, turnovers7val], [turnovers8, turnovers8val], [turnovers9, turnovers9val], [turnovers10, turnovers10val]]

turnoversTileLayout.addWidget(turnoversTitle);
turnoversTileLayout.addWidget(turnovers1bar);
turnoversTileLayout.addWidget(turnovers2bar);
turnoversTileLayout.addWidget(turnovers3bar);
turnoversTileLayout.addWidget(turnovers4bar);
turnoversTileLayout.addWidget(turnovers5bar);
turnoversTileLayout.addWidget(turnovers6bar);
turnoversTileLayout.addWidget(turnovers7bar);
turnoversTileLayout.addWidget(turnovers8bar);
turnoversTileLayout.addWidget(turnovers9bar);
turnoversTileLayout.addWidget(turnovers10bar);


const pitchesTile = new QWidget();
pitchesTile.setObjectName('pitchesTile');
const pitchesTileLayout = new FlexLayout();
pitchesTile.setLayout(pitchesTileLayout);
pitchesTile.setInlineStyle("flex-direction: 'column';");

let pitchesTitle = new QLabel();
pitchesTitle.setText("PITCHES");
pitchesTitle.setInlineStyle("height: 50px;");
let pitches1 = new QLabel();
pitches1.setInlineStyle("width: '150px';");
pitches1.setObjectName("recordLabel");
let pitches1val = new QLabel();
pitches1val.setInlineStyle("width: '50px';");
pitches1val.setObjectName("recordLabel");
let pitches2 = new QLabel();
pitches2.setInlineStyle("width: '150px';");
pitches2.setObjectName("recordLabel");
let pitches2val = new QLabel();
pitches2val.setInlineStyle("width: '50px';");
pitches2val.setObjectName("recordLabel");
let pitches3 = new QLabel();
pitches3.setInlineStyle("width: '150px';");
pitches3.setObjectName("recordLabel");
let pitches3val = new QLabel();
pitches3val.setInlineStyle("width: '50px';");
pitches3val.setObjectName("recordLabel");
let pitches4 = new QLabel();
pitches4.setInlineStyle("width: '150px';");
pitches4.setObjectName("recordLabel");
let pitches4val = new QLabel();
pitches4val.setInlineStyle("width: '50px';");
pitches4val.setObjectName("recordLabel");
let pitches5 = new QLabel();
pitches5.setInlineStyle("width: '150px';");
pitches5.setObjectName("recordLabel");
let pitches5val = new QLabel();
pitches5val.setInlineStyle("width: '50px';");
pitches5val.setObjectName("recordLabel");
let pitches6 = new QLabel();
pitches6.setInlineStyle("width: '150px';");
pitches6.setObjectName("recordLabel");
let pitches6val = new QLabel();
pitches6val.setInlineStyle("width: '50px';");
pitches6val.setObjectName("recordLabel");
let pitches7 = new QLabel();
pitches7.setInlineStyle("width: '150px';");
pitches7.setObjectName("recordLabel");
let pitches7val = new QLabel();
pitches7val.setInlineStyle("width: '50px';");
pitches7val.setObjectName("recordLabel");
let pitches8 = new QLabel();
pitches8.setInlineStyle("width: '150px';");
pitches8.setObjectName("recordLabel");
let pitches8val = new QLabel();
pitches8val.setInlineStyle("width: '50px';");
pitches8val.setObjectName("recordLabel");
let pitches9 = new QLabel();
pitches9.setInlineStyle("width: '150px';");
pitches9.setObjectName("recordLabel");
let pitches9val = new QLabel();
pitches9val.setInlineStyle("width: '50px';");
pitches9val.setObjectName("recordLabel");
let pitches10 = new QLabel();
pitches10.setInlineStyle("width: '150px';");
pitches10.setObjectName("recordLabel");
let pitches10val = new QLabel();
pitches10val.setInlineStyle("width: '50px';");
pitches10val.setObjectName("recordLabel");

const pitches1bar = new QWidget();
pitches1bar.setObjectName('pitches1bar');
const pitches1barLayout = new FlexLayout();
pitches1bar.setLayout(pitches1barLayout);
pitches1bar.setInlineStyle("flex-direction: 'row';")

pitches1barLayout.addWidget(pitches1);
pitches1barLayout.addWidget(pitches1val);

const pitches2bar = new QWidget();
pitches2bar.setObjectName('pitches2bar');
const pitches2barLayout = new FlexLayout();
pitches2bar.setLayout(pitches2barLayout);
pitches2bar.setInlineStyle("flex-direction: 'row';")

pitches2barLayout.addWidget(pitches2);
pitches2barLayout.addWidget(pitches2val);

const pitches3bar = new QWidget();
pitches3bar.setObjectName('pitches3bar');
const pitches3barLayout = new FlexLayout();
pitches3bar.setLayout(pitches3barLayout);
pitches3bar.setInlineStyle("flex-direction: 'row';")

pitches3barLayout.addWidget(pitches3);
pitches3barLayout.addWidget(pitches3val);

const pitches4bar = new QWidget();
pitches4bar.setObjectName('pitches4bar');
const pitches4barLayout = new FlexLayout();
pitches4bar.setLayout(pitches4barLayout);
pitches4bar.setInlineStyle("flex-direction: 'row';")

pitches4barLayout.addWidget(pitches4);
pitches4barLayout.addWidget(pitches4val);

const pitches5bar = new QWidget();
pitches5bar.setObjectName('pitches5bar');
const pitches5barLayout = new FlexLayout();
pitches5bar.setLayout(pitches5barLayout);
pitches5bar.setInlineStyle("flex-direction: 'row';")

pitches5barLayout.addWidget(pitches5);
pitches5barLayout.addWidget(pitches5val);

const pitches6bar = new QWidget();
pitches6bar.setObjectName('pitches6bar');
const pitches6barLayout = new FlexLayout();
pitches6bar.setLayout(pitches6barLayout);
pitches6bar.setInlineStyle("flex-direction: 'row';")

pitches6barLayout.addWidget(pitches6);
pitches6barLayout.addWidget(pitches6val);

const pitches7bar = new QWidget();
pitches7bar.setObjectName('pitches7bar');
const pitches7barLayout = new FlexLayout();
pitches7bar.setLayout(pitches7barLayout);
pitches7bar.setInlineStyle("flex-direction: 'row';")

pitches7barLayout.addWidget(pitches7);
pitches7barLayout.addWidget(pitches7val);

const pitches8bar = new QWidget();
pitches8bar.setObjectName('pitches8bar');
const pitches8barLayout = new FlexLayout();
pitches8bar.setLayout(pitches8barLayout);
pitches8bar.setInlineStyle("flex-direction: 'row';")

pitches8barLayout.addWidget(pitches8);
pitches8barLayout.addWidget(pitches8val);

const pitches9bar = new QWidget();
pitches9bar.setObjectName('pitches9bar');
const pitches9barLayout = new FlexLayout();
pitches9bar.setLayout(pitches9barLayout);
pitches9bar.setInlineStyle("flex-direction: 'row';")

pitches9barLayout.addWidget(pitches9);
pitches9barLayout.addWidget(pitches9val);

const pitches10bar = new QWidget();
pitches10bar.setObjectName('pitches10bar');
const pitches10barLayout = new FlexLayout();
pitches10bar.setLayout(pitches10barLayout);
pitches10bar.setInlineStyle("flex-direction: 'row';")

pitches10barLayout.addWidget(pitches10);
pitches10barLayout.addWidget(pitches10val);


const pitchesBarsArr = [[pitches1, pitches1val], [pitches2, pitches2val], [pitches3, pitches3val], [pitches4, pitches4val], [pitches5, pitches5val], [pitches6, pitches6val], [pitches7, pitches7val], [pitches8, pitches8val], [pitches9, pitches9val], [pitches10, pitches10val]]

pitchesTileLayout.addWidget(pitchesTitle);
pitchesTileLayout.addWidget(pitches1bar);
pitchesTileLayout.addWidget(pitches2bar);
pitchesTileLayout.addWidget(pitches3bar);
pitchesTileLayout.addWidget(pitches4bar);
pitchesTileLayout.addWidget(pitches5bar);
pitchesTileLayout.addWidget(pitches6bar);
pitchesTileLayout.addWidget(pitches7bar);
pitchesTileLayout.addWidget(pitches8bar);
pitchesTileLayout.addWidget(pitches9bar);
pitchesTileLayout.addWidget(pitches10bar);


const strikesTile = new QWidget();
strikesTile.setObjectName('strikesTile');
const strikesTileLayout = new FlexLayout();
strikesTile.setLayout(strikesTileLayout);
strikesTile.setInlineStyle("flex-direction: 'column';");

let strikesTitle = new QLabel();
strikesTitle.setText("STRIKES");
strikesTitle.setInlineStyle("height: 50px;");
let strikes1 = new QLabel();
strikes1.setInlineStyle("width: '150px';");
strikes1.setObjectName("recordLabel");
let strikes1val = new QLabel();
strikes1val.setInlineStyle("width: '50px';");
strikes1val.setObjectName("recordLabel");
let strikes2 = new QLabel();
strikes2.setInlineStyle("width: '150px';");
strikes2.setObjectName("recordLabel");
let strikes2val = new QLabel();
strikes2val.setInlineStyle("width: '50px';");
strikes2val.setObjectName("recordLabel");
let strikes3 = new QLabel();
strikes3.setInlineStyle("width: '150px';");
strikes3.setObjectName("recordLabel");
let strikes3val = new QLabel();
strikes3val.setInlineStyle("width: '50px';");
strikes3val.setObjectName("recordLabel");
let strikes4 = new QLabel();
strikes4.setInlineStyle("width: '150px';");
strikes4.setObjectName("recordLabel");
let strikes4val = new QLabel();
strikes4val.setInlineStyle("width: '50px';");
strikes4val.setObjectName("recordLabel");
let strikes5 = new QLabel();
strikes5.setInlineStyle("width: '150px';");
strikes5.setObjectName("recordLabel");
let strikes5val = new QLabel();
strikes5val.setInlineStyle("width: '50px';");
strikes5val.setObjectName("recordLabel");
let strikes6 = new QLabel();
strikes6.setInlineStyle("width: '150px';");
strikes6.setObjectName("recordLabel");
let strikes6val = new QLabel();
strikes6val.setInlineStyle("width: '50px';");
strikes6val.setObjectName("recordLabel");
let strikes7 = new QLabel();
strikes7.setInlineStyle("width: '150px';");
strikes7.setObjectName("recordLabel");
let strikes7val = new QLabel();
strikes7val.setInlineStyle("width: '50px';");
strikes7val.setObjectName("recordLabel");
let strikes8 = new QLabel();
strikes8.setInlineStyle("width: '150px';");
strikes8.setObjectName("recordLabel");
let strikes8val = new QLabel();
strikes8val.setInlineStyle("width: '50px';");
strikes8val.setObjectName("recordLabel");
let strikes9 = new QLabel();
strikes9.setInlineStyle("width: '150px';");
strikes9.setObjectName("recordLabel");
let strikes9val = new QLabel();
strikes9val.setInlineStyle("width: '50px';");
strikes9val.setObjectName("recordLabel");
let strikes10 = new QLabel();
strikes10.setInlineStyle("width: '150px';");
strikes10.setObjectName("recordLabel");
let strikes10val = new QLabel();
strikes10val.setInlineStyle("width: '50px';");
strikes10val.setObjectName("recordLabel");

const strikes1bar = new QWidget();
strikes1bar.setObjectName('strikes1bar');
const strikes1barLayout = new FlexLayout();
strikes1bar.setLayout(strikes1barLayout);
strikes1bar.setInlineStyle("flex-direction: 'row';")

strikes1barLayout.addWidget(strikes1);
strikes1barLayout.addWidget(strikes1val);

const strikes2bar = new QWidget();
strikes2bar.setObjectName('strikes2bar');
const strikes2barLayout = new FlexLayout();
strikes2bar.setLayout(strikes2barLayout);
strikes2bar.setInlineStyle("flex-direction: 'row';")

strikes2barLayout.addWidget(strikes2);
strikes2barLayout.addWidget(strikes2val);

const strikes3bar = new QWidget();
strikes3bar.setObjectName('strikes3bar');
const strikes3barLayout = new FlexLayout();
strikes3bar.setLayout(strikes3barLayout);
strikes3bar.setInlineStyle("flex-direction: 'row';")

strikes3barLayout.addWidget(strikes3);
strikes3barLayout.addWidget(strikes3val);

const strikes4bar = new QWidget();
strikes4bar.setObjectName('strikes4bar');
const strikes4barLayout = new FlexLayout();
strikes4bar.setLayout(strikes4barLayout);
strikes4bar.setInlineStyle("flex-direction: 'row';")

strikes4barLayout.addWidget(strikes4);
strikes4barLayout.addWidget(strikes4val);

const strikes5bar = new QWidget();
strikes5bar.setObjectName('strikes5bar');
const strikes5barLayout = new FlexLayout();
strikes5bar.setLayout(strikes5barLayout);
strikes5bar.setInlineStyle("flex-direction: 'row';")

strikes5barLayout.addWidget(strikes5);
strikes5barLayout.addWidget(strikes5val);

const strikes6bar = new QWidget();
strikes6bar.setObjectName('strikes6bar');
const strikes6barLayout = new FlexLayout();
strikes6bar.setLayout(strikes6barLayout);
strikes6bar.setInlineStyle("flex-direction: 'row';")

strikes6barLayout.addWidget(strikes6);
strikes6barLayout.addWidget(strikes6val);

const strikes7bar = new QWidget();
strikes7bar.setObjectName('strikes7bar');
const strikes7barLayout = new FlexLayout();
strikes7bar.setLayout(strikes7barLayout);
strikes7bar.setInlineStyle("flex-direction: 'row';")

strikes7barLayout.addWidget(strikes7);
strikes7barLayout.addWidget(strikes7val);

const strikes8bar = new QWidget();
strikes8bar.setObjectName('strikes8bar');
const strikes8barLayout = new FlexLayout();
strikes8bar.setLayout(strikes8barLayout);
strikes8bar.setInlineStyle("flex-direction: 'row';")

strikes8barLayout.addWidget(strikes8);
strikes8barLayout.addWidget(strikes8val);

const strikes9bar = new QWidget();
strikes9bar.setObjectName('strikes9bar');
const strikes9barLayout = new FlexLayout();
strikes9bar.setLayout(strikes9barLayout);
strikes9bar.setInlineStyle("flex-direction: 'row';")

strikes9barLayout.addWidget(strikes9);
strikes9barLayout.addWidget(strikes9val);

const strikes10bar = new QWidget();
strikes10bar.setObjectName('strikes10bar');
const strikes10barLayout = new FlexLayout();
strikes10bar.setLayout(strikes10barLayout);
strikes10bar.setInlineStyle("flex-direction: 'row';")

strikes10barLayout.addWidget(strikes10);
strikes10barLayout.addWidget(strikes10val);


const strikesBarsArr = [[strikes1, strikes1val], [strikes2, strikes2val], [strikes3, strikes3val], [strikes4, strikes4val], [strikes5, strikes5val], [strikes6, strikes6val], [strikes7, strikes7val], [strikes8, strikes8val], [strikes9, strikes9val], [strikes10, strikes10val]]

strikesTileLayout.addWidget(strikesTitle);
strikesTileLayout.addWidget(strikes1bar);
strikesTileLayout.addWidget(strikes2bar);
strikesTileLayout.addWidget(strikes3bar);
strikesTileLayout.addWidget(strikes4bar);
strikesTileLayout.addWidget(strikes5bar);
strikesTileLayout.addWidget(strikes6bar);
strikesTileLayout.addWidget(strikes7bar);
strikesTileLayout.addWidget(strikes8bar);
strikesTileLayout.addWidget(strikes9bar);
strikesTileLayout.addWidget(strikes10bar);


const ballsTile = new QWidget();
ballsTile.setObjectName('ballsTile');
const ballsTileLayout = new FlexLayout();
ballsTile.setLayout(ballsTileLayout);
ballsTile.setInlineStyle("flex-direction: 'column';");

let ballsTitle = new QLabel();
ballsTitle.setText("BALLS");
ballsTitle.setInlineStyle("height: 50px;");
let balls1 = new QLabel();
balls1.setInlineStyle("width: '150px';");
balls1.setObjectName("recordLabel");
let balls1val = new QLabel();
balls1val.setInlineStyle("width: '50px';");
balls1val.setObjectName("recordLabel");
let balls2 = new QLabel();
balls2.setInlineStyle("width: '150px';");
balls2.setObjectName("recordLabel");
let balls2val = new QLabel();
balls2val.setInlineStyle("width: '50px';");
balls2val.setObjectName("recordLabel");
let balls3 = new QLabel();
balls3.setInlineStyle("width: '150px';");
balls3.setObjectName("recordLabel");
let balls3val = new QLabel();
balls3val.setInlineStyle("width: '50px';");
balls3val.setObjectName("recordLabel");
let balls4 = new QLabel();
balls4.setInlineStyle("width: '150px';");
balls4.setObjectName("recordLabel");
let balls4val = new QLabel();
balls4val.setInlineStyle("width: '50px';");
balls4val.setObjectName("recordLabel");
let balls5 = new QLabel();
balls5.setInlineStyle("width: '150px';");
balls5.setObjectName("recordLabel");
let balls5val = new QLabel();
balls5val.setInlineStyle("width: '50px';");
balls5val.setObjectName("recordLabel");
let balls6 = new QLabel();
balls6.setInlineStyle("width: '150px';");
balls6.setObjectName("recordLabel");
let balls6val = new QLabel();
balls6val.setInlineStyle("width: '50px';");
balls6val.setObjectName("recordLabel");
let balls7 = new QLabel();
balls7.setInlineStyle("width: '150px';");
balls7.setObjectName("recordLabel");
let balls7val = new QLabel();
balls7val.setInlineStyle("width: '50px';");
balls7val.setObjectName("recordLabel");
let balls8 = new QLabel();
balls8.setInlineStyle("width: '150px';");
balls8.setObjectName("recordLabel");
let balls8val = new QLabel();
balls8val.setInlineStyle("width: '50px';");
balls8val.setObjectName("recordLabel");
let balls9 = new QLabel();
balls9.setInlineStyle("width: '150px';");
balls9.setObjectName("recordLabel");
let balls9val = new QLabel();
balls9val.setInlineStyle("width: '50px';");
balls9val.setObjectName("recordLabel");
let balls10 = new QLabel();
balls10.setInlineStyle("width: '150px';");
balls10.setObjectName("recordLabel");
let balls10val = new QLabel();
balls10val.setInlineStyle("width: '50px';");
balls10val.setObjectName("recordLabel");

const balls1bar = new QWidget();
balls1bar.setObjectName('balls1bar');
const balls1barLayout = new FlexLayout();
balls1bar.setLayout(balls1barLayout);
balls1bar.setInlineStyle("flex-direction: 'row';")

balls1barLayout.addWidget(balls1);
balls1barLayout.addWidget(balls1val);

const balls2bar = new QWidget();
balls2bar.setObjectName('balls2bar');
const balls2barLayout = new FlexLayout();
balls2bar.setLayout(balls2barLayout);
balls2bar.setInlineStyle("flex-direction: 'row';")

balls2barLayout.addWidget(balls2);
balls2barLayout.addWidget(balls2val);

const balls3bar = new QWidget();
balls3bar.setObjectName('balls3bar');
const balls3barLayout = new FlexLayout();
balls3bar.setLayout(balls3barLayout);
balls3bar.setInlineStyle("flex-direction: 'row';")

balls3barLayout.addWidget(balls3);
balls3barLayout.addWidget(balls3val);

const balls4bar = new QWidget();
balls4bar.setObjectName('balls4bar');
const balls4barLayout = new FlexLayout();
balls4bar.setLayout(balls4barLayout);
balls4bar.setInlineStyle("flex-direction: 'row';")

balls4barLayout.addWidget(balls4);
balls4barLayout.addWidget(balls4val);

const balls5bar = new QWidget();
balls5bar.setObjectName('balls5bar');
const balls5barLayout = new FlexLayout();
balls5bar.setLayout(balls5barLayout);
balls5bar.setInlineStyle("flex-direction: 'row';")

balls5barLayout.addWidget(balls5);
balls5barLayout.addWidget(balls5val);

const balls6bar = new QWidget();
balls6bar.setObjectName('balls6bar');
const balls6barLayout = new FlexLayout();
balls6bar.setLayout(balls6barLayout);
balls6bar.setInlineStyle("flex-direction: 'row';")

balls6barLayout.addWidget(balls6);
balls6barLayout.addWidget(balls6val);

const balls7bar = new QWidget();
balls7bar.setObjectName('balls7bar');
const balls7barLayout = new FlexLayout();
balls7bar.setLayout(balls7barLayout);
balls7bar.setInlineStyle("flex-direction: 'row';")

balls7barLayout.addWidget(balls7);
balls7barLayout.addWidget(balls7val);

const balls8bar = new QWidget();
balls8bar.setObjectName('balls8bar');
const balls8barLayout = new FlexLayout();
balls8bar.setLayout(balls8barLayout);
balls8bar.setInlineStyle("flex-direction: 'row';")

balls8barLayout.addWidget(balls8);
balls8barLayout.addWidget(balls8val);

const balls9bar = new QWidget();
balls9bar.setObjectName('balls9bar');
const balls9barLayout = new FlexLayout();
balls9bar.setLayout(balls9barLayout);
balls9bar.setInlineStyle("flex-direction: 'row';")

balls9barLayout.addWidget(balls9);
balls9barLayout.addWidget(balls9val);

const balls10bar = new QWidget();
balls10bar.setObjectName('balls10bar');
const balls10barLayout = new FlexLayout();
balls10bar.setLayout(balls10barLayout);
balls10bar.setInlineStyle("flex-direction: 'row';")

balls10barLayout.addWidget(balls10);
balls10barLayout.addWidget(balls10val);


const ballsBarsArr = [[balls1, balls1val], [balls2, balls2val], [balls3, balls3val], [balls4, balls4val], [balls5, balls5val], [balls6, balls6val], [balls7, balls7val], [balls8, balls8val], [balls9, balls9val], [balls10, balls10val]]

ballsTileLayout.addWidget(ballsTitle);
ballsTileLayout.addWidget(balls1bar);
ballsTileLayout.addWidget(balls2bar);
ballsTileLayout.addWidget(balls3bar);
ballsTileLayout.addWidget(balls4bar);
ballsTileLayout.addWidget(balls5bar);
ballsTileLayout.addWidget(balls6bar);
ballsTileLayout.addWidget(balls7bar);
ballsTileLayout.addWidget(balls8bar);
ballsTileLayout.addWidget(balls9bar);
ballsTileLayout.addWidget(balls10bar);


const foulsTile = new QWidget();
foulsTile.setObjectName('foulsTile');
const foulsTileLayout = new FlexLayout();
foulsTile.setLayout(foulsTileLayout);
foulsTile.setInlineStyle("flex-direction: 'column';");

let foulsTitle = new QLabel();
foulsTitle.setText("FOULS");
foulsTitle.setInlineStyle("height: 50px;");
let fouls1 = new QLabel();
fouls1.setInlineStyle("width: '150px';");
fouls1.setObjectName("recordLabel");
let fouls1val = new QLabel();
fouls1val.setInlineStyle("width: '50px';");
fouls1val.setObjectName("recordLabel");
let fouls2 = new QLabel();
fouls2.setInlineStyle("width: '150px';");
fouls2.setObjectName("recordLabel");
let fouls2val = new QLabel();
fouls2val.setInlineStyle("width: '50px';");
fouls2val.setObjectName("recordLabel");
let fouls3 = new QLabel();
fouls3.setInlineStyle("width: '150px';");
fouls3.setObjectName("recordLabel");
let fouls3val = new QLabel();
fouls3val.setInlineStyle("width: '50px';");
fouls3val.setObjectName("recordLabel");
let fouls4 = new QLabel();
fouls4.setInlineStyle("width: '150px';");
fouls4.setObjectName("recordLabel");
let fouls4val = new QLabel();
fouls4val.setInlineStyle("width: '50px';");
fouls4val.setObjectName("recordLabel");
let fouls5 = new QLabel();
fouls5.setInlineStyle("width: '150px';");
fouls5.setObjectName("recordLabel");
let fouls5val = new QLabel();
fouls5val.setInlineStyle("width: '50px';");
fouls5val.setObjectName("recordLabel");
let fouls6 = new QLabel();
fouls6.setInlineStyle("width: '150px';");
fouls6.setObjectName("recordLabel");
let fouls6val = new QLabel();
fouls6val.setInlineStyle("width: '50px';");
fouls6val.setObjectName("recordLabel");
let fouls7 = new QLabel();
fouls7.setInlineStyle("width: '150px';");
fouls7.setObjectName("recordLabel");
let fouls7val = new QLabel();
fouls7val.setInlineStyle("width: '50px';");
fouls7val.setObjectName("recordLabel");
let fouls8 = new QLabel();
fouls8.setInlineStyle("width: '150px';");
fouls8.setObjectName("recordLabel");
let fouls8val = new QLabel();
fouls8val.setInlineStyle("width: '50px';");
fouls8val.setObjectName("recordLabel");
let fouls9 = new QLabel();
fouls9.setInlineStyle("width: '150px';");
fouls9.setObjectName("recordLabel");
let fouls9val = new QLabel();
fouls9val.setInlineStyle("width: '50px';");
fouls9val.setObjectName("recordLabel");
let fouls10 = new QLabel();
fouls10.setInlineStyle("width: '150px';");
fouls10.setObjectName("recordLabel");
let fouls10val = new QLabel();
fouls10val.setInlineStyle("width: '50px';");
fouls10val.setObjectName("recordLabel");

const fouls1bar = new QWidget();
fouls1bar.setObjectName('fouls1bar');
const fouls1barLayout = new FlexLayout();
fouls1bar.setLayout(fouls1barLayout);
fouls1bar.setInlineStyle("flex-direction: 'row';")

fouls1barLayout.addWidget(fouls1);
fouls1barLayout.addWidget(fouls1val);

const fouls2bar = new QWidget();
fouls2bar.setObjectName('fouls2bar');
const fouls2barLayout = new FlexLayout();
fouls2bar.setLayout(fouls2barLayout);
fouls2bar.setInlineStyle("flex-direction: 'row';")

fouls2barLayout.addWidget(fouls2);
fouls2barLayout.addWidget(fouls2val);

const fouls3bar = new QWidget();
fouls3bar.setObjectName('fouls3bar');
const fouls3barLayout = new FlexLayout();
fouls3bar.setLayout(fouls3barLayout);
fouls3bar.setInlineStyle("flex-direction: 'row';")

fouls3barLayout.addWidget(fouls3);
fouls3barLayout.addWidget(fouls3val);

const fouls4bar = new QWidget();
fouls4bar.setObjectName('fouls4bar');
const fouls4barLayout = new FlexLayout();
fouls4bar.setLayout(fouls4barLayout);
fouls4bar.setInlineStyle("flex-direction: 'row';")

fouls4barLayout.addWidget(fouls4);
fouls4barLayout.addWidget(fouls4val);

const fouls5bar = new QWidget();
fouls5bar.setObjectName('fouls5bar');
const fouls5barLayout = new FlexLayout();
fouls5bar.setLayout(fouls5barLayout);
fouls5bar.setInlineStyle("flex-direction: 'row';")

fouls5barLayout.addWidget(fouls5);
fouls5barLayout.addWidget(fouls5val);

const fouls6bar = new QWidget();
fouls6bar.setObjectName('fouls6bar');
const fouls6barLayout = new FlexLayout();
fouls6bar.setLayout(fouls6barLayout);
fouls6bar.setInlineStyle("flex-direction: 'row';")

fouls6barLayout.addWidget(fouls6);
fouls6barLayout.addWidget(fouls6val);

const fouls7bar = new QWidget();
fouls7bar.setObjectName('fouls7bar');
const fouls7barLayout = new FlexLayout();
fouls7bar.setLayout(fouls7barLayout);
fouls7bar.setInlineStyle("flex-direction: 'row';")

fouls7barLayout.addWidget(fouls7);
fouls7barLayout.addWidget(fouls7val);

const fouls8bar = new QWidget();
fouls8bar.setObjectName('fouls8bar');
const fouls8barLayout = new FlexLayout();
fouls8bar.setLayout(fouls8barLayout);
fouls8bar.setInlineStyle("flex-direction: 'row';")

fouls8barLayout.addWidget(fouls8);
fouls8barLayout.addWidget(fouls8val);

const fouls9bar = new QWidget();
fouls9bar.setObjectName('fouls9bar');
const fouls9barLayout = new FlexLayout();
fouls9bar.setLayout(fouls9barLayout);
fouls9bar.setInlineStyle("flex-direction: 'row';")

fouls9barLayout.addWidget(fouls9);
fouls9barLayout.addWidget(fouls9val);

const fouls10bar = new QWidget();
fouls10bar.setObjectName('fouls10bar');
const fouls10barLayout = new FlexLayout();
fouls10bar.setLayout(fouls10barLayout);
fouls10bar.setInlineStyle("flex-direction: 'row';")

fouls10barLayout.addWidget(fouls10);
fouls10barLayout.addWidget(fouls10val);


const foulsBarsArr = [[fouls1, fouls1val], [fouls2, fouls2val], [fouls3, fouls3val], [fouls4, fouls4val], [fouls5, fouls5val], [fouls6, fouls6val], [fouls7, fouls7val], [fouls8, fouls8val], [fouls9, fouls9val], [fouls10, fouls10val]]

foulsTileLayout.addWidget(foulsTitle);
foulsTileLayout.addWidget(fouls1bar);
foulsTileLayout.addWidget(fouls2bar);
foulsTileLayout.addWidget(fouls3bar);
foulsTileLayout.addWidget(fouls4bar);
foulsTileLayout.addWidget(fouls5bar);
foulsTileLayout.addWidget(fouls6bar);
foulsTileLayout.addWidget(fouls7bar);
foulsTileLayout.addWidget(fouls8bar);
foulsTileLayout.addWidget(fouls9bar);
foulsTileLayout.addWidget(fouls10bar);


const strikeoutspitchingTile = new QWidget();
strikeoutspitchingTile.setObjectName('strikeoutspitchingTile');
const strikeoutspitchingTileLayout = new FlexLayout();
strikeoutspitchingTile.setLayout(strikeoutspitchingTileLayout);
strikeoutspitchingTile.setInlineStyle("flex-direction: 'column';");

let strikeoutspitchingTitle = new QLabel();
strikeoutspitchingTitle.setText("STRIKEOUTS PITCHING");
strikeoutspitchingTitle.setInlineStyle("height: 50px;");
let strikeoutspitching1 = new QLabel();
strikeoutspitching1.setInlineStyle("width: '150px';");
strikeoutspitching1.setObjectName("recordLabel");
let strikeoutspitching1val = new QLabel();
strikeoutspitching1val.setInlineStyle("width: '50px';");
strikeoutspitching1val.setObjectName("recordLabel");
let strikeoutspitching2 = new QLabel();
strikeoutspitching2.setInlineStyle("width: '150px';");
strikeoutspitching2.setObjectName("recordLabel");
let strikeoutspitching2val = new QLabel();
strikeoutspitching2val.setInlineStyle("width: '50px';");
strikeoutspitching2val.setObjectName("recordLabel");
let strikeoutspitching3 = new QLabel();
strikeoutspitching3.setInlineStyle("width: '150px';");
strikeoutspitching3.setObjectName("recordLabel");
let strikeoutspitching3val = new QLabel();
strikeoutspitching3val.setInlineStyle("width: '50px';");
strikeoutspitching3val.setObjectName("recordLabel");
let strikeoutspitching4 = new QLabel();
strikeoutspitching4.setInlineStyle("width: '150px';");
strikeoutspitching4.setObjectName("recordLabel");
let strikeoutspitching4val = new QLabel();
strikeoutspitching4val.setInlineStyle("width: '50px';");
strikeoutspitching4val.setObjectName("recordLabel");
let strikeoutspitching5 = new QLabel();
strikeoutspitching5.setInlineStyle("width: '150px';");
strikeoutspitching5.setObjectName("recordLabel");
let strikeoutspitching5val = new QLabel();
strikeoutspitching5val.setInlineStyle("width: '50px';");
strikeoutspitching5val.setObjectName("recordLabel");
let strikeoutspitching6 = new QLabel();
strikeoutspitching6.setInlineStyle("width: '150px';");
strikeoutspitching6.setObjectName("recordLabel");
let strikeoutspitching6val = new QLabel();
strikeoutspitching6val.setInlineStyle("width: '50px';");
strikeoutspitching6val.setObjectName("recordLabel");
let strikeoutspitching7 = new QLabel();
strikeoutspitching7.setInlineStyle("width: '150px';");
strikeoutspitching7.setObjectName("recordLabel");
let strikeoutspitching7val = new QLabel();
strikeoutspitching7val.setInlineStyle("width: '50px';");
strikeoutspitching7val.setObjectName("recordLabel");
let strikeoutspitching8 = new QLabel();
strikeoutspitching8.setInlineStyle("width: '150px';");
strikeoutspitching8.setObjectName("recordLabel");
let strikeoutspitching8val = new QLabel();
strikeoutspitching8val.setInlineStyle("width: '50px';");
strikeoutspitching8val.setObjectName("recordLabel");
let strikeoutspitching9 = new QLabel();
strikeoutspitching9.setInlineStyle("width: '150px';");
strikeoutspitching9.setObjectName("recordLabel");
let strikeoutspitching9val = new QLabel();
strikeoutspitching9val.setInlineStyle("width: '50px';");
strikeoutspitching9val.setObjectName("recordLabel");
let strikeoutspitching10 = new QLabel();
strikeoutspitching10.setInlineStyle("width: '150px';");
strikeoutspitching10.setObjectName("recordLabel");
let strikeoutspitching10val = new QLabel();
strikeoutspitching10val.setInlineStyle("width: '50px';");
strikeoutspitching10val.setObjectName("recordLabel");

const strikeoutspitching1bar = new QWidget();
strikeoutspitching1bar.setObjectName('strikeoutspitching1bar');
const strikeoutspitching1barLayout = new FlexLayout();
strikeoutspitching1bar.setLayout(strikeoutspitching1barLayout);
strikeoutspitching1bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching1barLayout.addWidget(strikeoutspitching1);
strikeoutspitching1barLayout.addWidget(strikeoutspitching1val);

const strikeoutspitching2bar = new QWidget();
strikeoutspitching2bar.setObjectName('strikeoutspitching2bar');
const strikeoutspitching2barLayout = new FlexLayout();
strikeoutspitching2bar.setLayout(strikeoutspitching2barLayout);
strikeoutspitching2bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching2barLayout.addWidget(strikeoutspitching2);
strikeoutspitching2barLayout.addWidget(strikeoutspitching2val);

const strikeoutspitching3bar = new QWidget();
strikeoutspitching3bar.setObjectName('strikeoutspitching3bar');
const strikeoutspitching3barLayout = new FlexLayout();
strikeoutspitching3bar.setLayout(strikeoutspitching3barLayout);
strikeoutspitching3bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching3barLayout.addWidget(strikeoutspitching3);
strikeoutspitching3barLayout.addWidget(strikeoutspitching3val);

const strikeoutspitching4bar = new QWidget();
strikeoutspitching4bar.setObjectName('strikeoutspitching4bar');
const strikeoutspitching4barLayout = new FlexLayout();
strikeoutspitching4bar.setLayout(strikeoutspitching4barLayout);
strikeoutspitching4bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching4barLayout.addWidget(strikeoutspitching4);
strikeoutspitching4barLayout.addWidget(strikeoutspitching4val);

const strikeoutspitching5bar = new QWidget();
strikeoutspitching5bar.setObjectName('strikeoutspitching5bar');
const strikeoutspitching5barLayout = new FlexLayout();
strikeoutspitching5bar.setLayout(strikeoutspitching5barLayout);
strikeoutspitching5bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching5barLayout.addWidget(strikeoutspitching5);
strikeoutspitching5barLayout.addWidget(strikeoutspitching5val);

const strikeoutspitching6bar = new QWidget();
strikeoutspitching6bar.setObjectName('strikeoutspitching6bar');
const strikeoutspitching6barLayout = new FlexLayout();
strikeoutspitching6bar.setLayout(strikeoutspitching6barLayout);
strikeoutspitching6bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching6barLayout.addWidget(strikeoutspitching6);
strikeoutspitching6barLayout.addWidget(strikeoutspitching6val);

const strikeoutspitching7bar = new QWidget();
strikeoutspitching7bar.setObjectName('strikeoutspitching7bar');
const strikeoutspitching7barLayout = new FlexLayout();
strikeoutspitching7bar.setLayout(strikeoutspitching7barLayout);
strikeoutspitching7bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching7barLayout.addWidget(strikeoutspitching7);
strikeoutspitching7barLayout.addWidget(strikeoutspitching7val);

const strikeoutspitching8bar = new QWidget();
strikeoutspitching8bar.setObjectName('strikeoutspitching8bar');
const strikeoutspitching8barLayout = new FlexLayout();
strikeoutspitching8bar.setLayout(strikeoutspitching8barLayout);
strikeoutspitching8bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching8barLayout.addWidget(strikeoutspitching8);
strikeoutspitching8barLayout.addWidget(strikeoutspitching8val);

const strikeoutspitching9bar = new QWidget();
strikeoutspitching9bar.setObjectName('strikeoutspitching9bar');
const strikeoutspitching9barLayout = new FlexLayout();
strikeoutspitching9bar.setLayout(strikeoutspitching9barLayout);
strikeoutspitching9bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching9barLayout.addWidget(strikeoutspitching9);
strikeoutspitching9barLayout.addWidget(strikeoutspitching9val);

const strikeoutspitching10bar = new QWidget();
strikeoutspitching10bar.setObjectName('strikeoutspitching10bar');
const strikeoutspitching10barLayout = new FlexLayout();
strikeoutspitching10bar.setLayout(strikeoutspitching10barLayout);
strikeoutspitching10bar.setInlineStyle("flex-direction: 'row';")

strikeoutspitching10barLayout.addWidget(strikeoutspitching10);
strikeoutspitching10barLayout.addWidget(strikeoutspitching10val);


const strikeoutspitchingBarsArr = [[strikeoutspitching1, strikeoutspitching1val], [strikeoutspitching2, strikeoutspitching2val], [strikeoutspitching3, strikeoutspitching3val], [strikeoutspitching4, strikeoutspitching4val], [strikeoutspitching5, strikeoutspitching5val], [strikeoutspitching6, strikeoutspitching6val], [strikeoutspitching7, strikeoutspitching7val], [strikeoutspitching8, strikeoutspitching8val], [strikeoutspitching9, strikeoutspitching9val], [strikeoutspitching10, strikeoutspitching10val]]

strikeoutspitchingTileLayout.addWidget(strikeoutspitchingTitle);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching1bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching2bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching3bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching4bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching5bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching6bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching7bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching8bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching9bar);
strikeoutspitchingTileLayout.addWidget(strikeoutspitching10bar);


const balloutsTile = new QWidget();
balloutsTile.setObjectName('balloutsTile');
const balloutsTileLayout = new FlexLayout();
balloutsTile.setLayout(balloutsTileLayout);
balloutsTile.setInlineStyle("flex-direction: 'column';");

let balloutsTitle = new QLabel();
balloutsTitle.setText("BALLOUTS");
balloutsTitle.setInlineStyle("height: 50px;");
let ballouts1 = new QLabel();
ballouts1.setInlineStyle("width: '150px';");
ballouts1.setObjectName("recordLabel");
let ballouts1val = new QLabel();
ballouts1val.setInlineStyle("width: '50px';");
ballouts1val.setObjectName("recordLabel");
let ballouts2 = new QLabel();
ballouts2.setInlineStyle("width: '150px';");
ballouts2.setObjectName("recordLabel");
let ballouts2val = new QLabel();
ballouts2val.setInlineStyle("width: '50px';");
ballouts2val.setObjectName("recordLabel");
let ballouts3 = new QLabel();
ballouts3.setInlineStyle("width: '150px';");
ballouts3.setObjectName("recordLabel");
let ballouts3val = new QLabel();
ballouts3val.setInlineStyle("width: '50px';");
ballouts3val.setObjectName("recordLabel");
let ballouts4 = new QLabel();
ballouts4.setInlineStyle("width: '150px';");
ballouts4.setObjectName("recordLabel");
let ballouts4val = new QLabel();
ballouts4val.setInlineStyle("width: '50px';");
ballouts4val.setObjectName("recordLabel");
let ballouts5 = new QLabel();
ballouts5.setInlineStyle("width: '150px';");
ballouts5.setObjectName("recordLabel");
let ballouts5val = new QLabel();
ballouts5val.setInlineStyle("width: '50px';");
ballouts5val.setObjectName("recordLabel");
let ballouts6 = new QLabel();
ballouts6.setInlineStyle("width: '150px';");
ballouts6.setObjectName("recordLabel");
let ballouts6val = new QLabel();
ballouts6val.setInlineStyle("width: '50px';");
ballouts6val.setObjectName("recordLabel");
let ballouts7 = new QLabel();
ballouts7.setInlineStyle("width: '150px';");
ballouts7.setObjectName("recordLabel");
let ballouts7val = new QLabel();
ballouts7val.setInlineStyle("width: '50px';");
ballouts7val.setObjectName("recordLabel");
let ballouts8 = new QLabel();
ballouts8.setInlineStyle("width: '150px';");
ballouts8.setObjectName("recordLabel");
let ballouts8val = new QLabel();
ballouts8val.setInlineStyle("width: '50px';");
ballouts8val.setObjectName("recordLabel");
let ballouts9 = new QLabel();
ballouts9.setInlineStyle("width: '150px';");
ballouts9.setObjectName("recordLabel");
let ballouts9val = new QLabel();
ballouts9val.setInlineStyle("width: '50px';");
ballouts9val.setObjectName("recordLabel");
let ballouts10 = new QLabel();
ballouts10.setInlineStyle("width: '150px';");
ballouts10.setObjectName("recordLabel");
let ballouts10val = new QLabel();
ballouts10val.setInlineStyle("width: '50px';");
ballouts10val.setObjectName("recordLabel");

const ballouts1bar = new QWidget();
ballouts1bar.setObjectName('ballouts1bar');
const ballouts1barLayout = new FlexLayout();
ballouts1bar.setLayout(ballouts1barLayout);
ballouts1bar.setInlineStyle("flex-direction: 'row';")

ballouts1barLayout.addWidget(ballouts1);
ballouts1barLayout.addWidget(ballouts1val);

const ballouts2bar = new QWidget();
ballouts2bar.setObjectName('ballouts2bar');
const ballouts2barLayout = new FlexLayout();
ballouts2bar.setLayout(ballouts2barLayout);
ballouts2bar.setInlineStyle("flex-direction: 'row';")

ballouts2barLayout.addWidget(ballouts2);
ballouts2barLayout.addWidget(ballouts2val);

const ballouts3bar = new QWidget();
ballouts3bar.setObjectName('ballouts3bar');
const ballouts3barLayout = new FlexLayout();
ballouts3bar.setLayout(ballouts3barLayout);
ballouts3bar.setInlineStyle("flex-direction: 'row';")

ballouts3barLayout.addWidget(ballouts3);
ballouts3barLayout.addWidget(ballouts3val);

const ballouts4bar = new QWidget();
ballouts4bar.setObjectName('ballouts4bar');
const ballouts4barLayout = new FlexLayout();
ballouts4bar.setLayout(ballouts4barLayout);
ballouts4bar.setInlineStyle("flex-direction: 'row';")

ballouts4barLayout.addWidget(ballouts4);
ballouts4barLayout.addWidget(ballouts4val);

const ballouts5bar = new QWidget();
ballouts5bar.setObjectName('ballouts5bar');
const ballouts5barLayout = new FlexLayout();
ballouts5bar.setLayout(ballouts5barLayout);
ballouts5bar.setInlineStyle("flex-direction: 'row';")

ballouts5barLayout.addWidget(ballouts5);
ballouts5barLayout.addWidget(ballouts5val);

const ballouts6bar = new QWidget();
ballouts6bar.setObjectName('ballouts6bar');
const ballouts6barLayout = new FlexLayout();
ballouts6bar.setLayout(ballouts6barLayout);
ballouts6bar.setInlineStyle("flex-direction: 'row';")

ballouts6barLayout.addWidget(ballouts6);
ballouts6barLayout.addWidget(ballouts6val);

const ballouts7bar = new QWidget();
ballouts7bar.setObjectName('ballouts7bar');
const ballouts7barLayout = new FlexLayout();
ballouts7bar.setLayout(ballouts7barLayout);
ballouts7bar.setInlineStyle("flex-direction: 'row';")

ballouts7barLayout.addWidget(ballouts7);
ballouts7barLayout.addWidget(ballouts7val);

const ballouts8bar = new QWidget();
ballouts8bar.setObjectName('ballouts8bar');
const ballouts8barLayout = new FlexLayout();
ballouts8bar.setLayout(ballouts8barLayout);
ballouts8bar.setInlineStyle("flex-direction: 'row';")

ballouts8barLayout.addWidget(ballouts8);
ballouts8barLayout.addWidget(ballouts8val);

const ballouts9bar = new QWidget();
ballouts9bar.setObjectName('ballouts9bar');
const ballouts9barLayout = new FlexLayout();
ballouts9bar.setLayout(ballouts9barLayout);
ballouts9bar.setInlineStyle("flex-direction: 'row';")

ballouts9barLayout.addWidget(ballouts9);
ballouts9barLayout.addWidget(ballouts9val);

const ballouts10bar = new QWidget();
ballouts10bar.setObjectName('ballouts10bar');
const ballouts10barLayout = new FlexLayout();
ballouts10bar.setLayout(ballouts10barLayout);
ballouts10bar.setInlineStyle("flex-direction: 'row';")

ballouts10barLayout.addWidget(ballouts10);
ballouts10barLayout.addWidget(ballouts10val);


const balloutsBarsArr = [[ballouts1, ballouts1val], [ballouts2, ballouts2val], [ballouts3, ballouts3val], [ballouts4, ballouts4val], [ballouts5, ballouts5val], [ballouts6, ballouts6val], [ballouts7, ballouts7val], [ballouts8, ballouts8val], [ballouts9, ballouts9val], [ballouts10, ballouts10val]]

balloutsTileLayout.addWidget(balloutsTitle);
balloutsTileLayout.addWidget(ballouts1bar);
balloutsTileLayout.addWidget(ballouts2bar);
balloutsTileLayout.addWidget(ballouts3bar);
balloutsTileLayout.addWidget(ballouts4bar);
balloutsTileLayout.addWidget(ballouts5bar);
balloutsTileLayout.addWidget(ballouts6bar);
balloutsTileLayout.addWidget(ballouts7bar);
balloutsTileLayout.addWidget(ballouts8bar);
balloutsTileLayout.addWidget(ballouts9bar);
balloutsTileLayout.addWidget(ballouts10bar);


const slamsgivenTile = new QWidget();
slamsgivenTile.setObjectName('slamsgivenTile');
const slamsgivenTileLayout = new FlexLayout();
slamsgivenTile.setLayout(slamsgivenTileLayout);
slamsgivenTile.setInlineStyle("flex-direction: 'column';");

let slamsgivenTitle = new QLabel();
slamsgivenTitle.setText("SLAMS GIVEN");
slamsgivenTitle.setInlineStyle("height: 50px;");
let slamsgiven1 = new QLabel();
slamsgiven1.setInlineStyle("width: '150px';");
slamsgiven1.setObjectName("recordLabel");
let slamsgiven1val = new QLabel();
slamsgiven1val.setInlineStyle("width: '50px';");
slamsgiven1val.setObjectName("recordLabel");
let slamsgiven2 = new QLabel();
slamsgiven2.setInlineStyle("width: '150px';");
slamsgiven2.setObjectName("recordLabel");
let slamsgiven2val = new QLabel();
slamsgiven2val.setInlineStyle("width: '50px';");
slamsgiven2val.setObjectName("recordLabel");
let slamsgiven3 = new QLabel();
slamsgiven3.setInlineStyle("width: '150px';");
slamsgiven3.setObjectName("recordLabel");
let slamsgiven3val = new QLabel();
slamsgiven3val.setInlineStyle("width: '50px';");
slamsgiven3val.setObjectName("recordLabel");
let slamsgiven4 = new QLabel();
slamsgiven4.setInlineStyle("width: '150px';");
slamsgiven4.setObjectName("recordLabel");
let slamsgiven4val = new QLabel();
slamsgiven4val.setInlineStyle("width: '50px';");
slamsgiven4val.setObjectName("recordLabel");
let slamsgiven5 = new QLabel();
slamsgiven5.setInlineStyle("width: '150px';");
slamsgiven5.setObjectName("recordLabel");
let slamsgiven5val = new QLabel();
slamsgiven5val.setInlineStyle("width: '50px';");
slamsgiven5val.setObjectName("recordLabel");
let slamsgiven6 = new QLabel();
slamsgiven6.setInlineStyle("width: '150px';");
slamsgiven6.setObjectName("recordLabel");
let slamsgiven6val = new QLabel();
slamsgiven6val.setInlineStyle("width: '50px';");
slamsgiven6val.setObjectName("recordLabel");
let slamsgiven7 = new QLabel();
slamsgiven7.setInlineStyle("width: '150px';");
slamsgiven7.setObjectName("recordLabel");
let slamsgiven7val = new QLabel();
slamsgiven7val.setInlineStyle("width: '50px';");
slamsgiven7val.setObjectName("recordLabel");
let slamsgiven8 = new QLabel();
slamsgiven8.setInlineStyle("width: '150px';");
slamsgiven8.setObjectName("recordLabel");
let slamsgiven8val = new QLabel();
slamsgiven8val.setInlineStyle("width: '50px';");
slamsgiven8val.setObjectName("recordLabel");
let slamsgiven9 = new QLabel();
slamsgiven9.setInlineStyle("width: '150px';");
slamsgiven9.setObjectName("recordLabel");
let slamsgiven9val = new QLabel();
slamsgiven9val.setInlineStyle("width: '50px';");
slamsgiven9val.setObjectName("recordLabel");
let slamsgiven10 = new QLabel();
slamsgiven10.setInlineStyle("width: '150px';");
slamsgiven10.setObjectName("recordLabel");
let slamsgiven10val = new QLabel();
slamsgiven10val.setInlineStyle("width: '50px';");
slamsgiven10val.setObjectName("recordLabel");

const slamsgiven1bar = new QWidget();
slamsgiven1bar.setObjectName('slamsgiven1bar');
const slamsgiven1barLayout = new FlexLayout();
slamsgiven1bar.setLayout(slamsgiven1barLayout);
slamsgiven1bar.setInlineStyle("flex-direction: 'row';")

slamsgiven1barLayout.addWidget(slamsgiven1);
slamsgiven1barLayout.addWidget(slamsgiven1val);

const slamsgiven2bar = new QWidget();
slamsgiven2bar.setObjectName('slamsgiven2bar');
const slamsgiven2barLayout = new FlexLayout();
slamsgiven2bar.setLayout(slamsgiven2barLayout);
slamsgiven2bar.setInlineStyle("flex-direction: 'row';")

slamsgiven2barLayout.addWidget(slamsgiven2);
slamsgiven2barLayout.addWidget(slamsgiven2val);

const slamsgiven3bar = new QWidget();
slamsgiven3bar.setObjectName('slamsgiven3bar');
const slamsgiven3barLayout = new FlexLayout();
slamsgiven3bar.setLayout(slamsgiven3barLayout);
slamsgiven3bar.setInlineStyle("flex-direction: 'row';")

slamsgiven3barLayout.addWidget(slamsgiven3);
slamsgiven3barLayout.addWidget(slamsgiven3val);

const slamsgiven4bar = new QWidget();
slamsgiven4bar.setObjectName('slamsgiven4bar');
const slamsgiven4barLayout = new FlexLayout();
slamsgiven4bar.setLayout(slamsgiven4barLayout);
slamsgiven4bar.setInlineStyle("flex-direction: 'row';")

slamsgiven4barLayout.addWidget(slamsgiven4);
slamsgiven4barLayout.addWidget(slamsgiven4val);

const slamsgiven5bar = new QWidget();
slamsgiven5bar.setObjectName('slamsgiven5bar');
const slamsgiven5barLayout = new FlexLayout();
slamsgiven5bar.setLayout(slamsgiven5barLayout);
slamsgiven5bar.setInlineStyle("flex-direction: 'row';")

slamsgiven5barLayout.addWidget(slamsgiven5);
slamsgiven5barLayout.addWidget(slamsgiven5val);

const slamsgiven6bar = new QWidget();
slamsgiven6bar.setObjectName('slamsgiven6bar');
const slamsgiven6barLayout = new FlexLayout();
slamsgiven6bar.setLayout(slamsgiven6barLayout);
slamsgiven6bar.setInlineStyle("flex-direction: 'row';")

slamsgiven6barLayout.addWidget(slamsgiven6);
slamsgiven6barLayout.addWidget(slamsgiven6val);

const slamsgiven7bar = new QWidget();
slamsgiven7bar.setObjectName('slamsgiven7bar');
const slamsgiven7barLayout = new FlexLayout();
slamsgiven7bar.setLayout(slamsgiven7barLayout);
slamsgiven7bar.setInlineStyle("flex-direction: 'row';")

slamsgiven7barLayout.addWidget(slamsgiven7);
slamsgiven7barLayout.addWidget(slamsgiven7val);

const slamsgiven8bar = new QWidget();
slamsgiven8bar.setObjectName('slamsgiven8bar');
const slamsgiven8barLayout = new FlexLayout();
slamsgiven8bar.setLayout(slamsgiven8barLayout);
slamsgiven8bar.setInlineStyle("flex-direction: 'row';")

slamsgiven8barLayout.addWidget(slamsgiven8);
slamsgiven8barLayout.addWidget(slamsgiven8val);

const slamsgiven9bar = new QWidget();
slamsgiven9bar.setObjectName('slamsgiven9bar');
const slamsgiven9barLayout = new FlexLayout();
slamsgiven9bar.setLayout(slamsgiven9barLayout);
slamsgiven9bar.setInlineStyle("flex-direction: 'row';")

slamsgiven9barLayout.addWidget(slamsgiven9);
slamsgiven9barLayout.addWidget(slamsgiven9val);

const slamsgiven10bar = new QWidget();
slamsgiven10bar.setObjectName('slamsgiven10bar');
const slamsgiven10barLayout = new FlexLayout();
slamsgiven10bar.setLayout(slamsgiven10barLayout);
slamsgiven10bar.setInlineStyle("flex-direction: 'row';")

slamsgiven10barLayout.addWidget(slamsgiven10);
slamsgiven10barLayout.addWidget(slamsgiven10val);


const slamsgivenBarsArr = [[slamsgiven1, slamsgiven1val], [slamsgiven2, slamsgiven2val], [slamsgiven3, slamsgiven3val], [slamsgiven4, slamsgiven4val], [slamsgiven5, slamsgiven5val], [slamsgiven6, slamsgiven6val], [slamsgiven7, slamsgiven7val], [slamsgiven8, slamsgiven8val], [slamsgiven9, slamsgiven9val], [slamsgiven10, slamsgiven10val]]

slamsgivenTileLayout.addWidget(slamsgivenTitle);
slamsgivenTileLayout.addWidget(slamsgiven1bar);
slamsgivenTileLayout.addWidget(slamsgiven2bar);
slamsgivenTileLayout.addWidget(slamsgiven3bar);
slamsgivenTileLayout.addWidget(slamsgiven4bar);
slamsgivenTileLayout.addWidget(slamsgiven5bar);
slamsgivenTileLayout.addWidget(slamsgiven6bar);
slamsgivenTileLayout.addWidget(slamsgiven7bar);
slamsgivenTileLayout.addWidget(slamsgiven8bar);
slamsgivenTileLayout.addWidget(slamsgiven9bar);
slamsgivenTileLayout.addWidget(slamsgiven10bar);


const atbatsTile = new QWidget();
atbatsTile.setObjectName('atbatsTile');
const atbatsTileLayout = new FlexLayout();
atbatsTile.setLayout(atbatsTileLayout);
atbatsTile.setInlineStyle("flex-direction: 'column';");

let atbatsTitle = new QLabel();
atbatsTitle.setText("AT-BATS");
atbatsTitle.setInlineStyle("height: 50px;");
let atbats1 = new QLabel();
atbats1.setInlineStyle("width: '150px';");
atbats1.setObjectName("recordLabel");
let atbats1val = new QLabel();
atbats1val.setInlineStyle("width: '50px';");
atbats1val.setObjectName("recordLabel");
let atbats2 = new QLabel();
atbats2.setInlineStyle("width: '150px';");
atbats2.setObjectName("recordLabel");
let atbats2val = new QLabel();
atbats2val.setInlineStyle("width: '50px';");
atbats2val.setObjectName("recordLabel");
let atbats3 = new QLabel();
atbats3.setInlineStyle("width: '150px';");
atbats3.setObjectName("recordLabel");
let atbats3val = new QLabel();
atbats3val.setInlineStyle("width: '50px';");
atbats3val.setObjectName("recordLabel");
let atbats4 = new QLabel();
atbats4.setInlineStyle("width: '150px';");
atbats4.setObjectName("recordLabel");
let atbats4val = new QLabel();
atbats4val.setInlineStyle("width: '50px';");
atbats4val.setObjectName("recordLabel");
let atbats5 = new QLabel();
atbats5.setInlineStyle("width: '150px';");
atbats5.setObjectName("recordLabel");
let atbats5val = new QLabel();
atbats5val.setInlineStyle("width: '50px';");
atbats5val.setObjectName("recordLabel");
let atbats6 = new QLabel();
atbats6.setInlineStyle("width: '150px';");
atbats6.setObjectName("recordLabel");
let atbats6val = new QLabel();
atbats6val.setInlineStyle("width: '50px';");
atbats6val.setObjectName("recordLabel");
let atbats7 = new QLabel();
atbats7.setInlineStyle("width: '150px';");
atbats7.setObjectName("recordLabel");
let atbats7val = new QLabel();
atbats7val.setInlineStyle("width: '50px';");
atbats7val.setObjectName("recordLabel");
let atbats8 = new QLabel();
atbats8.setInlineStyle("width: '150px';");
atbats8.setObjectName("recordLabel");
let atbats8val = new QLabel();
atbats8val.setInlineStyle("width: '50px';");
atbats8val.setObjectName("recordLabel");
let atbats9 = new QLabel();
atbats9.setInlineStyle("width: '150px';");
atbats9.setObjectName("recordLabel");
let atbats9val = new QLabel();
atbats9val.setInlineStyle("width: '50px';");
atbats9val.setObjectName("recordLabel");
let atbats10 = new QLabel();
atbats10.setInlineStyle("width: '150px';");
atbats10.setObjectName("recordLabel");
let atbats10val = new QLabel();
atbats10val.setInlineStyle("width: '50px';");
atbats10val.setObjectName("recordLabel");

const atbats1bar = new QWidget();
atbats1bar.setObjectName('atbats1bar');
const atbats1barLayout = new FlexLayout();
atbats1bar.setLayout(atbats1barLayout);
atbats1bar.setInlineStyle("flex-direction: 'row';")

atbats1barLayout.addWidget(atbats1);
atbats1barLayout.addWidget(atbats1val);

const atbats2bar = new QWidget();
atbats2bar.setObjectName('atbats2bar');
const atbats2barLayout = new FlexLayout();
atbats2bar.setLayout(atbats2barLayout);
atbats2bar.setInlineStyle("flex-direction: 'row';")

atbats2barLayout.addWidget(atbats2);
atbats2barLayout.addWidget(atbats2val);

const atbats3bar = new QWidget();
atbats3bar.setObjectName('atbats3bar');
const atbats3barLayout = new FlexLayout();
atbats3bar.setLayout(atbats3barLayout);
atbats3bar.setInlineStyle("flex-direction: 'row';")

atbats3barLayout.addWidget(atbats3);
atbats3barLayout.addWidget(atbats3val);

const atbats4bar = new QWidget();
atbats4bar.setObjectName('atbats4bar');
const atbats4barLayout = new FlexLayout();
atbats4bar.setLayout(atbats4barLayout);
atbats4bar.setInlineStyle("flex-direction: 'row';")

atbats4barLayout.addWidget(atbats4);
atbats4barLayout.addWidget(atbats4val);

const atbats5bar = new QWidget();
atbats5bar.setObjectName('atbats5bar');
const atbats5barLayout = new FlexLayout();
atbats5bar.setLayout(atbats5barLayout);
atbats5bar.setInlineStyle("flex-direction: 'row';")

atbats5barLayout.addWidget(atbats5);
atbats5barLayout.addWidget(atbats5val);

const atbats6bar = new QWidget();
atbats6bar.setObjectName('atbats6bar');
const atbats6barLayout = new FlexLayout();
atbats6bar.setLayout(atbats6barLayout);
atbats6bar.setInlineStyle("flex-direction: 'row';")

atbats6barLayout.addWidget(atbats6);
atbats6barLayout.addWidget(atbats6val);

const atbats7bar = new QWidget();
atbats7bar.setObjectName('atbats7bar');
const atbats7barLayout = new FlexLayout();
atbats7bar.setLayout(atbats7barLayout);
atbats7bar.setInlineStyle("flex-direction: 'row';")

atbats7barLayout.addWidget(atbats7);
atbats7barLayout.addWidget(atbats7val);

const atbats8bar = new QWidget();
atbats8bar.setObjectName('atbats8bar');
const atbats8barLayout = new FlexLayout();
atbats8bar.setLayout(atbats8barLayout);
atbats8bar.setInlineStyle("flex-direction: 'row';")

atbats8barLayout.addWidget(atbats8);
atbats8barLayout.addWidget(atbats8val);

const atbats9bar = new QWidget();
atbats9bar.setObjectName('atbats9bar');
const atbats9barLayout = new FlexLayout();
atbats9bar.setLayout(atbats9barLayout);
atbats9bar.setInlineStyle("flex-direction: 'row';")

atbats9barLayout.addWidget(atbats9);
atbats9barLayout.addWidget(atbats9val);

const atbats10bar = new QWidget();
atbats10bar.setObjectName('atbats10bar');
const atbats10barLayout = new FlexLayout();
atbats10bar.setLayout(atbats10barLayout);
atbats10bar.setInlineStyle("flex-direction: 'row';")

atbats10barLayout.addWidget(atbats10);
atbats10barLayout.addWidget(atbats10val);

const atbatsBarsArr = [[atbats1, atbats1val], [atbats2, atbats2val], [atbats3, atbats3val], [atbats4, atbats4val], [atbats5, atbats5val], [atbats6, atbats6val], [atbats7, atbats7val], [atbats8, atbats8val], [atbats9, atbats9val], [atbats10, atbats10val]]

atbatsTileLayout.addWidget(atbatsTitle);
atbatsTileLayout.addWidget(atbats1bar);
atbatsTileLayout.addWidget(atbats2bar);
atbatsTileLayout.addWidget(atbats3bar);
atbatsTileLayout.addWidget(atbats4bar);
atbatsTileLayout.addWidget(atbats5bar);
atbatsTileLayout.addWidget(atbats6bar);
atbatsTileLayout.addWidget(atbats7bar);
atbatsTileLayout.addWidget(atbats8bar);
atbatsTileLayout.addWidget(atbats9bar);
atbatsTileLayout.addWidget(atbats10bar);


const hitsTile = new QWidget();
hitsTile.setObjectName('hitsTile');
const hitsTileLayout = new FlexLayout();
hitsTile.setLayout(hitsTileLayout);
hitsTile.setInlineStyle("flex-direction: 'column';");

let hitsTitle = new QLabel();
hitsTitle.setText("HITS");
hitsTitle.setInlineStyle("height: 50px;");
let hits1 = new QLabel();
hits1.setInlineStyle("width: '150px';");
hits1.setObjectName("recordLabel");
let hits1val = new QLabel();
hits1val.setInlineStyle("width: '50px';");
hits1val.setObjectName("recordLabel");
let hits2 = new QLabel();
hits2.setInlineStyle("width: '150px';");
hits2.setObjectName("recordLabel");
let hits2val = new QLabel();
hits2val.setInlineStyle("width: '50px';");
hits2val.setObjectName("recordLabel");
let hits3 = new QLabel();
hits3.setInlineStyle("width: '150px';");
hits3.setObjectName("recordLabel");
let hits3val = new QLabel();
hits3val.setInlineStyle("width: '50px';");
hits3val.setObjectName("recordLabel");
let hits4 = new QLabel();
hits4.setInlineStyle("width: '150px';");
hits4.setObjectName("recordLabel");
let hits4val = new QLabel();
hits4val.setInlineStyle("width: '50px';");
hits4val.setObjectName("recordLabel");
let hits5 = new QLabel();
hits5.setInlineStyle("width: '150px';");
hits5.setObjectName("recordLabel");
let hits5val = new QLabel();
hits5val.setInlineStyle("width: '50px';");
hits5val.setObjectName("recordLabel");
let hits6 = new QLabel();
hits6.setInlineStyle("width: '150px';");
hits6.setObjectName("recordLabel");
let hits6val = new QLabel();
hits6val.setInlineStyle("width: '50px';");
hits6val.setObjectName("recordLabel");
let hits7 = new QLabel();
hits7.setInlineStyle("width: '150px';");
hits7.setObjectName("recordLabel");
let hits7val = new QLabel();
hits7val.setInlineStyle("width: '50px';");
hits7val.setObjectName("recordLabel");
let hits8 = new QLabel();
hits8.setInlineStyle("width: '150px';");
hits8.setObjectName("recordLabel");
let hits8val = new QLabel();
hits8val.setInlineStyle("width: '50px';");
hits8val.setObjectName("recordLabel");
let hits9 = new QLabel();
hits9.setInlineStyle("width: '150px';");
hits9.setObjectName("recordLabel");
let hits9val = new QLabel();
hits9val.setInlineStyle("width: '50px';");
hits9val.setObjectName("recordLabel");
let hits10 = new QLabel();
hits10.setInlineStyle("width: '150px';");
hits10.setObjectName("recordLabel");
let hits10val = new QLabel();
hits10val.setInlineStyle("width: '50px';");
hits10val.setObjectName("recordLabel");

const hits1bar = new QWidget();
hits1bar.setObjectName('hits1bar');
const hits1barLayout = new FlexLayout();
hits1bar.setLayout(hits1barLayout);
hits1bar.setInlineStyle("flex-direction: 'row';")

hits1barLayout.addWidget(hits1);
hits1barLayout.addWidget(hits1val);

const hits2bar = new QWidget();
hits2bar.setObjectName('hits2bar');
const hits2barLayout = new FlexLayout();
hits2bar.setLayout(hits2barLayout);
hits2bar.setInlineStyle("flex-direction: 'row';")

hits2barLayout.addWidget(hits2);
hits2barLayout.addWidget(hits2val);

const hits3bar = new QWidget();
hits3bar.setObjectName('hits3bar');
const hits3barLayout = new FlexLayout();
hits3bar.setLayout(hits3barLayout);
hits3bar.setInlineStyle("flex-direction: 'row';")

hits3barLayout.addWidget(hits3);
hits3barLayout.addWidget(hits3val);

const hits4bar = new QWidget();
hits4bar.setObjectName('hits4bar');
const hits4barLayout = new FlexLayout();
hits4bar.setLayout(hits4barLayout);
hits4bar.setInlineStyle("flex-direction: 'row';")

hits4barLayout.addWidget(hits4);
hits4barLayout.addWidget(hits4val);

const hits5bar = new QWidget();
hits5bar.setObjectName('hits5bar');
const hits5barLayout = new FlexLayout();
hits5bar.setLayout(hits5barLayout);
hits5bar.setInlineStyle("flex-direction: 'row';")

hits5barLayout.addWidget(hits5);
hits5barLayout.addWidget(hits5val);

const hits6bar = new QWidget();
hits6bar.setObjectName('hits6bar');
const hits6barLayout = new FlexLayout();
hits6bar.setLayout(hits6barLayout);
hits6bar.setInlineStyle("flex-direction: 'row';")

hits6barLayout.addWidget(hits6);
hits6barLayout.addWidget(hits6val);

const hits7bar = new QWidget();
hits7bar.setObjectName('hits7bar');
const hits7barLayout = new FlexLayout();
hits7bar.setLayout(hits7barLayout);
hits7bar.setInlineStyle("flex-direction: 'row';")

hits7barLayout.addWidget(hits7);
hits7barLayout.addWidget(hits7val);

const hits8bar = new QWidget();
hits8bar.setObjectName('hits8bar');
const hits8barLayout = new FlexLayout();
hits8bar.setLayout(hits8barLayout);
hits8bar.setInlineStyle("flex-direction: 'row';")

hits8barLayout.addWidget(hits8);
hits8barLayout.addWidget(hits8val);

const hits9bar = new QWidget();
hits9bar.setObjectName('hits9bar');
const hits9barLayout = new FlexLayout();
hits9bar.setLayout(hits9barLayout);
hits9bar.setInlineStyle("flex-direction: 'row';")

hits9barLayout.addWidget(hits9);
hits9barLayout.addWidget(hits9val);

const hits10bar = new QWidget();
hits10bar.setObjectName('hits10bar');
const hits10barLayout = new FlexLayout();
hits10bar.setLayout(hits10barLayout);
hits10bar.setInlineStyle("flex-direction: 'row';")

hits10barLayout.addWidget(hits10);
hits10barLayout.addWidget(hits10val);


const hitsBarsArr = [[hits1, hits1val], [hits2, hits2val], [hits3, hits3val], [hits4, hits4val], [hits5, hits5val], [hits6, hits6val], [hits7, hits7val], [hits8, hits8val], [hits9, hits9val], [hits10, hits10val]]

hitsTileLayout.addWidget(hitsTitle);
hitsTileLayout.addWidget(hits1bar);
hitsTileLayout.addWidget(hits2bar);
hitsTileLayout.addWidget(hits3bar);
hitsTileLayout.addWidget(hits4bar);
hitsTileLayout.addWidget(hits5bar);
hitsTileLayout.addWidget(hits6bar);
hitsTileLayout.addWidget(hits7bar);
hitsTileLayout.addWidget(hits8bar);
hitsTileLayout.addWidget(hits9bar);
hitsTileLayout.addWidget(hits10bar);


const slamsTile = new QWidget();
slamsTile.setObjectName('slamsTile');
const slamsTileLayout = new FlexLayout();
slamsTile.setLayout(slamsTileLayout);
slamsTile.setInlineStyle("flex-direction: 'column';");

let slamsTitle = new QLabel();
slamsTitle.setText("SLAMS");
slamsTitle.setInlineStyle("height: 50px;");
let slams1 = new QLabel();
slams1.setInlineStyle("width: '150px';");
slams1.setObjectName("recordLabel");
let slams1val = new QLabel();
slams1val.setInlineStyle("width: '50px';");
slams1val.setObjectName("recordLabel");
let slams2 = new QLabel();
slams2.setInlineStyle("width: '150px';");
slams2.setObjectName("recordLabel");
let slams2val = new QLabel();
slams2val.setInlineStyle("width: '50px';");
slams2val.setObjectName("recordLabel");
let slams3 = new QLabel();
slams3.setInlineStyle("width: '150px';");
slams3.setObjectName("recordLabel");
let slams3val = new QLabel();
slams3val.setInlineStyle("width: '50px';");
slams3val.setObjectName("recordLabel");
let slams4 = new QLabel();
slams4.setInlineStyle("width: '150px';");
slams4.setObjectName("recordLabel");
let slams4val = new QLabel();
slams4val.setInlineStyle("width: '50px';");
slams4val.setObjectName("recordLabel");
let slams5 = new QLabel();
slams5.setInlineStyle("width: '150px';");
slams5.setObjectName("recordLabel");
let slams5val = new QLabel();
slams5val.setInlineStyle("width: '50px';");
slams5val.setObjectName("recordLabel");
let slams6 = new QLabel();
slams6.setInlineStyle("width: '150px';");
slams6.setObjectName("recordLabel");
let slams6val = new QLabel();
slams6val.setInlineStyle("width: '50px';");
slams6val.setObjectName("recordLabel");
let slams7 = new QLabel();
slams7.setInlineStyle("width: '150px';");
slams7.setObjectName("recordLabel");
let slams7val = new QLabel();
slams7val.setInlineStyle("width: '50px';");
slams7val.setObjectName("recordLabel");
let slams8 = new QLabel();
slams8.setInlineStyle("width: '150px';");
slams8.setObjectName("recordLabel");
let slams8val = new QLabel();
slams8val.setInlineStyle("width: '50px';");
slams8val.setObjectName("recordLabel");
let slams9 = new QLabel();
slams9.setInlineStyle("width: '150px';");
slams9.setObjectName("recordLabel");
let slams9val = new QLabel();
slams9val.setInlineStyle("width: '50px';");
slams9val.setObjectName("recordLabel");
let slams10 = new QLabel();
slams10.setInlineStyle("width: '150px';");
slams10.setObjectName("recordLabel");
let slams10val = new QLabel();
slams10val.setInlineStyle("width: '50px';");
slams10val.setObjectName("recordLabel");

const slams1bar = new QWidget();
slams1bar.setObjectName('slams1bar');
const slams1barLayout = new FlexLayout();
slams1bar.setLayout(slams1barLayout);
slams1bar.setInlineStyle("flex-direction: 'row';")

slams1barLayout.addWidget(slams1);
slams1barLayout.addWidget(slams1val);

const slams2bar = new QWidget();
slams2bar.setObjectName('slams2bar');
const slams2barLayout = new FlexLayout();
slams2bar.setLayout(slams2barLayout);
slams2bar.setInlineStyle("flex-direction: 'row';")

slams2barLayout.addWidget(slams2);
slams2barLayout.addWidget(slams2val);

const slams3bar = new QWidget();
slams3bar.setObjectName('slams3bar');
const slams3barLayout = new FlexLayout();
slams3bar.setLayout(slams3barLayout);
slams3bar.setInlineStyle("flex-direction: 'row';")

slams3barLayout.addWidget(slams3);
slams3barLayout.addWidget(slams3val);

const slams4bar = new QWidget();
slams4bar.setObjectName('slams4bar');
const slams4barLayout = new FlexLayout();
slams4bar.setLayout(slams4barLayout);
slams4bar.setInlineStyle("flex-direction: 'row';")

slams4barLayout.addWidget(slams4);
slams4barLayout.addWidget(slams4val);

const slams5bar = new QWidget();
slams5bar.setObjectName('slams5bar');
const slams5barLayout = new FlexLayout();
slams5bar.setLayout(slams5barLayout);
slams5bar.setInlineStyle("flex-direction: 'row';")

slams5barLayout.addWidget(slams5);
slams5barLayout.addWidget(slams5val);

const slams6bar = new QWidget();
slams6bar.setObjectName('slams6bar');
const slams6barLayout = new FlexLayout();
slams6bar.setLayout(slams6barLayout);
slams6bar.setInlineStyle("flex-direction: 'row';")

slams6barLayout.addWidget(slams6);
slams6barLayout.addWidget(slams6val);

const slams7bar = new QWidget();
slams7bar.setObjectName('slams7bar');
const slams7barLayout = new FlexLayout();
slams7bar.setLayout(slams7barLayout);
slams7bar.setInlineStyle("flex-direction: 'row';")

slams7barLayout.addWidget(slams7);
slams7barLayout.addWidget(slams7val);

const slams8bar = new QWidget();
slams8bar.setObjectName('slams8bar');
const slams8barLayout = new FlexLayout();
slams8bar.setLayout(slams8barLayout);
slams8bar.setInlineStyle("flex-direction: 'row';")

slams8barLayout.addWidget(slams8);
slams8barLayout.addWidget(slams8val);

const slams9bar = new QWidget();
slams9bar.setObjectName('slams9bar');
const slams9barLayout = new FlexLayout();
slams9bar.setLayout(slams9barLayout);
slams9bar.setInlineStyle("flex-direction: 'row';")

slams9barLayout.addWidget(slams9);
slams9barLayout.addWidget(slams9val);

const slams10bar = new QWidget();
slams10bar.setObjectName('slams10bar');
const slams10barLayout = new FlexLayout();
slams10bar.setLayout(slams10barLayout);
slams10bar.setInlineStyle("flex-direction: 'row';")

slams10barLayout.addWidget(slams10);
slams10barLayout.addWidget(slams10val);


const slamsBarsArr = [[slams1, slams1val], [slams2, slams2val], [slams3, slams3val], [slams4, slams4val], [slams5, slams5val], [slams6, slams6val], [slams7, slams7val], [slams8, slams8val], [slams9, slams9val], [slams10, slams10val]]

slamsTileLayout.addWidget(slamsTitle);
slamsTileLayout.addWidget(slams1bar);
slamsTileLayout.addWidget(slams2bar);
slamsTileLayout.addWidget(slams3bar);
slamsTileLayout.addWidget(slams4bar);
slamsTileLayout.addWidget(slams5bar);
slamsTileLayout.addWidget(slams6bar);
slamsTileLayout.addWidget(slams7bar);
slamsTileLayout.addWidget(slams8bar);
slamsTileLayout.addWidget(slams9bar);
slamsTileLayout.addWidget(slams10bar);


const hitstooutTile = new QWidget();
hitstooutTile.setObjectName('hitstooutTile');
const hitstooutTileLayout = new FlexLayout();
hitstooutTile.setLayout(hitstooutTileLayout);
hitstooutTile.setInlineStyle("flex-direction: 'column';");

let hitstooutTitle = new QLabel();
hitstooutTitle.setText("HITS TO OUT");
hitstooutTitle.setInlineStyle("height: 50px;");
let hitstoout1 = new QLabel();
hitstoout1.setInlineStyle("width: '150px';");
hitstoout1.setObjectName("recordLabel");
let hitstoout1val = new QLabel();
hitstoout1val.setInlineStyle("width: '50px';");
hitstoout1val.setObjectName("recordLabel");
let hitstoout2 = new QLabel();
hitstoout2.setInlineStyle("width: '150px';");
hitstoout2.setObjectName("recordLabel");
let hitstoout2val = new QLabel();
hitstoout2val.setInlineStyle("width: '50px';");
hitstoout2val.setObjectName("recordLabel");
let hitstoout3 = new QLabel();
hitstoout3.setInlineStyle("width: '150px';");
hitstoout3.setObjectName("recordLabel");
let hitstoout3val = new QLabel();
hitstoout3val.setInlineStyle("width: '50px';");
hitstoout3val.setObjectName("recordLabel");
let hitstoout4 = new QLabel();
hitstoout4.setInlineStyle("width: '150px';");
hitstoout4.setObjectName("recordLabel");
let hitstoout4val = new QLabel();
hitstoout4val.setInlineStyle("width: '50px';");
hitstoout4val.setObjectName("recordLabel");
let hitstoout5 = new QLabel();
hitstoout5.setInlineStyle("width: '150px';");
hitstoout5.setObjectName("recordLabel");
let hitstoout5val = new QLabel();
hitstoout5val.setInlineStyle("width: '50px';");
hitstoout5val.setObjectName("recordLabel");
let hitstoout6 = new QLabel();
hitstoout6.setInlineStyle("width: '150px';");
hitstoout6.setObjectName("recordLabel");
let hitstoout6val = new QLabel();
hitstoout6val.setInlineStyle("width: '50px';");
hitstoout6val.setObjectName("recordLabel");
let hitstoout7 = new QLabel();
hitstoout7.setInlineStyle("width: '150px';");
hitstoout7.setObjectName("recordLabel");
let hitstoout7val = new QLabel();
hitstoout7val.setInlineStyle("width: '50px';");
hitstoout7val.setObjectName("recordLabel");
let hitstoout8 = new QLabel();
hitstoout8.setInlineStyle("width: '150px';");
hitstoout8.setObjectName("recordLabel");
let hitstoout8val = new QLabel();
hitstoout8val.setInlineStyle("width: '50px';");
hitstoout8val.setObjectName("recordLabel");
let hitstoout9 = new QLabel();
hitstoout9.setInlineStyle("width: '150px';");
hitstoout9.setObjectName("recordLabel");
let hitstoout9val = new QLabel();
hitstoout9val.setInlineStyle("width: '50px';");
hitstoout9val.setObjectName("recordLabel");
let hitstoout10 = new QLabel();
hitstoout10.setInlineStyle("width: '150px';");
hitstoout10.setObjectName("recordLabel");
let hitstoout10val = new QLabel();
hitstoout10val.setInlineStyle("width: '50px';");
hitstoout10val.setObjectName("recordLabel");

const hitstoout1bar = new QWidget();
hitstoout1bar.setObjectName('hitstoout1bar');
const hitstoout1barLayout = new FlexLayout();
hitstoout1bar.setLayout(hitstoout1barLayout);
hitstoout1bar.setInlineStyle("flex-direction: 'row';")

hitstoout1barLayout.addWidget(hitstoout1);
hitstoout1barLayout.addWidget(hitstoout1val);

const hitstoout2bar = new QWidget();
hitstoout2bar.setObjectName('hitstoout2bar');
const hitstoout2barLayout = new FlexLayout();
hitstoout2bar.setLayout(hitstoout2barLayout);
hitstoout2bar.setInlineStyle("flex-direction: 'row';")

hitstoout2barLayout.addWidget(hitstoout2);
hitstoout2barLayout.addWidget(hitstoout2val);

const hitstoout3bar = new QWidget();
hitstoout3bar.setObjectName('hitstoout3bar');
const hitstoout3barLayout = new FlexLayout();
hitstoout3bar.setLayout(hitstoout3barLayout);
hitstoout3bar.setInlineStyle("flex-direction: 'row';")

hitstoout3barLayout.addWidget(hitstoout3);
hitstoout3barLayout.addWidget(hitstoout3val);

const hitstoout4bar = new QWidget();
hitstoout4bar.setObjectName('hitstoout4bar');
const hitstoout4barLayout = new FlexLayout();
hitstoout4bar.setLayout(hitstoout4barLayout);
hitstoout4bar.setInlineStyle("flex-direction: 'row';")

hitstoout4barLayout.addWidget(hitstoout4);
hitstoout4barLayout.addWidget(hitstoout4val);

const hitstoout5bar = new QWidget();
hitstoout5bar.setObjectName('hitstoout5bar');
const hitstoout5barLayout = new FlexLayout();
hitstoout5bar.setLayout(hitstoout5barLayout);
hitstoout5bar.setInlineStyle("flex-direction: 'row';")

hitstoout5barLayout.addWidget(hitstoout5);
hitstoout5barLayout.addWidget(hitstoout5val);

const hitstoout6bar = new QWidget();
hitstoout6bar.setObjectName('hitstoout6bar');
const hitstoout6barLayout = new FlexLayout();
hitstoout6bar.setLayout(hitstoout6barLayout);
hitstoout6bar.setInlineStyle("flex-direction: 'row';")

hitstoout6barLayout.addWidget(hitstoout6);
hitstoout6barLayout.addWidget(hitstoout6val);

const hitstoout7bar = new QWidget();
hitstoout7bar.setObjectName('hitstoout7bar');
const hitstoout7barLayout = new FlexLayout();
hitstoout7bar.setLayout(hitstoout7barLayout);
hitstoout7bar.setInlineStyle("flex-direction: 'row';")

hitstoout7barLayout.addWidget(hitstoout7);
hitstoout7barLayout.addWidget(hitstoout7val);

const hitstoout8bar = new QWidget();
hitstoout8bar.setObjectName('hitstoout8bar');
const hitstoout8barLayout = new FlexLayout();
hitstoout8bar.setLayout(hitstoout8barLayout);
hitstoout8bar.setInlineStyle("flex-direction: 'row';")

hitstoout8barLayout.addWidget(hitstoout8);
hitstoout8barLayout.addWidget(hitstoout8val);

const hitstoout9bar = new QWidget();
hitstoout9bar.setObjectName('hitstoout9bar');
const hitstoout9barLayout = new FlexLayout();
hitstoout9bar.setLayout(hitstoout9barLayout);
hitstoout9bar.setInlineStyle("flex-direction: 'row';")

hitstoout9barLayout.addWidget(hitstoout9);
hitstoout9barLayout.addWidget(hitstoout9val);

const hitstoout10bar = new QWidget();
hitstoout10bar.setObjectName('hitstoout10bar');
const hitstoout10barLayout = new FlexLayout();
hitstoout10bar.setLayout(hitstoout10barLayout);
hitstoout10bar.setInlineStyle("flex-direction: 'row';")

hitstoout10barLayout.addWidget(hitstoout10);
hitstoout10barLayout.addWidget(hitstoout10val);


const hitstooutBarsArr = [[hitstoout1, hitstoout1val], [hitstoout2, hitstoout2val], [hitstoout3, hitstoout3val], [hitstoout4, hitstoout4val], [hitstoout5, hitstoout5val], [hitstoout6, hitstoout6val], [hitstoout7, hitstoout7val], [hitstoout8, hitstoout8val], [hitstoout9, hitstoout9val], [hitstoout10, hitstoout10val]]

hitstooutTileLayout.addWidget(hitstooutTitle);
hitstooutTileLayout.addWidget(hitstoout1bar);
hitstooutTileLayout.addWidget(hitstoout2bar);
hitstooutTileLayout.addWidget(hitstoout3bar);
hitstooutTileLayout.addWidget(hitstoout4bar);
hitstooutTileLayout.addWidget(hitstoout5bar);
hitstooutTileLayout.addWidget(hitstoout6bar);
hitstooutTileLayout.addWidget(hitstoout7bar);
hitstooutTileLayout.addWidget(hitstoout8bar);
hitstooutTileLayout.addWidget(hitstoout9bar);
hitstooutTileLayout.addWidget(hitstoout10bar);


const hitstooffenseTile = new QWidget();
hitstooffenseTile.setObjectName('hitstooffenseTile');
const hitstooffenseTileLayout = new FlexLayout();
hitstooffenseTile.setLayout(hitstooffenseTileLayout);
hitstooffenseTile.setInlineStyle("flex-direction: 'column';");

let hitstooffenseTitle = new QLabel();
hitstooffenseTitle.setText("HITS TO OFFENSE");
hitstooffenseTitle.setInlineStyle("height: 50px;");
let hitstooffense1 = new QLabel();
hitstooffense1.setInlineStyle("width: '150px';");
hitstooffense1.setObjectName("recordLabel");
let hitstooffense1val = new QLabel();
hitstooffense1val.setInlineStyle("width: '50px';");
hitstooffense1val.setObjectName("recordLabel");
let hitstooffense2 = new QLabel();
hitstooffense2.setInlineStyle("width: '150px';");
hitstooffense2.setObjectName("recordLabel");
let hitstooffense2val = new QLabel();
hitstooffense2val.setInlineStyle("width: '50px';");
hitstooffense2val.setObjectName("recordLabel");
let hitstooffense3 = new QLabel();
hitstooffense3.setInlineStyle("width: '150px';");
hitstooffense3.setObjectName("recordLabel");
let hitstooffense3val = new QLabel();
hitstooffense3val.setInlineStyle("width: '50px';");
hitstooffense3val.setObjectName("recordLabel");
let hitstooffense4 = new QLabel();
hitstooffense4.setInlineStyle("width: '150px';");
hitstooffense4.setObjectName("recordLabel");
let hitstooffense4val = new QLabel();
hitstooffense4val.setInlineStyle("width: '50px';");
hitstooffense4val.setObjectName("recordLabel");
let hitstooffense5 = new QLabel();
hitstooffense5.setInlineStyle("width: '150px';");
hitstooffense5.setObjectName("recordLabel");
let hitstooffense5val = new QLabel();
hitstooffense5val.setInlineStyle("width: '50px';");
hitstooffense5val.setObjectName("recordLabel");
let hitstooffense6 = new QLabel();
hitstooffense6.setInlineStyle("width: '150px';");
hitstooffense6.setObjectName("recordLabel");
let hitstooffense6val = new QLabel();
hitstooffense6val.setInlineStyle("width: '50px';");
hitstooffense6val.setObjectName("recordLabel");
let hitstooffense7 = new QLabel();
hitstooffense7.setInlineStyle("width: '150px';");
hitstooffense7.setObjectName("recordLabel");
let hitstooffense7val = new QLabel();
hitstooffense7val.setInlineStyle("width: '50px';");
hitstooffense7val.setObjectName("recordLabel");
let hitstooffense8 = new QLabel();
hitstooffense8.setInlineStyle("width: '150px';");
hitstooffense8.setObjectName("recordLabel");
let hitstooffense8val = new QLabel();
hitstooffense8val.setInlineStyle("width: '50px';");
hitstooffense8val.setObjectName("recordLabel");
let hitstooffense9 = new QLabel();
hitstooffense9.setInlineStyle("width: '150px';");
hitstooffense9.setObjectName("recordLabel");
let hitstooffense9val = new QLabel();
hitstooffense9val.setInlineStyle("width: '50px';");
hitstooffense9val.setObjectName("recordLabel");
let hitstooffense10 = new QLabel();
hitstooffense10.setInlineStyle("width: '150px';");
hitstooffense10.setObjectName("recordLabel");
let hitstooffense10val = new QLabel();
hitstooffense10val.setInlineStyle("width: '50px';");
hitstooffense10val.setObjectName("recordLabel");

const hitstooffense1bar = new QWidget();
hitstooffense1bar.setObjectName('hitstooffense1bar');
const hitstooffense1barLayout = new FlexLayout();
hitstooffense1bar.setLayout(hitstooffense1barLayout);
hitstooffense1bar.setInlineStyle("flex-direction: 'row';")

hitstooffense1barLayout.addWidget(hitstooffense1);
hitstooffense1barLayout.addWidget(hitstooffense1val);

const hitstooffense2bar = new QWidget();
hitstooffense2bar.setObjectName('hitstooffense2bar');
const hitstooffense2barLayout = new FlexLayout();
hitstooffense2bar.setLayout(hitstooffense2barLayout);
hitstooffense2bar.setInlineStyle("flex-direction: 'row';")

hitstooffense2barLayout.addWidget(hitstooffense2);
hitstooffense2barLayout.addWidget(hitstooffense2val);

const hitstooffense3bar = new QWidget();
hitstooffense3bar.setObjectName('hitstooffense3bar');
const hitstooffense3barLayout = new FlexLayout();
hitstooffense3bar.setLayout(hitstooffense3barLayout);
hitstooffense3bar.setInlineStyle("flex-direction: 'row';")

hitstooffense3barLayout.addWidget(hitstooffense3);
hitstooffense3barLayout.addWidget(hitstooffense3val);

const hitstooffense4bar = new QWidget();
hitstooffense4bar.setObjectName('hitstooffense4bar');
const hitstooffense4barLayout = new FlexLayout();
hitstooffense4bar.setLayout(hitstooffense4barLayout);
hitstooffense4bar.setInlineStyle("flex-direction: 'row';")

hitstooffense4barLayout.addWidget(hitstooffense4);
hitstooffense4barLayout.addWidget(hitstooffense4val);

const hitstooffense5bar = new QWidget();
hitstooffense5bar.setObjectName('hitstooffense5bar');
const hitstooffense5barLayout = new FlexLayout();
hitstooffense5bar.setLayout(hitstooffense5barLayout);
hitstooffense5bar.setInlineStyle("flex-direction: 'row';")

hitstooffense5barLayout.addWidget(hitstooffense5);
hitstooffense5barLayout.addWidget(hitstooffense5val);

const hitstooffense6bar = new QWidget();
hitstooffense6bar.setObjectName('hitstooffense6bar');
const hitstooffense6barLayout = new FlexLayout();
hitstooffense6bar.setLayout(hitstooffense6barLayout);
hitstooffense6bar.setInlineStyle("flex-direction: 'row';")

hitstooffense6barLayout.addWidget(hitstooffense6);
hitstooffense6barLayout.addWidget(hitstooffense6val);

const hitstooffense7bar = new QWidget();
hitstooffense7bar.setObjectName('hitstooffense7bar');
const hitstooffense7barLayout = new FlexLayout();
hitstooffense7bar.setLayout(hitstooffense7barLayout);
hitstooffense7bar.setInlineStyle("flex-direction: 'row';")

hitstooffense7barLayout.addWidget(hitstooffense7);
hitstooffense7barLayout.addWidget(hitstooffense7val);

const hitstooffense8bar = new QWidget();
hitstooffense8bar.setObjectName('hitstooffense8bar');
const hitstooffense8barLayout = new FlexLayout();
hitstooffense8bar.setLayout(hitstooffense8barLayout);
hitstooffense8bar.setInlineStyle("flex-direction: 'row';")

hitstooffense8barLayout.addWidget(hitstooffense8);
hitstooffense8barLayout.addWidget(hitstooffense8val);

const hitstooffense9bar = new QWidget();
hitstooffense9bar.setObjectName('hitstooffense9bar');
const hitstooffense9barLayout = new FlexLayout();
hitstooffense9bar.setLayout(hitstooffense9barLayout);
hitstooffense9bar.setInlineStyle("flex-direction: 'row';")

hitstooffense9barLayout.addWidget(hitstooffense9);
hitstooffense9barLayout.addWidget(hitstooffense9val);

const hitstooffense10bar = new QWidget();
hitstooffense10bar.setObjectName('hitstooffense10bar');
const hitstooffense10barLayout = new FlexLayout();
hitstooffense10bar.setLayout(hitstooffense10barLayout);
hitstooffense10bar.setInlineStyle("flex-direction: 'row';")

hitstooffense10barLayout.addWidget(hitstooffense10);
hitstooffense10barLayout.addWidget(hitstooffense10val);


const hitstooffenseBarsArr = [[hitstooffense1, hitstooffense1val], [hitstooffense2, hitstooffense2val], [hitstooffense3, hitstooffense3val], [hitstooffense4, hitstooffense4val], [hitstooffense5, hitstooffense5val], [hitstooffense6, hitstooffense6val], [hitstooffense7, hitstooffense7val], [hitstooffense8, hitstooffense8val], [hitstooffense9, hitstooffense9val], [hitstooffense10, hitstooffense10val]]

hitstooffenseTileLayout.addWidget(hitstooffenseTitle);
hitstooffenseTileLayout.addWidget(hitstooffense1bar);
hitstooffenseTileLayout.addWidget(hitstooffense2bar);
hitstooffenseTileLayout.addWidget(hitstooffense3bar);
hitstooffenseTileLayout.addWidget(hitstooffense4bar);
hitstooffenseTileLayout.addWidget(hitstooffense5bar);
hitstooffenseTileLayout.addWidget(hitstooffense6bar);
hitstooffenseTileLayout.addWidget(hitstooffense7bar);
hitstooffenseTileLayout.addWidget(hitstooffense8bar);
hitstooffenseTileLayout.addWidget(hitstooffense9bar);
hitstooffenseTileLayout.addWidget(hitstooffense10bar);


const fouloutsTile = new QWidget();
fouloutsTile.setObjectName('fouloutsTile');
const fouloutsTileLayout = new FlexLayout();
fouloutsTile.setLayout(fouloutsTileLayout);
fouloutsTile.setInlineStyle("flex-direction: 'column';");

let fouloutsTitle = new QLabel();
fouloutsTitle.setText("FOULOUTS");
fouloutsTitle.setInlineStyle("height: 50px;");
let foulouts1 = new QLabel();
foulouts1.setInlineStyle("width: '150px';");
foulouts1.setObjectName("recordLabel");
let foulouts1val = new QLabel();
foulouts1val.setInlineStyle("width: '50px';");
foulouts1val.setObjectName("recordLabel");
let foulouts2 = new QLabel();
foulouts2.setInlineStyle("width: '150px';");
foulouts2.setObjectName("recordLabel");
let foulouts2val = new QLabel();
foulouts2val.setInlineStyle("width: '50px';");
foulouts2val.setObjectName("recordLabel");
let foulouts3 = new QLabel();
foulouts3.setInlineStyle("width: '150px';");
foulouts3.setObjectName("recordLabel");
let foulouts3val = new QLabel();
foulouts3val.setInlineStyle("width: '50px';");
foulouts3val.setObjectName("recordLabel");
let foulouts4 = new QLabel();
foulouts4.setInlineStyle("width: '150px';");
foulouts4.setObjectName("recordLabel");
let foulouts4val = new QLabel();
foulouts4val.setInlineStyle("width: '50px';");
foulouts4val.setObjectName("recordLabel");
let foulouts5 = new QLabel();
foulouts5.setInlineStyle("width: '150px';");
foulouts5.setObjectName("recordLabel");
let foulouts5val = new QLabel();
foulouts5val.setInlineStyle("width: '50px';");
foulouts5val.setObjectName("recordLabel");
let foulouts6 = new QLabel();
foulouts6.setInlineStyle("width: '150px';");
foulouts6.setObjectName("recordLabel");
let foulouts6val = new QLabel();
foulouts6val.setInlineStyle("width: '50px';");
foulouts6val.setObjectName("recordLabel");
let foulouts7 = new QLabel();
foulouts7.setInlineStyle("width: '150px';");
foulouts7.setObjectName("recordLabel");
let foulouts7val = new QLabel();
foulouts7val.setInlineStyle("width: '50px';");
foulouts7val.setObjectName("recordLabel");
let foulouts8 = new QLabel();
foulouts8.setInlineStyle("width: '150px';");
foulouts8.setObjectName("recordLabel");
let foulouts8val = new QLabel();
foulouts8val.setInlineStyle("width: '50px';");
foulouts8val.setObjectName("recordLabel");
let foulouts9 = new QLabel();
foulouts9.setInlineStyle("width: '150px';");
foulouts9.setObjectName("recordLabel");
let foulouts9val = new QLabel();
foulouts9val.setInlineStyle("width: '50px';");
foulouts9val.setObjectName("recordLabel");
let foulouts10 = new QLabel();
foulouts10.setInlineStyle("width: '150px';");
foulouts10.setObjectName("recordLabel");
let foulouts10val = new QLabel();
foulouts10val.setInlineStyle("width: '50px';");
foulouts10val.setObjectName("recordLabel");

const foulouts1bar = new QWidget();
foulouts1bar.setObjectName('foulouts1bar');
const foulouts1barLayout = new FlexLayout();
foulouts1bar.setLayout(foulouts1barLayout);
foulouts1bar.setInlineStyle("flex-direction: 'row';")

foulouts1barLayout.addWidget(foulouts1);
foulouts1barLayout.addWidget(foulouts1val);

const foulouts2bar = new QWidget();
foulouts2bar.setObjectName('foulouts2bar');
const foulouts2barLayout = new FlexLayout();
foulouts2bar.setLayout(foulouts2barLayout);
foulouts2bar.setInlineStyle("flex-direction: 'row';")

foulouts2barLayout.addWidget(foulouts2);
foulouts2barLayout.addWidget(foulouts2val);

const foulouts3bar = new QWidget();
foulouts3bar.setObjectName('foulouts3bar');
const foulouts3barLayout = new FlexLayout();
foulouts3bar.setLayout(foulouts3barLayout);
foulouts3bar.setInlineStyle("flex-direction: 'row';")

foulouts3barLayout.addWidget(foulouts3);
foulouts3barLayout.addWidget(foulouts3val);

const foulouts4bar = new QWidget();
foulouts4bar.setObjectName('foulouts4bar');
const foulouts4barLayout = new FlexLayout();
foulouts4bar.setLayout(foulouts4barLayout);
foulouts4bar.setInlineStyle("flex-direction: 'row';")

foulouts4barLayout.addWidget(foulouts4);
foulouts4barLayout.addWidget(foulouts4val);

const foulouts5bar = new QWidget();
foulouts5bar.setObjectName('foulouts5bar');
const foulouts5barLayout = new FlexLayout();
foulouts5bar.setLayout(foulouts5barLayout);
foulouts5bar.setInlineStyle("flex-direction: 'row';")

foulouts5barLayout.addWidget(foulouts5);
foulouts5barLayout.addWidget(foulouts5val);

const foulouts6bar = new QWidget();
foulouts6bar.setObjectName('foulouts6bar');
const foulouts6barLayout = new FlexLayout();
foulouts6bar.setLayout(foulouts6barLayout);
foulouts6bar.setInlineStyle("flex-direction: 'row';")

foulouts6barLayout.addWidget(foulouts6);
foulouts6barLayout.addWidget(foulouts6val);

const foulouts7bar = new QWidget();
foulouts7bar.setObjectName('foulouts7bar');
const foulouts7barLayout = new FlexLayout();
foulouts7bar.setLayout(foulouts7barLayout);
foulouts7bar.setInlineStyle("flex-direction: 'row';")

foulouts7barLayout.addWidget(foulouts7);
foulouts7barLayout.addWidget(foulouts7val);

const foulouts8bar = new QWidget();
foulouts8bar.setObjectName('foulouts8bar');
const foulouts8barLayout = new FlexLayout();
foulouts8bar.setLayout(foulouts8barLayout);
foulouts8bar.setInlineStyle("flex-direction: 'row';")

foulouts8barLayout.addWidget(foulouts8);
foulouts8barLayout.addWidget(foulouts8val);

const foulouts9bar = new QWidget();
foulouts9bar.setObjectName('foulouts9bar');
const foulouts9barLayout = new FlexLayout();
foulouts9bar.setLayout(foulouts9barLayout);
foulouts9bar.setInlineStyle("flex-direction: 'row';")

foulouts9barLayout.addWidget(foulouts9);
foulouts9barLayout.addWidget(foulouts9val);

const foulouts10bar = new QWidget();
foulouts10bar.setObjectName('foulouts10bar');
const foulouts10barLayout = new FlexLayout();
foulouts10bar.setLayout(foulouts10barLayout);
foulouts10bar.setInlineStyle("flex-direction: 'row';")

foulouts10barLayout.addWidget(foulouts10);
foulouts10barLayout.addWidget(foulouts10val);


const fouloutsBarsArr = [[foulouts1, foulouts1val], [foulouts2, foulouts2val], [foulouts3, foulouts3val], [foulouts4, foulouts4val], [foulouts5, foulouts5val], [foulouts6, foulouts6val], [foulouts7, foulouts7val], [foulouts8, foulouts8val], [foulouts9, foulouts9val], [foulouts10, foulouts10val]]

fouloutsTileLayout.addWidget(fouloutsTitle);
fouloutsTileLayout.addWidget(foulouts1bar);
fouloutsTileLayout.addWidget(foulouts2bar);
fouloutsTileLayout.addWidget(foulouts3bar);
fouloutsTileLayout.addWidget(foulouts4bar);
fouloutsTileLayout.addWidget(foulouts5bar);
fouloutsTileLayout.addWidget(foulouts6bar);
fouloutsTileLayout.addWidget(foulouts7bar);
fouloutsTileLayout.addWidget(foulouts8bar);
fouloutsTileLayout.addWidget(foulouts9bar);
fouloutsTileLayout.addWidget(foulouts10bar);


const strikeoutsbattingTile = new QWidget();
strikeoutsbattingTile.setObjectName('strikeoutsbattingTile');
const strikeoutsbattingTileLayout = new FlexLayout();
strikeoutsbattingTile.setLayout(strikeoutsbattingTileLayout);
strikeoutsbattingTile.setInlineStyle("flex-direction: 'column';");

let strikeoutsbattingTitle = new QLabel();
strikeoutsbattingTitle.setText("STRIKEOUTS BATTING");
strikeoutsbattingTitle.setInlineStyle("height: 50px;");
let strikeoutsbatting1 = new QLabel();
strikeoutsbatting1.setInlineStyle("width: '150px';");
strikeoutsbatting1.setObjectName("recordLabel");
let strikeoutsbatting1val = new QLabel();
strikeoutsbatting1val.setInlineStyle("width: '50px';");
strikeoutsbatting1val.setObjectName("recordLabel");
let strikeoutsbatting2 = new QLabel();
strikeoutsbatting2.setInlineStyle("width: '150px';");
strikeoutsbatting2.setObjectName("recordLabel");
let strikeoutsbatting2val = new QLabel();
strikeoutsbatting2val.setInlineStyle("width: '50px';");
strikeoutsbatting2val.setObjectName("recordLabel");
let strikeoutsbatting3 = new QLabel();
strikeoutsbatting3.setInlineStyle("width: '150px';");
strikeoutsbatting3.setObjectName("recordLabel");
let strikeoutsbatting3val = new QLabel();
strikeoutsbatting3val.setInlineStyle("width: '50px';");
strikeoutsbatting3val.setObjectName("recordLabel");
let strikeoutsbatting4 = new QLabel();
strikeoutsbatting4.setInlineStyle("width: '150px';");
strikeoutsbatting4.setObjectName("recordLabel");
let strikeoutsbatting4val = new QLabel();
strikeoutsbatting4val.setInlineStyle("width: '50px';");
strikeoutsbatting4val.setObjectName("recordLabel");
let strikeoutsbatting5 = new QLabel();
strikeoutsbatting5.setInlineStyle("width: '150px';");
strikeoutsbatting5.setObjectName("recordLabel");
let strikeoutsbatting5val = new QLabel();
strikeoutsbatting5val.setInlineStyle("width: '50px';");
strikeoutsbatting5val.setObjectName("recordLabel");
let strikeoutsbatting6 = new QLabel();
strikeoutsbatting6.setInlineStyle("width: '150px';");
strikeoutsbatting6.setObjectName("recordLabel");
let strikeoutsbatting6val = new QLabel();
strikeoutsbatting6val.setInlineStyle("width: '50px';");
strikeoutsbatting6val.setObjectName("recordLabel");
let strikeoutsbatting7 = new QLabel();
strikeoutsbatting7.setInlineStyle("width: '150px';");
strikeoutsbatting7.setObjectName("recordLabel");
let strikeoutsbatting7val = new QLabel();
strikeoutsbatting7val.setInlineStyle("width: '50px';");
strikeoutsbatting7val.setObjectName("recordLabel");
let strikeoutsbatting8 = new QLabel();
strikeoutsbatting8.setInlineStyle("width: '150px';");
strikeoutsbatting8.setObjectName("recordLabel");
let strikeoutsbatting8val = new QLabel();
strikeoutsbatting8val.setInlineStyle("width: '50px';");
strikeoutsbatting8val.setObjectName("recordLabel");
let strikeoutsbatting9 = new QLabel();
strikeoutsbatting9.setInlineStyle("width: '150px';");
strikeoutsbatting9.setObjectName("recordLabel");
let strikeoutsbatting9val = new QLabel();
strikeoutsbatting9val.setInlineStyle("width: '50px';");
strikeoutsbatting9val.setObjectName("recordLabel");
let strikeoutsbatting10 = new QLabel();
strikeoutsbatting10.setInlineStyle("width: '150px';");
strikeoutsbatting10.setObjectName("recordLabel");
let strikeoutsbatting10val = new QLabel();
strikeoutsbatting10val.setInlineStyle("width: '50px';");
strikeoutsbatting10val.setObjectName("recordLabel");

const strikeoutsbatting1bar = new QWidget();
strikeoutsbatting1bar.setObjectName('strikeoutsbatting1bar');
const strikeoutsbatting1barLayout = new FlexLayout();
strikeoutsbatting1bar.setLayout(strikeoutsbatting1barLayout);
strikeoutsbatting1bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting1barLayout.addWidget(strikeoutsbatting1);
strikeoutsbatting1barLayout.addWidget(strikeoutsbatting1val);

const strikeoutsbatting2bar = new QWidget();
strikeoutsbatting2bar.setObjectName('strikeoutsbatting2bar');
const strikeoutsbatting2barLayout = new FlexLayout();
strikeoutsbatting2bar.setLayout(strikeoutsbatting2barLayout);
strikeoutsbatting2bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting2barLayout.addWidget(strikeoutsbatting2);
strikeoutsbatting2barLayout.addWidget(strikeoutsbatting2val);

const strikeoutsbatting3bar = new QWidget();
strikeoutsbatting3bar.setObjectName('strikeoutsbatting3bar');
const strikeoutsbatting3barLayout = new FlexLayout();
strikeoutsbatting3bar.setLayout(strikeoutsbatting3barLayout);
strikeoutsbatting3bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting3barLayout.addWidget(strikeoutsbatting3);
strikeoutsbatting3barLayout.addWidget(strikeoutsbatting3val);

const strikeoutsbatting4bar = new QWidget();
strikeoutsbatting4bar.setObjectName('strikeoutsbatting4bar');
const strikeoutsbatting4barLayout = new FlexLayout();
strikeoutsbatting4bar.setLayout(strikeoutsbatting4barLayout);
strikeoutsbatting4bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting4barLayout.addWidget(strikeoutsbatting4);
strikeoutsbatting4barLayout.addWidget(strikeoutsbatting4val);

const strikeoutsbatting5bar = new QWidget();
strikeoutsbatting5bar.setObjectName('strikeoutsbatting5bar');
const strikeoutsbatting5barLayout = new FlexLayout();
strikeoutsbatting5bar.setLayout(strikeoutsbatting5barLayout);
strikeoutsbatting5bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting5barLayout.addWidget(strikeoutsbatting5);
strikeoutsbatting5barLayout.addWidget(strikeoutsbatting5val);

const strikeoutsbatting6bar = new QWidget();
strikeoutsbatting6bar.setObjectName('strikeoutsbatting6bar');
const strikeoutsbatting6barLayout = new FlexLayout();
strikeoutsbatting6bar.setLayout(strikeoutsbatting6barLayout);
strikeoutsbatting6bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting6barLayout.addWidget(strikeoutsbatting6);
strikeoutsbatting6barLayout.addWidget(strikeoutsbatting6val);

const strikeoutsbatting7bar = new QWidget();
strikeoutsbatting7bar.setObjectName('strikeoutsbatting7bar');
const strikeoutsbatting7barLayout = new FlexLayout();
strikeoutsbatting7bar.setLayout(strikeoutsbatting7barLayout);
strikeoutsbatting7bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting7barLayout.addWidget(strikeoutsbatting7);
strikeoutsbatting7barLayout.addWidget(strikeoutsbatting7val);

const strikeoutsbatting8bar = new QWidget();
strikeoutsbatting8bar.setObjectName('strikeoutsbatting8bar');
const strikeoutsbatting8barLayout = new FlexLayout();
strikeoutsbatting8bar.setLayout(strikeoutsbatting8barLayout);
strikeoutsbatting8bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting8barLayout.addWidget(strikeoutsbatting8);
strikeoutsbatting8barLayout.addWidget(strikeoutsbatting8val);

const strikeoutsbatting9bar = new QWidget();
strikeoutsbatting9bar.setObjectName('strikeoutsbatting9bar');
const strikeoutsbatting9barLayout = new FlexLayout();
strikeoutsbatting9bar.setLayout(strikeoutsbatting9barLayout);
strikeoutsbatting9bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting9barLayout.addWidget(strikeoutsbatting9);
strikeoutsbatting9barLayout.addWidget(strikeoutsbatting9val);

const strikeoutsbatting10bar = new QWidget();
strikeoutsbatting10bar.setObjectName('strikeoutsbatting10bar');
const strikeoutsbatting10barLayout = new FlexLayout();
strikeoutsbatting10bar.setLayout(strikeoutsbatting10barLayout);
strikeoutsbatting10bar.setInlineStyle("flex-direction: 'row';")

strikeoutsbatting10barLayout.addWidget(strikeoutsbatting10);
strikeoutsbatting10barLayout.addWidget(strikeoutsbatting10val);


const strikeoutsbattingBarsArr = [[strikeoutsbatting1, strikeoutsbatting1val], [strikeoutsbatting2, strikeoutsbatting2val], [strikeoutsbatting3, strikeoutsbatting3val], [strikeoutsbatting4, strikeoutsbatting4val], [strikeoutsbatting5, strikeoutsbatting5val], [strikeoutsbatting6, strikeoutsbatting6val], [strikeoutsbatting7, strikeoutsbatting7val], [strikeoutsbatting8, strikeoutsbatting8val], [strikeoutsbatting9, strikeoutsbatting9val], [strikeoutsbatting10, strikeoutsbatting10val]]

strikeoutsbattingTileLayout.addWidget(strikeoutsbattingTitle);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting1bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting2bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting3bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting4bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting5bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting6bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting7bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting8bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting9bar);
strikeoutsbattingTileLayout.addWidget(strikeoutsbatting10bar);


const tacklesTile = new QWidget();
tacklesTile.setObjectName('tacklesTile');
const tacklesTileLayout = new FlexLayout();
tacklesTile.setLayout(tacklesTileLayout);
tacklesTile.setInlineStyle("flex-direction: 'column';");

let tacklesTitle = new QLabel();
tacklesTitle.setText("TACKLES");
tacklesTitle.setInlineStyle("height: 50px;");
let tackles1 = new QLabel();
tackles1.setInlineStyle("width: '150px';");
tackles1.setObjectName("recordLabel");
let tackles1val = new QLabel();
tackles1val.setInlineStyle("width: '50px';");
tackles1val.setObjectName("recordLabel");
let tackles2 = new QLabel();
tackles2.setInlineStyle("width: '150px';");
tackles2.setObjectName("recordLabel");
let tackles2val = new QLabel();
tackles2val.setInlineStyle("width: '50px';");
tackles2val.setObjectName("recordLabel");
let tackles3 = new QLabel();
tackles3.setInlineStyle("width: '150px';");
tackles3.setObjectName("recordLabel");
let tackles3val = new QLabel();
tackles3val.setInlineStyle("width: '50px';");
tackles3val.setObjectName("recordLabel");
let tackles4 = new QLabel();
tackles4.setInlineStyle("width: '150px';");
tackles4.setObjectName("recordLabel");
let tackles4val = new QLabel();
tackles4val.setInlineStyle("width: '50px';");
tackles4val.setObjectName("recordLabel");
let tackles5 = new QLabel();
tackles5.setInlineStyle("width: '150px';");
tackles5.setObjectName("recordLabel");
let tackles5val = new QLabel();
tackles5val.setInlineStyle("width: '50px';");
tackles5val.setObjectName("recordLabel");
let tackles6 = new QLabel();
tackles6.setInlineStyle("width: '150px';");
tackles6.setObjectName("recordLabel");
let tackles6val = new QLabel();
tackles6val.setInlineStyle("width: '50px';");
tackles6val.setObjectName("recordLabel");
let tackles7 = new QLabel();
tackles7.setInlineStyle("width: '150px';");
tackles7.setObjectName("recordLabel");
let tackles7val = new QLabel();
tackles7val.setInlineStyle("width: '50px';");
tackles7val.setObjectName("recordLabel");
let tackles8 = new QLabel();
tackles8.setInlineStyle("width: '150px';");
tackles8.setObjectName("recordLabel");
let tackles8val = new QLabel();
tackles8val.setInlineStyle("width: '50px';");
tackles8val.setObjectName("recordLabel");
let tackles9 = new QLabel();
tackles9.setInlineStyle("width: '150px';");
tackles9.setObjectName("recordLabel");
let tackles9val = new QLabel();
tackles9val.setInlineStyle("width: '50px';");
tackles9val.setObjectName("recordLabel");
let tackles10 = new QLabel();
tackles10.setInlineStyle("width: '150px';");
tackles10.setObjectName("recordLabel");
let tackles10val = new QLabel();
tackles10val.setInlineStyle("width: '50px';");
tackles10val.setObjectName("recordLabel");

const tackles1bar = new QWidget();
tackles1bar.setObjectName('tackles1bar');
const tackles1barLayout = new FlexLayout();
tackles1bar.setLayout(tackles1barLayout);
tackles1bar.setInlineStyle("flex-direction: 'row';")

tackles1barLayout.addWidget(tackles1);
tackles1barLayout.addWidget(tackles1val);

const tackles2bar = new QWidget();
tackles2bar.setObjectName('tackles2bar');
const tackles2barLayout = new FlexLayout();
tackles2bar.setLayout(tackles2barLayout);
tackles2bar.setInlineStyle("flex-direction: 'row';")

tackles2barLayout.addWidget(tackles2);
tackles2barLayout.addWidget(tackles2val);

const tackles3bar = new QWidget();
tackles3bar.setObjectName('tackles3bar');
const tackles3barLayout = new FlexLayout();
tackles3bar.setLayout(tackles3barLayout);
tackles3bar.setInlineStyle("flex-direction: 'row';")

tackles3barLayout.addWidget(tackles3);
tackles3barLayout.addWidget(tackles3val);

const tackles4bar = new QWidget();
tackles4bar.setObjectName('tackles4bar');
const tackles4barLayout = new FlexLayout();
tackles4bar.setLayout(tackles4barLayout);
tackles4bar.setInlineStyle("flex-direction: 'row';")

tackles4barLayout.addWidget(tackles4);
tackles4barLayout.addWidget(tackles4val);

const tackles5bar = new QWidget();
tackles5bar.setObjectName('tackles5bar');
const tackles5barLayout = new FlexLayout();
tackles5bar.setLayout(tackles5barLayout);
tackles5bar.setInlineStyle("flex-direction: 'row';")

tackles5barLayout.addWidget(tackles5);
tackles5barLayout.addWidget(tackles5val);

const tackles6bar = new QWidget();
tackles6bar.setObjectName('tackles6bar');
const tackles6barLayout = new FlexLayout();
tackles6bar.setLayout(tackles6barLayout);
tackles6bar.setInlineStyle("flex-direction: 'row';")

tackles6barLayout.addWidget(tackles6);
tackles6barLayout.addWidget(tackles6val);

const tackles7bar = new QWidget();
tackles7bar.setObjectName('tackles7bar');
const tackles7barLayout = new FlexLayout();
tackles7bar.setLayout(tackles7barLayout);
tackles7bar.setInlineStyle("flex-direction: 'row';")

tackles7barLayout.addWidget(tackles7);
tackles7barLayout.addWidget(tackles7val);

const tackles8bar = new QWidget();
tackles8bar.setObjectName('tackles8bar');
const tackles8barLayout = new FlexLayout();
tackles8bar.setLayout(tackles8barLayout);
tackles8bar.setInlineStyle("flex-direction: 'row';")

tackles8barLayout.addWidget(tackles8);
tackles8barLayout.addWidget(tackles8val);

const tackles9bar = new QWidget();
tackles9bar.setObjectName('tackles9bar');
const tackles9barLayout = new FlexLayout();
tackles9bar.setLayout(tackles9barLayout);
tackles9bar.setInlineStyle("flex-direction: 'row';")

tackles9barLayout.addWidget(tackles9);
tackles9barLayout.addWidget(tackles9val);

const tackles10bar = new QWidget();
tackles10bar.setObjectName('tackles10bar');
const tackles10barLayout = new FlexLayout();
tackles10bar.setLayout(tackles10barLayout);
tackles10bar.setInlineStyle("flex-direction: 'row';")

tackles10barLayout.addWidget(tackles10);
tackles10barLayout.addWidget(tackles10val);


const tacklesBarsArr = [[tackles1, tackles1val], [tackles2, tackles2val], [tackles3, tackles3val], [tackles4, tackles4val], [tackles5, tackles5val], [tackles6, tackles6val], [tackles7, tackles7val], [tackles8, tackles8val], [tackles9, tackles9val], [tackles10, tackles10val]]

tacklesTileLayout.addWidget(tacklesTitle);
tacklesTileLayout.addWidget(tackles1bar);
tacklesTileLayout.addWidget(tackles2bar);
tacklesTileLayout.addWidget(tackles3bar);
tacklesTileLayout.addWidget(tackles4bar);
tacklesTileLayout.addWidget(tackles5bar);
tacklesTileLayout.addWidget(tackles6bar);
tacklesTileLayout.addWidget(tackles7bar);
tacklesTileLayout.addWidget(tackles8bar);
tacklesTileLayout.addWidget(tackles9bar);
tacklesTileLayout.addWidget(tackles10bar);


const blocksshedTile = new QWidget();
blocksshedTile.setObjectName('blocksshedTile');
const blocksshedTileLayout = new FlexLayout();
blocksshedTile.setLayout(blocksshedTileLayout);
blocksshedTile.setInlineStyle("flex-direction: 'column';");

let blocksshedTitle = new QLabel();
blocksshedTitle.setText("BLOCKS SHED");
blocksshedTitle.setInlineStyle("height: 50px;");
let blocksshed1 = new QLabel();
blocksshed1.setInlineStyle("width: '150px';");
blocksshed1.setObjectName("recordLabel");
let blocksshed1val = new QLabel();
blocksshed1val.setInlineStyle("width: '50px';");
blocksshed1val.setObjectName("recordLabel");
let blocksshed2 = new QLabel();
blocksshed2.setInlineStyle("width: '150px';");
blocksshed2.setObjectName("recordLabel");
let blocksshed2val = new QLabel();
blocksshed2val.setInlineStyle("width: '50px';");
blocksshed2val.setObjectName("recordLabel");
let blocksshed3 = new QLabel();
blocksshed3.setInlineStyle("width: '150px';");
blocksshed3.setObjectName("recordLabel");
let blocksshed3val = new QLabel();
blocksshed3val.setInlineStyle("width: '50px';");
blocksshed3val.setObjectName("recordLabel");
let blocksshed4 = new QLabel();
blocksshed4.setInlineStyle("width: '150px';");
blocksshed4.setObjectName("recordLabel");
let blocksshed4val = new QLabel();
blocksshed4val.setInlineStyle("width: '50px';");
blocksshed4val.setObjectName("recordLabel");
let blocksshed5 = new QLabel();
blocksshed5.setInlineStyle("width: '150px';");
blocksshed5.setObjectName("recordLabel");
let blocksshed5val = new QLabel();
blocksshed5val.setInlineStyle("width: '50px';");
blocksshed5val.setObjectName("recordLabel");
let blocksshed6 = new QLabel();
blocksshed6.setInlineStyle("width: '150px';");
blocksshed6.setObjectName("recordLabel");
let blocksshed6val = new QLabel();
blocksshed6val.setInlineStyle("width: '50px';");
blocksshed6val.setObjectName("recordLabel");
let blocksshed7 = new QLabel();
blocksshed7.setInlineStyle("width: '150px';");
blocksshed7.setObjectName("recordLabel");
let blocksshed7val = new QLabel();
blocksshed7val.setInlineStyle("width: '50px';");
blocksshed7val.setObjectName("recordLabel");
let blocksshed8 = new QLabel();
blocksshed8.setInlineStyle("width: '150px';");
blocksshed8.setObjectName("recordLabel");
let blocksshed8val = new QLabel();
blocksshed8val.setInlineStyle("width: '50px';");
blocksshed8val.setObjectName("recordLabel");
let blocksshed9 = new QLabel();
blocksshed9.setInlineStyle("width: '150px';");
blocksshed9.setObjectName("recordLabel");
let blocksshed9val = new QLabel();
blocksshed9val.setInlineStyle("width: '50px';");
blocksshed9val.setObjectName("recordLabel");
let blocksshed10 = new QLabel();
blocksshed10.setInlineStyle("width: '150px';");
blocksshed10.setObjectName("recordLabel");
let blocksshed10val = new QLabel();
blocksshed10val.setInlineStyle("width: '50px';");
blocksshed10val.setObjectName("recordLabel");

const blocksshed1bar = new QWidget();
blocksshed1bar.setObjectName('blocksshed1bar');
const blocksshed1barLayout = new FlexLayout();
blocksshed1bar.setLayout(blocksshed1barLayout);
blocksshed1bar.setInlineStyle("flex-direction: 'row';")

blocksshed1barLayout.addWidget(blocksshed1);
blocksshed1barLayout.addWidget(blocksshed1val);

const blocksshed2bar = new QWidget();
blocksshed2bar.setObjectName('blocksshed2bar');
const blocksshed2barLayout = new FlexLayout();
blocksshed2bar.setLayout(blocksshed2barLayout);
blocksshed2bar.setInlineStyle("flex-direction: 'row';")

blocksshed2barLayout.addWidget(blocksshed2);
blocksshed2barLayout.addWidget(blocksshed2val);

const blocksshed3bar = new QWidget();
blocksshed3bar.setObjectName('blocksshed3bar');
const blocksshed3barLayout = new FlexLayout();
blocksshed3bar.setLayout(blocksshed3barLayout);
blocksshed3bar.setInlineStyle("flex-direction: 'row';")

blocksshed3barLayout.addWidget(blocksshed3);
blocksshed3barLayout.addWidget(blocksshed3val);

const blocksshed4bar = new QWidget();
blocksshed4bar.setObjectName('blocksshed4bar');
const blocksshed4barLayout = new FlexLayout();
blocksshed4bar.setLayout(blocksshed4barLayout);
blocksshed4bar.setInlineStyle("flex-direction: 'row';")

blocksshed4barLayout.addWidget(blocksshed4);
blocksshed4barLayout.addWidget(blocksshed4val);

const blocksshed5bar = new QWidget();
blocksshed5bar.setObjectName('blocksshed5bar');
const blocksshed5barLayout = new FlexLayout();
blocksshed5bar.setLayout(blocksshed5barLayout);
blocksshed5bar.setInlineStyle("flex-direction: 'row';")

blocksshed5barLayout.addWidget(blocksshed5);
blocksshed5barLayout.addWidget(blocksshed5val);

const blocksshed6bar = new QWidget();
blocksshed6bar.setObjectName('blocksshed6bar');
const blocksshed6barLayout = new FlexLayout();
blocksshed6bar.setLayout(blocksshed6barLayout);
blocksshed6bar.setInlineStyle("flex-direction: 'row';")

blocksshed6barLayout.addWidget(blocksshed6);
blocksshed6barLayout.addWidget(blocksshed6val);

const blocksshed7bar = new QWidget();
blocksshed7bar.setObjectName('blocksshed7bar');
const blocksshed7barLayout = new FlexLayout();
blocksshed7bar.setLayout(blocksshed7barLayout);
blocksshed7bar.setInlineStyle("flex-direction: 'row';")

blocksshed7barLayout.addWidget(blocksshed7);
blocksshed7barLayout.addWidget(blocksshed7val);

const blocksshed8bar = new QWidget();
blocksshed8bar.setObjectName('blocksshed8bar');
const blocksshed8barLayout = new FlexLayout();
blocksshed8bar.setLayout(blocksshed8barLayout);
blocksshed8bar.setInlineStyle("flex-direction: 'row';")

blocksshed8barLayout.addWidget(blocksshed8);
blocksshed8barLayout.addWidget(blocksshed8val);

const blocksshed9bar = new QWidget();
blocksshed9bar.setObjectName('blocksshed9bar');
const blocksshed9barLayout = new FlexLayout();
blocksshed9bar.setLayout(blocksshed9barLayout);
blocksshed9bar.setInlineStyle("flex-direction: 'row';")

blocksshed9barLayout.addWidget(blocksshed9);
blocksshed9barLayout.addWidget(blocksshed9val);

const blocksshed10bar = new QWidget();
blocksshed10bar.setObjectName('blocksshed10bar');
const blocksshed10barLayout = new FlexLayout();
blocksshed10bar.setLayout(blocksshed10barLayout);
blocksshed10bar.setInlineStyle("flex-direction: 'row';")

blocksshed10barLayout.addWidget(blocksshed10);
blocksshed10barLayout.addWidget(blocksshed10val);


const blocksshedBarsArr = [[blocksshed1, blocksshed1val], [blocksshed2, blocksshed2val], [blocksshed3, blocksshed3val], [blocksshed4, blocksshed4val], [blocksshed5, blocksshed5val], [blocksshed6, blocksshed6val], [blocksshed7, blocksshed7val], [blocksshed8, blocksshed8val], [blocksshed9, blocksshed9val], [blocksshed10, blocksshed10val]]

blocksshedTileLayout.addWidget(blocksshedTitle);
blocksshedTileLayout.addWidget(blocksshed1bar);
blocksshedTileLayout.addWidget(blocksshed2bar);
blocksshedTileLayout.addWidget(blocksshed3bar);
blocksshedTileLayout.addWidget(blocksshed4bar);
blocksshedTileLayout.addWidget(blocksshed5bar);
blocksshedTileLayout.addWidget(blocksshed6bar);
blocksshedTileLayout.addWidget(blocksshed7bar);
blocksshedTileLayout.addWidget(blocksshed8bar);
blocksshedTileLayout.addWidget(blocksshed9bar);
blocksshedTileLayout.addWidget(blocksshed10bar);


const interceptionsTile = new QWidget();
interceptionsTile.setObjectName('interceptionsTile');
const interceptionsTileLayout = new FlexLayout();
interceptionsTile.setLayout(interceptionsTileLayout);
interceptionsTile.setInlineStyle("flex-direction: 'column'; border: '1px solid';");

let interceptionsTitle = new QLabel();
interceptionsTitle.setText("INTERCEPTIONS");
interceptionsTitle.setInlineStyle("height: 50px;");
let interceptions1 = new QLabel();
interceptions1.setInlineStyle("width: '150px';");
interceptions1.setObjectName("recordLabel");
let interceptions1val = new QLabel();
interceptions1val.setInlineStyle("width: '50px';");
interceptions1val.setObjectName("recordLabel");
let interceptions2 = new QLabel();
interceptions2.setInlineStyle("width: '150px';");
interceptions2.setObjectName("recordLabel");
let interceptions2val = new QLabel();
interceptions2val.setInlineStyle("width: '50px';");
interceptions2val.setObjectName("recordLabel");
let interceptions3 = new QLabel();
interceptions3.setInlineStyle("width: '150px';");
interceptions3.setObjectName("recordLabel");
let interceptions3val = new QLabel();
interceptions3val.setInlineStyle("width: '50px';");
interceptions3val.setObjectName("recordLabel");
let interceptions4 = new QLabel();
interceptions4.setInlineStyle("width: '150px';");
interceptions4.setObjectName("recordLabel");
let interceptions4val = new QLabel();
interceptions4val.setInlineStyle("width: '50px';");
interceptions4val.setObjectName("recordLabel");
let interceptions5 = new QLabel();
interceptions5.setInlineStyle("width: '150px';");
interceptions5.setObjectName("recordLabel");
let interceptions5val = new QLabel();
interceptions5val.setInlineStyle("width: '50px';");
interceptions5val.setObjectName("recordLabel");
let interceptions6 = new QLabel();
interceptions6.setInlineStyle("width: '150px';");
interceptions6.setObjectName("recordLabel");
let interceptions6val = new QLabel();
interceptions6val.setInlineStyle("width: '50px';");
interceptions6val.setObjectName("recordLabel");
let interceptions7 = new QLabel();
interceptions7.setInlineStyle("width: '150px';");
interceptions7.setObjectName("recordLabel");
let interceptions7val = new QLabel();
interceptions7val.setInlineStyle("width: '50px';");
interceptions7val.setObjectName("recordLabel");
let interceptions8 = new QLabel();
interceptions8.setInlineStyle("width: '150px';");
interceptions8.setObjectName("recordLabel");
let interceptions8val = new QLabel();
interceptions8val.setInlineStyle("width: '50px';");
interceptions8val.setObjectName("recordLabel");
let interceptions9 = new QLabel();
interceptions9.setInlineStyle("width: '150px';");
interceptions9.setObjectName("recordLabel");
let interceptions9val = new QLabel();
interceptions9val.setInlineStyle("width: '50px';");
interceptions9val.setObjectName("recordLabel");
let interceptions10 = new QLabel();
interceptions10.setInlineStyle("width: '150px';");
interceptions10.setObjectName("recordLabel");
let interceptions10val = new QLabel();
interceptions10val.setInlineStyle("width: '50px';");
interceptions10val.setObjectName("recordLabel");

const interceptions1bar = new QWidget();
interceptions1bar.setObjectName('interceptions1bar');
const interceptions1barLayout = new FlexLayout();
interceptions1bar.setLayout(interceptions1barLayout);
interceptions1bar.setInlineStyle("flex-direction: 'row';")

interceptions1barLayout.addWidget(interceptions1);
interceptions1barLayout.addWidget(interceptions1val);

const interceptions2bar = new QWidget();
interceptions2bar.setObjectName('interceptions2bar');
const interceptions2barLayout = new FlexLayout();
interceptions2bar.setLayout(interceptions2barLayout);
interceptions2bar.setInlineStyle("flex-direction: 'row';")

interceptions2barLayout.addWidget(interceptions2);
interceptions2barLayout.addWidget(interceptions2val);

const interceptions3bar = new QWidget();
interceptions3bar.setObjectName('interceptions3bar');
const interceptions3barLayout = new FlexLayout();
interceptions3bar.setLayout(interceptions3barLayout);
interceptions3bar.setInlineStyle("flex-direction: 'row';")

interceptions3barLayout.addWidget(interceptions3);
interceptions3barLayout.addWidget(interceptions3val);

const interceptions4bar = new QWidget();
interceptions4bar.setObjectName('interceptions4bar');
const interceptions4barLayout = new FlexLayout();
interceptions4bar.setLayout(interceptions4barLayout);
interceptions4bar.setInlineStyle("flex-direction: 'row';")

interceptions4barLayout.addWidget(interceptions4);
interceptions4barLayout.addWidget(interceptions4val);

const interceptions5bar = new QWidget();
interceptions5bar.setObjectName('interceptions5bar');
const interceptions5barLayout = new FlexLayout();
interceptions5bar.setLayout(interceptions5barLayout);
interceptions5bar.setInlineStyle("flex-direction: 'row';")

interceptions5barLayout.addWidget(interceptions5);
interceptions5barLayout.addWidget(interceptions5val);

const interceptions6bar = new QWidget();
interceptions6bar.setObjectName('interceptions6bar');
const interceptions6barLayout = new FlexLayout();
interceptions6bar.setLayout(interceptions6barLayout);
interceptions6bar.setInlineStyle("flex-direction: 'row';")

interceptions6barLayout.addWidget(interceptions6);
interceptions6barLayout.addWidget(interceptions6val);

const interceptions7bar = new QWidget();
interceptions7bar.setObjectName('interceptions7bar');
const interceptions7barLayout = new FlexLayout();
interceptions7bar.setLayout(interceptions7barLayout);
interceptions7bar.setInlineStyle("flex-direction: 'row';")

interceptions7barLayout.addWidget(interceptions7);
interceptions7barLayout.addWidget(interceptions7val);

const interceptions8bar = new QWidget();
interceptions8bar.setObjectName('interceptions8bar');
const interceptions8barLayout = new FlexLayout();
interceptions8bar.setLayout(interceptions8barLayout);
interceptions8bar.setInlineStyle("flex-direction: 'row';")

interceptions8barLayout.addWidget(interceptions8);
interceptions8barLayout.addWidget(interceptions8val);

const interceptions9bar = new QWidget();
interceptions9bar.setObjectName('interceptions9bar');
const interceptions9barLayout = new FlexLayout();
interceptions9bar.setLayout(interceptions9barLayout);
interceptions9bar.setInlineStyle("flex-direction: 'row';")

interceptions9barLayout.addWidget(interceptions9);
interceptions9barLayout.addWidget(interceptions9val);

const interceptions10bar = new QWidget();
interceptions10bar.setObjectName('interceptions10bar');
const interceptions10barLayout = new FlexLayout();
interceptions10bar.setLayout(interceptions10barLayout);
interceptions10bar.setInlineStyle("flex-direction: 'row';")

interceptions10barLayout.addWidget(interceptions10);
interceptions10barLayout.addWidget(interceptions10val);


const interceptionsBarsArr = [[interceptions1, interceptions1val], [interceptions2, interceptions2val], [interceptions3, interceptions3val], [interceptions4, interceptions4val], [interceptions5, interceptions5val], [interceptions6, interceptions6val], [interceptions7, interceptions7val], [interceptions8, interceptions8val], [interceptions9, interceptions9val], [interceptions10, interceptions10val]]

interceptionsTileLayout.addWidget(interceptionsTitle);
interceptionsTileLayout.addWidget(interceptions1bar);
interceptionsTileLayout.addWidget(interceptions2bar);
interceptionsTileLayout.addWidget(interceptions3bar);
interceptionsTileLayout.addWidget(interceptions4bar);
interceptionsTileLayout.addWidget(interceptions5bar);
interceptionsTileLayout.addWidget(interceptions6bar);
interceptionsTileLayout.addWidget(interceptions7bar);
interceptionsTileLayout.addWidget(interceptions8bar);
interceptionsTileLayout.addWidget(interceptions9bar);
interceptionsTileLayout.addWidget(interceptions10bar);


const ballsfieldeddefTile = new QWidget();
ballsfieldeddefTile.setObjectName('ballsfieldeddefTile');
const ballsfieldeddefTileLayout = new FlexLayout();
ballsfieldeddefTile.setLayout(ballsfieldeddefTileLayout);
ballsfieldeddefTile.setInlineStyle("flex-direction: 'column';");

let ballsfieldeddefTitle = new QLabel();
ballsfieldeddefTitle.setText("BALLS FIELDED (DEF)");
ballsfieldeddefTitle.setInlineStyle("height: 50px;");
let ballsfieldeddef1 = new QLabel();
ballsfieldeddef1.setInlineStyle("width: '150px';");
ballsfieldeddef1.setObjectName("recordLabel");
let ballsfieldeddef1val = new QLabel();
ballsfieldeddef1val.setInlineStyle("width: '50px';");
ballsfieldeddef1val.setObjectName("recordLabel");
let ballsfieldeddef2 = new QLabel();
ballsfieldeddef2.setInlineStyle("width: '150px';");
ballsfieldeddef2.setObjectName("recordLabel");
let ballsfieldeddef2val = new QLabel();
ballsfieldeddef2val.setInlineStyle("width: '50px';");
ballsfieldeddef2val.setObjectName("recordLabel");
let ballsfieldeddef3 = new QLabel();
ballsfieldeddef3.setInlineStyle("width: '150px';");
ballsfieldeddef3.setObjectName("recordLabel");
let ballsfieldeddef3val = new QLabel();
ballsfieldeddef3val.setInlineStyle("width: '50px';");
ballsfieldeddef3val.setObjectName("recordLabel");
let ballsfieldeddef4 = new QLabel();
ballsfieldeddef4.setInlineStyle("width: '150px';");
ballsfieldeddef4.setObjectName("recordLabel");
let ballsfieldeddef4val = new QLabel();
ballsfieldeddef4val.setInlineStyle("width: '50px';");
ballsfieldeddef4val.setObjectName("recordLabel");
let ballsfieldeddef5 = new QLabel();
ballsfieldeddef5.setInlineStyle("width: '150px';");
ballsfieldeddef5.setObjectName("recordLabel");
let ballsfieldeddef5val = new QLabel();
ballsfieldeddef5val.setInlineStyle("width: '50px';");
ballsfieldeddef5val.setObjectName("recordLabel");
let ballsfieldeddef6 = new QLabel();
ballsfieldeddef6.setInlineStyle("width: '150px';");
ballsfieldeddef6.setObjectName("recordLabel");
let ballsfieldeddef6val = new QLabel();
ballsfieldeddef6val.setInlineStyle("width: '50px';");
ballsfieldeddef6val.setObjectName("recordLabel");
let ballsfieldeddef7 = new QLabel();
ballsfieldeddef7.setInlineStyle("width: '150px';");
ballsfieldeddef7.setObjectName("recordLabel");
let ballsfieldeddef7val = new QLabel();
ballsfieldeddef7val.setInlineStyle("width: '50px';");
ballsfieldeddef7val.setObjectName("recordLabel");
let ballsfieldeddef8 = new QLabel();
ballsfieldeddef8.setInlineStyle("width: '150px';");
ballsfieldeddef8.setObjectName("recordLabel");
let ballsfieldeddef8val = new QLabel();
ballsfieldeddef8val.setInlineStyle("width: '50px';");
ballsfieldeddef8val.setObjectName("recordLabel");
let ballsfieldeddef9 = new QLabel();
ballsfieldeddef9.setInlineStyle("width: '150px';");
ballsfieldeddef9.setObjectName("recordLabel");
let ballsfieldeddef9val = new QLabel();
ballsfieldeddef9val.setInlineStyle("width: '50px';");
ballsfieldeddef9val.setObjectName("recordLabel");
let ballsfieldeddef10 = new QLabel();
ballsfieldeddef10.setInlineStyle("width: '150px';");
ballsfieldeddef10.setObjectName("recordLabel");
let ballsfieldeddef10val = new QLabel();
ballsfieldeddef10val.setInlineStyle("width: '50px';");
ballsfieldeddef10val.setObjectName("recordLabel");

const ballsfieldeddef1bar = new QWidget();
ballsfieldeddef1bar.setObjectName('ballsfieldeddef1bar');
const ballsfieldeddef1barLayout = new FlexLayout();
ballsfieldeddef1bar.setLayout(ballsfieldeddef1barLayout);
ballsfieldeddef1bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef1barLayout.addWidget(ballsfieldeddef1);
ballsfieldeddef1barLayout.addWidget(ballsfieldeddef1val);

const ballsfieldeddef2bar = new QWidget();
ballsfieldeddef2bar.setObjectName('ballsfieldeddef2bar');
const ballsfieldeddef2barLayout = new FlexLayout();
ballsfieldeddef2bar.setLayout(ballsfieldeddef2barLayout);
ballsfieldeddef2bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef2barLayout.addWidget(ballsfieldeddef2);
ballsfieldeddef2barLayout.addWidget(ballsfieldeddef2val);

const ballsfieldeddef3bar = new QWidget();
ballsfieldeddef3bar.setObjectName('ballsfieldeddef3bar');
const ballsfieldeddef3barLayout = new FlexLayout();
ballsfieldeddef3bar.setLayout(ballsfieldeddef3barLayout);
ballsfieldeddef3bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef3barLayout.addWidget(ballsfieldeddef3);
ballsfieldeddef3barLayout.addWidget(ballsfieldeddef3val);

const ballsfieldeddef4bar = new QWidget();
ballsfieldeddef4bar.setObjectName('ballsfieldeddef4bar');
const ballsfieldeddef4barLayout = new FlexLayout();
ballsfieldeddef4bar.setLayout(ballsfieldeddef4barLayout);
ballsfieldeddef4bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef4barLayout.addWidget(ballsfieldeddef4);
ballsfieldeddef4barLayout.addWidget(ballsfieldeddef4val);

const ballsfieldeddef5bar = new QWidget();
ballsfieldeddef5bar.setObjectName('ballsfieldeddef5bar');
const ballsfieldeddef5barLayout = new FlexLayout();
ballsfieldeddef5bar.setLayout(ballsfieldeddef5barLayout);
ballsfieldeddef5bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef5barLayout.addWidget(ballsfieldeddef5);
ballsfieldeddef5barLayout.addWidget(ballsfieldeddef5val);

const ballsfieldeddef6bar = new QWidget();
ballsfieldeddef6bar.setObjectName('ballsfieldeddef6bar');
const ballsfieldeddef6barLayout = new FlexLayout();
ballsfieldeddef6bar.setLayout(ballsfieldeddef6barLayout);
ballsfieldeddef6bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef6barLayout.addWidget(ballsfieldeddef6);
ballsfieldeddef6barLayout.addWidget(ballsfieldeddef6val);

const ballsfieldeddef7bar = new QWidget();
ballsfieldeddef7bar.setObjectName('ballsfieldeddef7bar');
const ballsfieldeddef7barLayout = new FlexLayout();
ballsfieldeddef7bar.setLayout(ballsfieldeddef7barLayout);
ballsfieldeddef7bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef7barLayout.addWidget(ballsfieldeddef7);
ballsfieldeddef7barLayout.addWidget(ballsfieldeddef7val);

const ballsfieldeddef8bar = new QWidget();
ballsfieldeddef8bar.setObjectName('ballsfieldeddef8bar');
const ballsfieldeddef8barLayout = new FlexLayout();
ballsfieldeddef8bar.setLayout(ballsfieldeddef8barLayout);
ballsfieldeddef8bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef8barLayout.addWidget(ballsfieldeddef8);
ballsfieldeddef8barLayout.addWidget(ballsfieldeddef8val);

const ballsfieldeddef9bar = new QWidget();
ballsfieldeddef9bar.setObjectName('ballsfieldeddef9bar');
const ballsfieldeddef9barLayout = new FlexLayout();
ballsfieldeddef9bar.setLayout(ballsfieldeddef9barLayout);
ballsfieldeddef9bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef9barLayout.addWidget(ballsfieldeddef9);
ballsfieldeddef9barLayout.addWidget(ballsfieldeddef9val);

const ballsfieldeddef10bar = new QWidget();
ballsfieldeddef10bar.setObjectName('ballsfieldeddef10bar');
const ballsfieldeddef10barLayout = new FlexLayout();
ballsfieldeddef10bar.setLayout(ballsfieldeddef10barLayout);
ballsfieldeddef10bar.setInlineStyle("flex-direction: 'row';")

ballsfieldeddef10barLayout.addWidget(ballsfieldeddef10);
ballsfieldeddef10barLayout.addWidget(ballsfieldeddef10val);


const ballsfieldeddefBarsArr = [[ballsfieldeddef1, ballsfieldeddef1val], [ballsfieldeddef2, ballsfieldeddef2val], [ballsfieldeddef3, ballsfieldeddef3val], [ballsfieldeddef4, ballsfieldeddef4val], [ballsfieldeddef5, ballsfieldeddef5val], [ballsfieldeddef6, ballsfieldeddef6val], [ballsfieldeddef7, ballsfieldeddef7val], [ballsfieldeddef8, ballsfieldeddef8val], [ballsfieldeddef9, ballsfieldeddef9val], [ballsfieldeddef10, ballsfieldeddef10val]]

ballsfieldeddefTileLayout.addWidget(ballsfieldeddefTitle);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef1bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef2bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef3bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef4bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef5bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef6bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef7bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef8bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef9bar);
ballsfieldeddefTileLayout.addWidget(ballsfieldeddef10bar);


const totaloutsrecordedTile = new QWidget();
totaloutsrecordedTile.setObjectName('totaloutsrecordedTile');
const totaloutsrecordedTileLayout = new FlexLayout();
totaloutsrecordedTile.setLayout(totaloutsrecordedTileLayout);
totaloutsrecordedTile.setInlineStyle("flex-direction: 'column';");

let totaloutsrecordedTitle = new QLabel();
totaloutsrecordedTitle.setText("TOTAL OUTS RECORDED");
totaloutsrecordedTitle.setInlineStyle("height: 50px;");
let totaloutsrecorded1 = new QLabel();
totaloutsrecorded1.setInlineStyle("width: '150px';");
totaloutsrecorded1.setObjectName("recordLabel");
let totaloutsrecorded1val = new QLabel();
totaloutsrecorded1val.setInlineStyle("width: '50px';");
totaloutsrecorded1val.setObjectName("recordLabel");
let totaloutsrecorded2 = new QLabel();
totaloutsrecorded2.setInlineStyle("width: '150px';");
totaloutsrecorded2.setObjectName("recordLabel");
let totaloutsrecorded2val = new QLabel();
totaloutsrecorded2val.setInlineStyle("width: '50px';");
totaloutsrecorded2val.setObjectName("recordLabel");
let totaloutsrecorded3 = new QLabel();
totaloutsrecorded3.setInlineStyle("width: '150px';");
totaloutsrecorded3.setObjectName("recordLabel");
let totaloutsrecorded3val = new QLabel();
totaloutsrecorded3val.setInlineStyle("width: '50px';");
totaloutsrecorded3val.setObjectName("recordLabel");
let totaloutsrecorded4 = new QLabel();
totaloutsrecorded4.setInlineStyle("width: '150px';");
totaloutsrecorded4.setObjectName("recordLabel");
let totaloutsrecorded4val = new QLabel();
totaloutsrecorded4val.setInlineStyle("width: '50px';");
totaloutsrecorded4val.setObjectName("recordLabel");
let totaloutsrecorded5 = new QLabel();
totaloutsrecorded5.setInlineStyle("width: '150px';");
totaloutsrecorded5.setObjectName("recordLabel");
let totaloutsrecorded5val = new QLabel();
totaloutsrecorded5val.setInlineStyle("width: '50px';");
totaloutsrecorded5val.setObjectName("recordLabel");
let totaloutsrecorded6 = new QLabel();
totaloutsrecorded6.setInlineStyle("width: '150px';");
totaloutsrecorded6.setObjectName("recordLabel");
let totaloutsrecorded6val = new QLabel();
totaloutsrecorded6val.setInlineStyle("width: '50px';");
totaloutsrecorded6val.setObjectName("recordLabel");
let totaloutsrecorded7 = new QLabel();
totaloutsrecorded7.setInlineStyle("width: '150px';");
totaloutsrecorded7.setObjectName("recordLabel");
let totaloutsrecorded7val = new QLabel();
totaloutsrecorded7val.setInlineStyle("width: '50px';");
totaloutsrecorded7val.setObjectName("recordLabel");
let totaloutsrecorded8 = new QLabel();
totaloutsrecorded8.setInlineStyle("width: '150px';");
totaloutsrecorded8.setObjectName("recordLabel");
let totaloutsrecorded8val = new QLabel();
totaloutsrecorded8val.setInlineStyle("width: '50px';");
totaloutsrecorded8val.setObjectName("recordLabel");
let totaloutsrecorded9 = new QLabel();
totaloutsrecorded9.setInlineStyle("width: '150px';");
totaloutsrecorded9.setObjectName("recordLabel");
let totaloutsrecorded9val = new QLabel();
totaloutsrecorded9val.setInlineStyle("width: '50px';");
totaloutsrecorded9val.setObjectName("recordLabel");
let totaloutsrecorded10 = new QLabel();
totaloutsrecorded10.setInlineStyle("width: '150px';");
totaloutsrecorded10.setObjectName("recordLabel");
let totaloutsrecorded10val = new QLabel();
totaloutsrecorded10val.setInlineStyle("width: '50px';");
totaloutsrecorded10val.setObjectName("recordLabel");

const totaloutsrecorded1bar = new QWidget();
totaloutsrecorded1bar.setObjectName('totaloutsrecorded1bar');
const totaloutsrecorded1barLayout = new FlexLayout();
totaloutsrecorded1bar.setLayout(totaloutsrecorded1barLayout);
totaloutsrecorded1bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded1barLayout.addWidget(totaloutsrecorded1);
totaloutsrecorded1barLayout.addWidget(totaloutsrecorded1val);

const totaloutsrecorded2bar = new QWidget();
totaloutsrecorded2bar.setObjectName('totaloutsrecorded2bar');
const totaloutsrecorded2barLayout = new FlexLayout();
totaloutsrecorded2bar.setLayout(totaloutsrecorded2barLayout);
totaloutsrecorded2bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded2barLayout.addWidget(totaloutsrecorded2);
totaloutsrecorded2barLayout.addWidget(totaloutsrecorded2val);

const totaloutsrecorded3bar = new QWidget();
totaloutsrecorded3bar.setObjectName('totaloutsrecorded3bar');
const totaloutsrecorded3barLayout = new FlexLayout();
totaloutsrecorded3bar.setLayout(totaloutsrecorded3barLayout);
totaloutsrecorded3bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded3barLayout.addWidget(totaloutsrecorded3);
totaloutsrecorded3barLayout.addWidget(totaloutsrecorded3val);

const totaloutsrecorded4bar = new QWidget();
totaloutsrecorded4bar.setObjectName('totaloutsrecorded4bar');
const totaloutsrecorded4barLayout = new FlexLayout();
totaloutsrecorded4bar.setLayout(totaloutsrecorded4barLayout);
totaloutsrecorded4bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded4barLayout.addWidget(totaloutsrecorded4);
totaloutsrecorded4barLayout.addWidget(totaloutsrecorded4val);

const totaloutsrecorded5bar = new QWidget();
totaloutsrecorded5bar.setObjectName('totaloutsrecorded5bar');
const totaloutsrecorded5barLayout = new FlexLayout();
totaloutsrecorded5bar.setLayout(totaloutsrecorded5barLayout);
totaloutsrecorded5bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded5barLayout.addWidget(totaloutsrecorded5);
totaloutsrecorded5barLayout.addWidget(totaloutsrecorded5val);

const totaloutsrecorded6bar = new QWidget();
totaloutsrecorded6bar.setObjectName('totaloutsrecorded6bar');
const totaloutsrecorded6barLayout = new FlexLayout();
totaloutsrecorded6bar.setLayout(totaloutsrecorded6barLayout);
totaloutsrecorded6bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded6barLayout.addWidget(totaloutsrecorded6);
totaloutsrecorded6barLayout.addWidget(totaloutsrecorded6val);

const totaloutsrecorded7bar = new QWidget();
totaloutsrecorded7bar.setObjectName('totaloutsrecorded7bar');
const totaloutsrecorded7barLayout = new FlexLayout();
totaloutsrecorded7bar.setLayout(totaloutsrecorded7barLayout);
totaloutsrecorded7bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded7barLayout.addWidget(totaloutsrecorded7);
totaloutsrecorded7barLayout.addWidget(totaloutsrecorded7val);

const totaloutsrecorded8bar = new QWidget();
totaloutsrecorded8bar.setObjectName('totaloutsrecorded8bar');
const totaloutsrecorded8barLayout = new FlexLayout();
totaloutsrecorded8bar.setLayout(totaloutsrecorded8barLayout);
totaloutsrecorded8bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded8barLayout.addWidget(totaloutsrecorded8);
totaloutsrecorded8barLayout.addWidget(totaloutsrecorded8val);

const totaloutsrecorded9bar = new QWidget();
totaloutsrecorded9bar.setObjectName('totaloutsrecorded9bar');
const totaloutsrecorded9barLayout = new FlexLayout();
totaloutsrecorded9bar.setLayout(totaloutsrecorded9barLayout);
totaloutsrecorded9bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded9barLayout.addWidget(totaloutsrecorded9);
totaloutsrecorded9barLayout.addWidget(totaloutsrecorded9val);

const totaloutsrecorded10bar = new QWidget();
totaloutsrecorded10bar.setObjectName('totaloutsrecorded10bar');
const totaloutsrecorded10barLayout = new FlexLayout();
totaloutsrecorded10bar.setLayout(totaloutsrecorded10barLayout);
totaloutsrecorded10bar.setInlineStyle("flex-direction: 'row';")

totaloutsrecorded10barLayout.addWidget(totaloutsrecorded10);
totaloutsrecorded10barLayout.addWidget(totaloutsrecorded10val);


const totaloutsrecordedBarsArr = [[totaloutsrecorded1, totaloutsrecorded1val], [totaloutsrecorded2, totaloutsrecorded2val], [totaloutsrecorded3, totaloutsrecorded3val], [totaloutsrecorded4, totaloutsrecorded4val], [totaloutsrecorded5, totaloutsrecorded5val], [totaloutsrecorded6, totaloutsrecorded6val], [totaloutsrecorded7, totaloutsrecorded7val], [totaloutsrecorded8, totaloutsrecorded8val], [totaloutsrecorded9, totaloutsrecorded9val], [totaloutsrecorded10, totaloutsrecorded10val]]

totaloutsrecordedTileLayout.addWidget(totaloutsrecordedTitle);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded1bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded2bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded3bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded4bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded5bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded6bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded7bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded8bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded9bar);
totaloutsrecordedTileLayout.addWidget(totaloutsrecorded10bar);

const recordsScroll = new QScrollArea();
recordsScroll.setObjectName('recordsScroll');
const recordsScrollLayout = new FlexLayout();
recordsScroll.setLayout(recordsScrollLayout);
recordsScroll.setInlineStyle("background-color: 'transparent';");

const recordsView = new QWidget();
recordsView.setObjectName('recordsView');
const recordsViewLayout = new FlexLayout();
recordsView.setLayout(recordsViewLayout);
recordsView.setInlineStyle("width: 1000px; flex-direction: 'row'; align-items: 'flex-start'; flex-wrap: 'wrap'; background-color: 'transparent';")

recordsViewLayout.addWidget(pointsTile);
recordsViewLayout.addWidget(assistsTile);
recordsViewLayout.addWidget(assistpointsTile);
recordsViewLayout.addWidget(brokentacklesTile);
recordsViewLayout.addWidget(ballsfieldedoffTile);
recordsViewLayout.addWidget(blocksTile);
recordsViewLayout.addWidget(turnoversTile);
recordsViewLayout.addWidget(pitchesTile);
recordsViewLayout.addWidget(strikesTile);
recordsViewLayout.addWidget(ballsTile);
recordsViewLayout.addWidget(foulsTile);
recordsViewLayout.addWidget(strikeoutspitchingTile);
recordsViewLayout.addWidget(balloutsTile);
recordsViewLayout.addWidget(slamsgivenTile);
recordsViewLayout.addWidget(atbatsTile);
recordsViewLayout.addWidget(hitsTile);
recordsViewLayout.addWidget(slamsTile);
recordsViewLayout.addWidget(hitstooutTile);
recordsViewLayout.addWidget(hitstooffenseTile);
recordsViewLayout.addWidget(fouloutsTile);
recordsViewLayout.addWidget(strikeoutsbattingTile);
recordsViewLayout.addWidget(tacklesTile);
recordsViewLayout.addWidget(blocksshedTile);
recordsViewLayout.addWidget(interceptionsTile);
recordsViewLayout.addWidget(ballsfieldeddefTile);
recordsViewLayout.addWidget(totaloutsrecordedTile);

recordsScroll.setWidget(recordsView);

let recordTypesSelect: string = "";
const seasonRecords = new QPushButton();

seasonRecords.setText("Season");
seasonRecords.setObjectName('seasonRecords');
seasonRecords.addEventListener("released", () => {
  
  recordTypesSelect = "Season";
  stacked.setCurrentWidget(recordsMenuLeagues);
})

const careerRecords = new QPushButton();

careerRecords.setText("Career");
careerRecords.setObjectName('careerRecords');
careerRecords.addEventListener("released", () => {
  
  let pointsdata = fs.readFileSync(`./dist/src/records/Career/Points Scored.txt`, 'utf8');
    let sentenceEx = new RegExp(/.+.|!/g);
    let pointssplit = pointsdata.match(sentenceEx);
    let dataEx = new RegExp(/(.+) (\d+)/);
    for (let ci=0;ci<pointssplit!.length;ci++) {
      let thisguy = dataEx.exec(pointssplit![ci])
      pointBarsArr[ci][0].setText(thisguy![1]);
      pointBarsArr[ci][1].setText(thisguy![2]);
    }
    let assistsdata = fs.readFileSync(`./dist/src/records/Career/Assists.txt`, 'utf8');
    let assistssplit = assistsdata.match(sentenceEx);
    for (let ci=0;ci<assistssplit!.length;ci++) {
      let thisguy = dataEx.exec(assistssplit![ci])
      assistsBarsArr[ci][0].setText(thisguy![1]);
      assistsBarsArr[ci][1].setText(thisguy![2]);
    }
    let assistpointsdata = fs.readFileSync(`./dist/src/records/Career/Assist Points.txt`, 'utf8');
    let assistpointssplit = assistpointsdata.match(sentenceEx);
    for (let ci=0;ci<assistpointssplit!.length;ci++) {
      let thisguy = dataEx.exec(assistpointssplit![ci])
      assistpointsBarsArr[ci][0].setText(thisguy![1]);
      assistpointsBarsArr[ci][1].setText(thisguy![2]);
    }
    let brokentacklesdata = fs.readFileSync(`./dist/src/records/Career/Broken Tackles.txt`, 'utf8');
    let brokentacklessplit = brokentacklesdata.match(sentenceEx);
    for (let ci=0;ci<brokentacklessplit!.length;ci++) {
      let thisguy = dataEx.exec(brokentacklessplit![ci])
      brokentacklesBarsArr[ci][0].setText(thisguy![1]);
      brokentacklesBarsArr[ci][1].setText(thisguy![2]);
    }
    let ballsfieldedoffdata = fs.readFileSync(`./dist/src/records/Career/Balls Fielded (OFF).txt`, 'utf8');
    let ballsfieldedoffsplit = ballsfieldedoffdata.match(sentenceEx);
    for (let ci=0;ci<ballsfieldedoffsplit!.length;ci++) {
      let thisguy = dataEx.exec(ballsfieldedoffsplit![ci])
      ballsfieldedoffBarsArr[ci][0].setText(thisguy![1]);
      ballsfieldedoffBarsArr[ci][1].setText(thisguy![2]);
    }
    let blocksdata = fs.readFileSync(`./dist/src/records/Career/Blocks.txt`, 'utf8');
    let blockssplit = blocksdata.match(sentenceEx);
    for (let ci=0;ci<blockssplit!.length;ci++) {
      let thisguy = dataEx.exec(blockssplit![ci])
      blocksBarsArr[ci][0].setText(thisguy![1]);
      blocksBarsArr[ci][1].setText(thisguy![2]);
    }
    let turnoversdata = fs.readFileSync(`./dist/src/records/Career/Turnovers.txt`, 'utf8');
    let turnoverssplit = turnoversdata.match(sentenceEx);
    for (let ci=0;ci<turnoverssplit!.length;ci++) {
      let thisguy = dataEx.exec(turnoverssplit![ci])
      turnoversBarsArr[ci][0].setText(thisguy![1]);
      turnoversBarsArr[ci][1].setText(thisguy![2]);
    }
    let pitchesdata = fs.readFileSync(`./dist/src/records/Career/Pitches.txt`, 'utf8');
    let pitchessplit = pitchesdata.match(sentenceEx);
    for (let ci=0;ci<pitchessplit!.length;ci++) {
      let thisguy = dataEx.exec(pitchessplit![ci])
      pitchesBarsArr[ci][0].setText(thisguy![1]);
      pitchesBarsArr[ci][1].setText(thisguy![2]);
    }
    let strikesdata = fs.readFileSync(`./dist/src/records/Career/Strikes.txt`, 'utf8');
    let strikessplit = strikesdata.match(sentenceEx);
    for (let ci=0;ci<strikessplit!.length;ci++) {
      let thisguy = dataEx.exec(strikessplit![ci])
      strikesBarsArr[ci][0].setText(thisguy![1]);
      strikesBarsArr[ci][1].setText(thisguy![2]);
    }
    let ballsdata = fs.readFileSync(`./dist/src/records/Career/Balls.txt`, 'utf8');
    let ballssplit = ballsdata.match(sentenceEx);
    for (let ci=0;ci<ballssplit!.length;ci++) {
      let thisguy = dataEx.exec(ballssplit![ci])
      ballsBarsArr[ci][0].setText(thisguy![1]);
      ballsBarsArr[ci][1].setText(thisguy![2]);
    }
    let foulsdata = fs.readFileSync(`./dist/src/records/Career/Fouls.txt`, 'utf8');
    let foulssplit = foulsdata.match(sentenceEx);
    for (let ci=0;ci<foulssplit!.length;ci++) {
      let thisguy = dataEx.exec(foulssplit![ci])
      foulsBarsArr[ci][0].setText(thisguy![1]);
      foulsBarsArr[ci][1].setText(thisguy![2]);
    }
    let strikeoutspitchingdata = fs.readFileSync(`./dist/src/records/Career/Strikeouts Pitching.txt`, 'utf8');
    let strikeoutspitchingsplit = strikeoutspitchingdata.match(sentenceEx);
    for (let ci=0;ci<strikeoutspitchingsplit!.length;ci++) {
      let thisguy = dataEx.exec(strikeoutspitchingsplit![ci])
      strikeoutspitchingBarsArr[ci][0].setText(thisguy![1]);
      strikeoutspitchingBarsArr[ci][1].setText(thisguy![2]);
    }
    let balloutsdata = fs.readFileSync(`./dist/src/records/Career/Ballouts.txt`, 'utf8');
    let balloutssplit = balloutsdata.match(sentenceEx);
    for (let ci=0;ci<balloutssplit!.length;ci++) {
      let thisguy = dataEx.exec(balloutssplit![ci])
      balloutsBarsArr[ci][0].setText(thisguy![1]);
      balloutsBarsArr[ci][1].setText(thisguy![2]);
    }
    let slamsgivendata = fs.readFileSync(`./dist/src/records/Career/Slams Given.txt`, 'utf8');
    let slamsgivensplit = slamsgivendata.match(sentenceEx);
    for (let ci=0;ci<slamsgivensplit!.length;ci++) {
      let thisguy = dataEx.exec(slamsgivensplit![ci])
      slamsgivenBarsArr[ci][0].setText(thisguy![1]);
      slamsgivenBarsArr[ci][1].setText(thisguy![2]);
    }
    let atbatsdata = fs.readFileSync(`./dist/src/records/Career/At-Bats.txt`, 'utf8');
    let atbatssplit = atbatsdata.match(sentenceEx);
    for (let ci=0;ci<atbatssplit!.length;ci++) {
      let thisguy = dataEx.exec(atbatssplit![ci])
      atbatsBarsArr[ci][0].setText(thisguy![1]);
      atbatsBarsArr[ci][1].setText(thisguy![2]);
    }
    let hitsdata = fs.readFileSync(`./dist/src/records/Career/Hits.txt`, 'utf8');
    let hitssplit = hitsdata.match(sentenceEx);
    for (let ci=0;ci<hitssplit!.length;ci++) {
      let thisguy = dataEx.exec(hitssplit![ci])
      hitsBarsArr[ci][0].setText(thisguy![1]);
      hitsBarsArr[ci][1].setText(thisguy![2]);
    }
    let slamsdata = fs.readFileSync(`./dist/src/records/Career/Slams.txt`, 'utf8');
    let slamssplit = slamsdata.match(sentenceEx);
    for (let ci=0;ci<slamssplit!.length;ci++) {
      let thisguy = dataEx.exec(slamssplit![ci])
      slamsBarsArr[ci][0].setText(thisguy![1]);
      slamsBarsArr[ci][1].setText(thisguy![2]);
    }
    let hitstooutdata = fs.readFileSync(`./dist/src/records/Career/Hits to Out.txt`, 'utf8');
    let hitstooutsplit = hitstooutdata.match(sentenceEx);
    for (let ci=0;ci<hitstooutsplit!.length;ci++) {
      let thisguy = dataEx.exec(hitstooutsplit![ci])
      hitstooutBarsArr[ci][0].setText(thisguy![1]);
      hitstooutBarsArr[ci][1].setText(thisguy![2]);
    }
    let hitstooffensedata = fs.readFileSync(`./dist/src/records/Career/Hits to Offense.txt`, 'utf8');
    let hitstooffensesplit = hitstooffensedata.match(sentenceEx);
    for (let ci=0;ci<hitstooffensesplit!.length;ci++) {
      let thisguy = dataEx.exec(hitstooffensesplit![ci])
      hitstooffenseBarsArr[ci][0].setText(thisguy![1]);
      hitstooffenseBarsArr[ci][1].setText(thisguy![2]);
    }
    let fouloutsdata = fs.readFileSync(`./dist/src/records/Career/Foulouts.txt`, 'utf8');
    let fouloutssplit = fouloutsdata.match(sentenceEx);
    for (let ci=0;ci<fouloutssplit!.length;ci++) {
      let thisguy = dataEx.exec(fouloutssplit![ci])
      fouloutsBarsArr[ci][0].setText(thisguy![1]);
      fouloutsBarsArr[ci][1].setText(thisguy![2]);
    }
    let strikeoutsbattingdata = fs.readFileSync(`./dist/src/records/Career/Strikeouts Batting.txt`, 'utf8');
    let strikeoutsbattingsplit = strikeoutsbattingdata.match(sentenceEx);
    for (let ci=0;ci<strikeoutsbattingsplit!.length;ci++) {
      let thisguy = dataEx.exec(strikeoutsbattingsplit![ci])
      strikeoutsbattingBarsArr[ci][0].setText(thisguy![1]);
      strikeoutsbattingBarsArr[ci][1].setText(thisguy![2]);
    }
    let tacklesdata = fs.readFileSync(`./dist/src/records/Career/Tackles.txt`, 'utf8');
    let tacklessplit = tacklesdata.match(sentenceEx);
    for (let ci=0;ci<tacklessplit!.length;ci++) {
      let thisguy = dataEx.exec(tacklessplit![ci])
      tacklesBarsArr[ci][0].setText(thisguy![1]);
      tacklesBarsArr[ci][1].setText(thisguy![2]);
    }
    let blockssheddata = fs.readFileSync(`./dist/src/records/Career/Blocks Shed.txt`, 'utf8');
    let blocksshedsplit = blockssheddata.match(sentenceEx);
    for (let ci=0;ci<blocksshedsplit!.length;ci++) {
      let thisguy = dataEx.exec(blocksshedsplit![ci])
      blocksshedBarsArr[ci][0].setText(thisguy![1]);
      blocksshedBarsArr[ci][1].setText(thisguy![2]);
    }
    let interceptionsdata = fs.readFileSync(`./dist/src/records/Career/Interceptions.txt`, 'utf8');
    let interceptionssplit = interceptionsdata.match(sentenceEx);
    for (let ci=0;ci<interceptionssplit!.length;ci++) {
      let thisguy = dataEx.exec(interceptionssplit![ci])
      interceptionsBarsArr[ci][0].setText(thisguy![1]);
      interceptionsBarsArr[ci][1].setText(thisguy![2]);
    }
    let ballsfieldeddefdata = fs.readFileSync(`./dist/src/records/Career/Balls Fielded (DEF).txt`, 'utf8');
    let ballsfieldeddefsplit = ballsfieldeddefdata.match(sentenceEx);
    for (let ci=0;ci<ballsfieldeddefsplit!.length;ci++) {
      let thisguy = dataEx.exec(ballsfieldeddefsplit![ci])
      ballsfieldeddefBarsArr[ci][0].setText(thisguy![1]);
      ballsfieldeddefBarsArr[ci][1].setText(thisguy![2]);
    }
    let totaloutsrecordeddata = fs.readFileSync(`./dist/src/records/Career/Total Outs Recorded.txt`, 'utf8');
    let totaloutsrecordedsplit = totaloutsrecordeddata.match(sentenceEx);
    for (let ci=0;ci<totaloutsrecordedsplit!.length;ci++) {
      let thisguy = dataEx.exec(totaloutsrecordedsplit![ci])
      totaloutsrecordedBarsArr[ci][0].setText(thisguy![1]);
      totaloutsrecordedBarsArr[ci][1].setText(thisguy![2]);
    } stacked.setCurrentWidget(recordsScroll);
 
})

const gameRecords = new QPushButton();

gameRecords.setText("Game");
gameRecords.setObjectName('gameRecords');
gameRecords.addEventListener("released", () => {
  
  recordTypesSelect = "Game";
  stacked.setCurrentWidget(recordsMenuLeagues);
})


let recordsLeagueSelect = 0;
const premierRecords = new QPushButton();

premierRecords.setObjectName('premierRecords');
premierRecords.setText("Premier Leagues");
premierRecords.addEventListener("released", () => {
  
    let pointsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Points Scored.txt`, 'utf8');
    let sentenceEx = new RegExp(/.+.|!/g);
    let pointssplit = pointsdata.match(sentenceEx);
    let dataEx = new RegExp(/(.+) (\d+)/);
    for (let ci=0;ci<pointssplit!.length;ci++) {
      let thisguy = dataEx.exec(pointssplit![ci])
      pointBarsArr[ci][0].setText(thisguy![1]);
      pointBarsArr[ci][1].setText(thisguy![2]);
    }
    let assistsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Assists.txt`, 'utf8');
    let assistssplit = assistsdata.match(sentenceEx);
    for (let ci=0;ci<assistssplit!.length;ci++) {
      let thisguy = dataEx.exec(assistssplit![ci])
      assistsBarsArr[ci][0].setText(thisguy![1]);
      assistsBarsArr[ci][1].setText(thisguy![2]);
    }
    let assistpointsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Assist Points.txt`, 'utf8');
    let assistpointssplit = assistpointsdata.match(sentenceEx);
    for (let ci=0;ci<assistpointssplit!.length;ci++) {
      let thisguy = dataEx.exec(assistpointssplit![ci])
      assistpointsBarsArr[ci][0].setText(thisguy![1]);
      assistpointsBarsArr[ci][1].setText(thisguy![2]);
    }
    let brokentacklesdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Broken Tackles.txt`, 'utf8');
    let brokentacklessplit = brokentacklesdata.match(sentenceEx);
    for (let ci=0;ci<brokentacklessplit!.length;ci++) {
      let thisguy = dataEx.exec(brokentacklessplit![ci])
      brokentacklesBarsArr[ci][0].setText(thisguy![1]);
      brokentacklesBarsArr[ci][1].setText(thisguy![2]);
    }
    let ballsfieldedoffdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Balls Fielded (OFF).txt`, 'utf8');
    let ballsfieldedoffsplit = ballsfieldedoffdata.match(sentenceEx);
    for (let ci=0;ci<ballsfieldedoffsplit!.length;ci++) {
      let thisguy = dataEx.exec(ballsfieldedoffsplit![ci])
      ballsfieldedoffBarsArr[ci][0].setText(thisguy![1]);
      ballsfieldedoffBarsArr[ci][1].setText(thisguy![2]);
    }
    let blocksdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Blocks.txt`, 'utf8');
    let blockssplit = blocksdata.match(sentenceEx);
    for (let ci=0;ci<blockssplit!.length;ci++) {
      let thisguy = dataEx.exec(blockssplit![ci])
      blocksBarsArr[ci][0].setText(thisguy![1]);
      blocksBarsArr[ci][1].setText(thisguy![2]);
    }
    let turnoversdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Turnovers.txt`, 'utf8');
    let turnoverssplit = turnoversdata.match(sentenceEx);
    for (let ci=0;ci<turnoverssplit!.length;ci++) {
      let thisguy = dataEx.exec(turnoverssplit![ci])
      turnoversBarsArr[ci][0].setText(thisguy![1]);
      turnoversBarsArr[ci][1].setText(thisguy![2]);
    }
    let pitchesdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Pitches.txt`, 'utf8');
    let pitchessplit = pitchesdata.match(sentenceEx);
    for (let ci=0;ci<pitchessplit!.length;ci++) {
      let thisguy = dataEx.exec(pitchessplit![ci])
      pitchesBarsArr[ci][0].setText(thisguy![1]);
      pitchesBarsArr[ci][1].setText(thisguy![2]);
    }
    let strikesdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Strikes.txt`, 'utf8');
    let strikessplit = strikesdata.match(sentenceEx);
    for (let ci=0;ci<strikessplit!.length;ci++) {
      let thisguy = dataEx.exec(strikessplit![ci])
      strikesBarsArr[ci][0].setText(thisguy![1]);
      strikesBarsArr[ci][1].setText(thisguy![2]);
    }
    let ballsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Balls.txt`, 'utf8');
    let ballssplit = ballsdata.match(sentenceEx);
    for (let ci=0;ci<ballssplit!.length;ci++) {
      let thisguy = dataEx.exec(ballssplit![ci])
      ballsBarsArr[ci][0].setText(thisguy![1]);
      ballsBarsArr[ci][1].setText(thisguy![2]);
    }
    let foulsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Fouls.txt`, 'utf8');
    let foulssplit = foulsdata.match(sentenceEx);
    for (let ci=0;ci<foulssplit!.length;ci++) {
      let thisguy = dataEx.exec(foulssplit![ci])
      foulsBarsArr[ci][0].setText(thisguy![1]);
      foulsBarsArr[ci][1].setText(thisguy![2]);
    }
    let strikeoutspitchingdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Strikeouts Pitching.txt`, 'utf8');
    let strikeoutspitchingsplit = strikeoutspitchingdata.match(sentenceEx);
    for (let ci=0;ci<strikeoutspitchingsplit!.length;ci++) {
      let thisguy = dataEx.exec(strikeoutspitchingsplit![ci])
      strikeoutspitchingBarsArr[ci][0].setText(thisguy![1]);
      strikeoutspitchingBarsArr[ci][1].setText(thisguy![2]);
    }
    let balloutsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Ballouts.txt`, 'utf8');
    let balloutssplit = balloutsdata.match(sentenceEx);
    for (let ci=0;ci<balloutssplit!.length;ci++) {
      let thisguy = dataEx.exec(balloutssplit![ci])
      balloutsBarsArr[ci][0].setText(thisguy![1]);
      balloutsBarsArr[ci][1].setText(thisguy![2]);
    }
    let slamsgivendata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Slams Given.txt`, 'utf8');
    let slamsgivensplit = slamsgivendata.match(sentenceEx);
    for (let ci=0;ci<slamsgivensplit!.length;ci++) {
      let thisguy = dataEx.exec(slamsgivensplit![ci])
      slamsgivenBarsArr[ci][0].setText(thisguy![1]);
      slamsgivenBarsArr[ci][1].setText(thisguy![2]);
    }
    let atbatsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/At-Bats.txt`, 'utf8');
    let atbatssplit = atbatsdata.match(sentenceEx);
    for (let ci=0;ci<atbatssplit!.length;ci++) {
      let thisguy = dataEx.exec(atbatssplit![ci])
      atbatsBarsArr[ci][0].setText(thisguy![1]);
      atbatsBarsArr[ci][1].setText(thisguy![2]);
    }
    let hitsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Hits.txt`, 'utf8');
    let hitssplit = hitsdata.match(sentenceEx);
    for (let ci=0;ci<hitssplit!.length;ci++) {
      let thisguy = dataEx.exec(hitssplit![ci])
      hitsBarsArr[ci][0].setText(thisguy![1]);
      hitsBarsArr[ci][1].setText(thisguy![2]);
    }
    let slamsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Slams.txt`, 'utf8');
    let slamssplit = slamsdata.match(sentenceEx);
    for (let ci=0;ci<slamssplit!.length;ci++) {
      let thisguy = dataEx.exec(slamssplit![ci])
      slamsBarsArr[ci][0].setText(thisguy![1]);
      slamsBarsArr[ci][1].setText(thisguy![2]);
    }
    let hitstooutdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Hits to Out.txt`, 'utf8');
    let hitstooutsplit = hitstooutdata.match(sentenceEx);
    for (let ci=0;ci<hitstooutsplit!.length;ci++) {
      let thisguy = dataEx.exec(hitstooutsplit![ci])
      hitstooutBarsArr[ci][0].setText(thisguy![1]);
      hitstooutBarsArr[ci][1].setText(thisguy![2]);
    }
    let hitstooffensedata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Hits to Offense.txt`, 'utf8');
    let hitstooffensesplit = hitstooffensedata.match(sentenceEx);
    for (let ci=0;ci<hitstooffensesplit!.length;ci++) {
      let thisguy = dataEx.exec(hitstooffensesplit![ci])
      hitstooffenseBarsArr[ci][0].setText(thisguy![1]);
      hitstooffenseBarsArr[ci][1].setText(thisguy![2]);
    }
    let fouloutsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Foulouts.txt`, 'utf8');
    let fouloutssplit = fouloutsdata.match(sentenceEx);
    for (let ci=0;ci<fouloutssplit!.length;ci++) {
      let thisguy = dataEx.exec(fouloutssplit![ci])
      fouloutsBarsArr[ci][0].setText(thisguy![1]);
      fouloutsBarsArr[ci][1].setText(thisguy![2]);
    }
    let strikeoutsbattingdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Strikeouts Batting.txt`, 'utf8');
    let strikeoutsbattingsplit = strikeoutsbattingdata.match(sentenceEx);
    for (let ci=0;ci<strikeoutsbattingsplit!.length;ci++) {
      let thisguy = dataEx.exec(strikeoutsbattingsplit![ci])
      strikeoutsbattingBarsArr[ci][0].setText(thisguy![1]);
      strikeoutsbattingBarsArr[ci][1].setText(thisguy![2]);
    }
    let tacklesdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Tackles.txt`, 'utf8');
    let tacklessplit = tacklesdata.match(sentenceEx);
    for (let ci=0;ci<tacklessplit!.length;ci++) {
      let thisguy = dataEx.exec(tacklessplit![ci])
      tacklesBarsArr[ci][0].setText(thisguy![1]);
      tacklesBarsArr[ci][1].setText(thisguy![2]);
    }
    let blockssheddata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Blocks Shed.txt`, 'utf8');
    let blocksshedsplit = blockssheddata.match(sentenceEx);
    for (let ci=0;ci<blocksshedsplit!.length;ci++) {
      let thisguy = dataEx.exec(blocksshedsplit![ci])
      blocksshedBarsArr[ci][0].setText(thisguy![1]);
      blocksshedBarsArr[ci][1].setText(thisguy![2]);
    }
    let interceptionsdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Interceptions.txt`, 'utf8');
    let interceptionssplit = interceptionsdata.match(sentenceEx);
    for (let ci=0;ci<interceptionssplit!.length;ci++) {
      let thisguy = dataEx.exec(interceptionssplit![ci])
      interceptionsBarsArr[ci][0].setText(thisguy![1]);
      interceptionsBarsArr[ci][1].setText(thisguy![2]);
    }
    let ballsfieldeddefdata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Balls Fielded (DEF).txt`, 'utf8');
    let ballsfieldeddefsplit = ballsfieldeddefdata.match(sentenceEx);
    for (let ci=0;ci<ballsfieldeddefsplit!.length;ci++) {
      let thisguy = dataEx.exec(ballsfieldeddefsplit![ci])
      ballsfieldeddefBarsArr[ci][0].setText(thisguy![1]);
      ballsfieldeddefBarsArr[ci][1].setText(thisguy![2]);
    }
    let totaloutsrecordeddata = fs.readFileSync(`./dist/src/records/Premier/${recordTypesSelect}/Total Outs Recorded.txt`, 'utf8');
    let totaloutsrecordedsplit = totaloutsrecordeddata.match(sentenceEx);
    for (let ci=0;ci<totaloutsrecordedsplit!.length;ci++) {
      let thisguy = dataEx.exec(totaloutsrecordedsplit![ci])
      totaloutsrecordedBarsArr[ci][0].setText(thisguy![1]);
      totaloutsrecordedBarsArr[ci][1].setText(thisguy![2]);
    } stacked.setCurrentWidget(recordsScroll);
});

const transitionalRecords = new QPushButton();

transitionalRecords.setText("Transitional Leagues");
transitionalRecords.setObjectName('transitionalRecords');
transitionalRecords.addEventListener("released", () => {
  
  let pointsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Points Scored.txt`, 'utf8');
  let sentenceEx = new RegExp(/.+.|!/g);
  let pointssplit = pointsdata.match(sentenceEx);
  let dataEx = new RegExp(/(.+) (\d+)/);
  for (let ci=0;ci<pointssplit!.length;ci++) {
    let thisguy = dataEx.exec(pointssplit![ci])
    pointBarsArr[ci][0].setText(thisguy![1]);
    pointBarsArr[ci][1].setText(thisguy![2]);
  }
  let assistsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Assists.txt`, 'utf8');
  let assistssplit = assistsdata.match(sentenceEx);
  for (let ci=0;ci<assistssplit!.length;ci++) {
    let thisguy = dataEx.exec(assistssplit![ci])
    assistsBarsArr[ci][0].setText(thisguy![1]);
    assistsBarsArr[ci][1].setText(thisguy![2]);
  }
  let assistpointsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Assist Points.txt`, 'utf8');
  let assistpointssplit = assistpointsdata.match(sentenceEx);
  for (let ci=0;ci<assistpointssplit!.length;ci++) {
    let thisguy = dataEx.exec(assistpointssplit![ci])
    assistpointsBarsArr[ci][0].setText(thisguy![1]);
    assistpointsBarsArr[ci][1].setText(thisguy![2]);
  }
  let brokentacklesdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Broken Tackles.txt`, 'utf8');
  let brokentacklessplit = brokentacklesdata.match(sentenceEx);
  for (let ci=0;ci<brokentacklessplit!.length;ci++) {
    let thisguy = dataEx.exec(brokentacklessplit![ci])
    brokentacklesBarsArr[ci][0].setText(thisguy![1]);
    brokentacklesBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsfieldedoffdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Balls Fielded (OFF).txt`, 'utf8');
  let ballsfieldedoffsplit = ballsfieldedoffdata.match(sentenceEx);
  for (let ci=0;ci<ballsfieldedoffsplit!.length;ci++) {
    let thisguy = dataEx.exec(ballsfieldedoffsplit![ci])
    ballsfieldedoffBarsArr[ci][0].setText(thisguy![1]);
    ballsfieldedoffBarsArr[ci][1].setText(thisguy![2]);
  }
  let blocksdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Blocks.txt`, 'utf8');
  let blockssplit = blocksdata.match(sentenceEx);
  for (let ci=0;ci<blockssplit!.length;ci++) {
    let thisguy = dataEx.exec(blockssplit![ci])
    blocksBarsArr[ci][0].setText(thisguy![1]);
    blocksBarsArr[ci][1].setText(thisguy![2]);
  }
  let turnoversdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Turnovers.txt`, 'utf8');
  let turnoverssplit = turnoversdata.match(sentenceEx);
  for (let ci=0;ci<turnoverssplit!.length;ci++) {
    let thisguy = dataEx.exec(turnoverssplit![ci])
    turnoversBarsArr[ci][0].setText(thisguy![1]);
    turnoversBarsArr[ci][1].setText(thisguy![2]);
  }
  let pitchesdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Pitches.txt`, 'utf8');
  let pitchessplit = pitchesdata.match(sentenceEx);
  for (let ci=0;ci<pitchessplit!.length;ci++) {
    let thisguy = dataEx.exec(pitchessplit![ci])
    pitchesBarsArr[ci][0].setText(thisguy![1]);
    pitchesBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikesdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Strikes.txt`, 'utf8');
  let strikessplit = strikesdata.match(sentenceEx);
  for (let ci=0;ci<strikessplit!.length;ci++) {
    let thisguy = dataEx.exec(strikessplit![ci])
    strikesBarsArr[ci][0].setText(thisguy![1]);
    strikesBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Balls.txt`, 'utf8');
  let ballssplit = ballsdata.match(sentenceEx);
  for (let ci=0;ci<ballssplit!.length;ci++) {
    let thisguy = dataEx.exec(ballssplit![ci])
    ballsBarsArr[ci][0].setText(thisguy![1]);
    ballsBarsArr[ci][1].setText(thisguy![2]);
  }
  let foulsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Fouls.txt`, 'utf8');
  let foulssplit = foulsdata.match(sentenceEx);
  for (let ci=0;ci<foulssplit!.length;ci++) {
    let thisguy = dataEx.exec(foulssplit![ci])
    foulsBarsArr[ci][0].setText(thisguy![1]);
    foulsBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikeoutspitchingdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Strikeouts Pitching.txt`, 'utf8');
  let strikeoutspitchingsplit = strikeoutspitchingdata.match(sentenceEx);
  for (let ci=0;ci<strikeoutspitchingsplit!.length;ci++) {
    let thisguy = dataEx.exec(strikeoutspitchingsplit![ci])
    strikeoutspitchingBarsArr[ci][0].setText(thisguy![1]);
    strikeoutspitchingBarsArr[ci][1].setText(thisguy![2]);
  }
  let balloutsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Ballouts.txt`, 'utf8');
  let balloutssplit = balloutsdata.match(sentenceEx);
  for (let ci=0;ci<balloutssplit!.length;ci++) {
    let thisguy = dataEx.exec(balloutssplit![ci])
    balloutsBarsArr[ci][0].setText(thisguy![1]);
    balloutsBarsArr[ci][1].setText(thisguy![2]);
  }
  let slamsgivendata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Slams Given.txt`, 'utf8');
  let slamsgivensplit = slamsgivendata.match(sentenceEx);
  for (let ci=0;ci<slamsgivensplit!.length;ci++) {
    let thisguy = dataEx.exec(slamsgivensplit![ci])
    slamsgivenBarsArr[ci][0].setText(thisguy![1]);
    slamsgivenBarsArr[ci][1].setText(thisguy![2]);
  }
  let atbatsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/At-Bats.txt`, 'utf8');
  let atbatssplit = atbatsdata.match(sentenceEx);
  for (let ci=0;ci<atbatssplit!.length;ci++) {
    let thisguy = dataEx.exec(atbatssplit![ci])
    atbatsBarsArr[ci][0].setText(thisguy![1]);
    atbatsBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Hits.txt`, 'utf8');
  let hitssplit = hitsdata.match(sentenceEx);
  for (let ci=0;ci<hitssplit!.length;ci++) {
    let thisguy = dataEx.exec(hitssplit![ci])
    hitsBarsArr[ci][0].setText(thisguy![1]);
    hitsBarsArr[ci][1].setText(thisguy![2]);
  }
  let slamsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Slams.txt`, 'utf8');
  let slamssplit = slamsdata.match(sentenceEx);
  for (let ci=0;ci<slamssplit!.length;ci++) {
    let thisguy = dataEx.exec(slamssplit![ci])
    slamsBarsArr[ci][0].setText(thisguy![1]);
    slamsBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitstooutdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Hits to Out.txt`, 'utf8');
  let hitstooutsplit = hitstooutdata.match(sentenceEx);
  for (let ci=0;ci<hitstooutsplit!.length;ci++) {
    let thisguy = dataEx.exec(hitstooutsplit![ci])
    hitstooutBarsArr[ci][0].setText(thisguy![1]);
    hitstooutBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitstooffensedata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Hits to Offense.txt`, 'utf8');
  let hitstooffensesplit = hitstooffensedata.match(sentenceEx);
  for (let ci=0;ci<hitstooffensesplit!.length;ci++) {
    let thisguy = dataEx.exec(hitstooffensesplit![ci])
    hitstooffenseBarsArr[ci][0].setText(thisguy![1]);
    hitstooffenseBarsArr[ci][1].setText(thisguy![2]);
  }
  let fouloutsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Foulouts.txt`, 'utf8');
  let fouloutssplit = fouloutsdata.match(sentenceEx);
  for (let ci=0;ci<fouloutssplit!.length;ci++) {
    let thisguy = dataEx.exec(fouloutssplit![ci])
    fouloutsBarsArr[ci][0].setText(thisguy![1]);
    fouloutsBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikeoutsbattingdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Strikeouts Batting.txt`, 'utf8');
  let strikeoutsbattingsplit = strikeoutsbattingdata.match(sentenceEx);
  for (let ci=0;ci<strikeoutsbattingsplit!.length;ci++) {
    let thisguy = dataEx.exec(strikeoutsbattingsplit![ci])
    strikeoutsbattingBarsArr[ci][0].setText(thisguy![1]);
    strikeoutsbattingBarsArr[ci][1].setText(thisguy![2]);
  }
  let tacklesdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Tackles.txt`, 'utf8');
  let tacklessplit = tacklesdata.match(sentenceEx);
  for (let ci=0;ci<tacklessplit!.length;ci++) {
    let thisguy = dataEx.exec(tacklessplit![ci])
    tacklesBarsArr[ci][0].setText(thisguy![1]);
    tacklesBarsArr[ci][1].setText(thisguy![2]);
  }
  let blockssheddata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Blocks Shed.txt`, 'utf8');
  let blocksshedsplit = blockssheddata.match(sentenceEx);
  for (let ci=0;ci<blocksshedsplit!.length;ci++) {
    let thisguy = dataEx.exec(blocksshedsplit![ci])
    blocksshedBarsArr[ci][0].setText(thisguy![1]);
    blocksshedBarsArr[ci][1].setText(thisguy![2]);
  }
  let interceptionsdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Interceptions.txt`, 'utf8');
  let interceptionssplit = interceptionsdata.match(sentenceEx);
  for (let ci=0;ci<interceptionssplit!.length;ci++) {
    let thisguy = dataEx.exec(interceptionssplit![ci])
    interceptionsBarsArr[ci][0].setText(thisguy![1]);
    interceptionsBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsfieldeddefdata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Balls Fielded (DEF).txt`, 'utf8');
  let ballsfieldeddefsplit = ballsfieldeddefdata.match(sentenceEx);
  for (let ci=0;ci<ballsfieldeddefsplit!.length;ci++) {
    let thisguy = dataEx.exec(ballsfieldeddefsplit![ci])
    ballsfieldeddefBarsArr[ci][0].setText(thisguy![1]);
    ballsfieldeddefBarsArr[ci][1].setText(thisguy![2]);
  }
  let totaloutsrecordeddata = fs.readFileSync(`./dist/src/records/Transitional/${recordTypesSelect}/Total Outs Recorded.txt`, 'utf8');
  let totaloutsrecordedsplit = totaloutsrecordeddata.match(sentenceEx);
  for (let ci=0;ci<totaloutsrecordedsplit!.length;ci++) {
    let thisguy = dataEx.exec(totaloutsrecordedsplit![ci])
    totaloutsrecordedBarsArr[ci][0].setText(thisguy![1]);
    totaloutsrecordedBarsArr[ci][1].setText(thisguy![2]);
  } stacked.setCurrentWidget(recordsScroll);
  
});


const middleRecords = new QPushButton();

middleRecords.setText("Middle Leagues");
middleRecords.setObjectName('middleRecords');
middleRecords.addEventListener("released", () => {
  
  let pointsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Points Scored.txt`, 'utf8');
  let sentenceEx = new RegExp(/.+.|!/g);
  let pointssplit = pointsdata.match(sentenceEx);
  let dataEx = new RegExp(/(.+) (\d+)/);
  for (let ci=0;ci<pointssplit!.length;ci++) {
    let thisguy = dataEx.exec(pointssplit![ci])
    pointBarsArr[ci][0].setText(thisguy![1]);
    pointBarsArr[ci][1].setText(thisguy![2]);
  }
  let assistsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Assists.txt`, 'utf8');
  let assistssplit = assistsdata.match(sentenceEx);
  for (let ci=0;ci<assistssplit!.length;ci++) {
    let thisguy = dataEx.exec(assistssplit![ci])
    assistsBarsArr[ci][0].setText(thisguy![1]);
    assistsBarsArr[ci][1].setText(thisguy![2]);
  }
  let assistpointsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Assist Points.txt`, 'utf8');
  let assistpointssplit = assistpointsdata.match(sentenceEx);
  for (let ci=0;ci<assistpointssplit!.length;ci++) {
    let thisguy = dataEx.exec(assistpointssplit![ci])
    assistpointsBarsArr[ci][0].setText(thisguy![1]);
    assistpointsBarsArr[ci][1].setText(thisguy![2]);
  }
  let brokentacklesdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Broken Tackles.txt`, 'utf8');
  let brokentacklessplit = brokentacklesdata.match(sentenceEx);
  for (let ci=0;ci<brokentacklessplit!.length;ci++) {
    let thisguy = dataEx.exec(brokentacklessplit![ci])
    brokentacklesBarsArr[ci][0].setText(thisguy![1]);
    brokentacklesBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsfieldedoffdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Balls Fielded (OFF).txt`, 'utf8');
  let ballsfieldedoffsplit = ballsfieldedoffdata.match(sentenceEx);
  for (let ci=0;ci<ballsfieldedoffsplit!.length;ci++) {
    let thisguy = dataEx.exec(ballsfieldedoffsplit![ci])
    ballsfieldedoffBarsArr[ci][0].setText(thisguy![1]);
    ballsfieldedoffBarsArr[ci][1].setText(thisguy![2]);
  }
  let blocksdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Blocks.txt`, 'utf8');
  let blockssplit = blocksdata.match(sentenceEx);
  for (let ci=0;ci<blockssplit!.length;ci++) {
    let thisguy = dataEx.exec(blockssplit![ci])
    blocksBarsArr[ci][0].setText(thisguy![1]);
    blocksBarsArr[ci][1].setText(thisguy![2]);
  }
  let turnoversdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Turnovers.txt`, 'utf8');
  let turnoverssplit = turnoversdata.match(sentenceEx);
  for (let ci=0;ci<turnoverssplit!.length;ci++) {
    let thisguy = dataEx.exec(turnoverssplit![ci])
    turnoversBarsArr[ci][0].setText(thisguy![1]);
    turnoversBarsArr[ci][1].setText(thisguy![2]);
  }
  let pitchesdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Pitches.txt`, 'utf8');
  let pitchessplit = pitchesdata.match(sentenceEx);
  for (let ci=0;ci<pitchessplit!.length;ci++) {
    let thisguy = dataEx.exec(pitchessplit![ci])
    pitchesBarsArr[ci][0].setText(thisguy![1]);
    pitchesBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikesdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Strikes.txt`, 'utf8');
  let strikessplit = strikesdata.match(sentenceEx);
  for (let ci=0;ci<strikessplit!.length;ci++) {
    let thisguy = dataEx.exec(strikessplit![ci])
    strikesBarsArr[ci][0].setText(thisguy![1]);
    strikesBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Balls.txt`, 'utf8');
  let ballssplit = ballsdata.match(sentenceEx);
  for (let ci=0;ci<ballssplit!.length;ci++) {
    let thisguy = dataEx.exec(ballssplit![ci])
    ballsBarsArr[ci][0].setText(thisguy![1]);
    ballsBarsArr[ci][1].setText(thisguy![2]);
  }
  let foulsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Fouls.txt`, 'utf8');
  let foulssplit = foulsdata.match(sentenceEx);
  for (let ci=0;ci<foulssplit!.length;ci++) {
    let thisguy = dataEx.exec(foulssplit![ci])
    foulsBarsArr[ci][0].setText(thisguy![1]);
    foulsBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikeoutspitchingdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Strikeouts Pitching.txt`, 'utf8');
  let strikeoutspitchingsplit = strikeoutspitchingdata.match(sentenceEx);
  for (let ci=0;ci<strikeoutspitchingsplit!.length;ci++) {
    let thisguy = dataEx.exec(strikeoutspitchingsplit![ci])
    strikeoutspitchingBarsArr[ci][0].setText(thisguy![1]);
    strikeoutspitchingBarsArr[ci][1].setText(thisguy![2]);
  }
  let balloutsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Ballouts.txt`, 'utf8');
  let balloutssplit = balloutsdata.match(sentenceEx);
  for (let ci=0;ci<balloutssplit!.length;ci++) {
    let thisguy = dataEx.exec(balloutssplit![ci])
    balloutsBarsArr[ci][0].setText(thisguy![1]);
    balloutsBarsArr[ci][1].setText(thisguy![2]);
  }
  let slamsgivendata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Slams Given.txt`, 'utf8');
  let slamsgivensplit = slamsgivendata.match(sentenceEx);
  for (let ci=0;ci<slamsgivensplit!.length;ci++) {
    let thisguy = dataEx.exec(slamsgivensplit![ci])
    slamsgivenBarsArr[ci][0].setText(thisguy![1]);
    slamsgivenBarsArr[ci][1].setText(thisguy![2]);
  }
  let atbatsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/At-Bats.txt`, 'utf8');
  let atbatssplit = atbatsdata.match(sentenceEx);
  for (let ci=0;ci<atbatssplit!.length;ci++) {
    let thisguy = dataEx.exec(atbatssplit![ci])
    atbatsBarsArr[ci][0].setText(thisguy![1]);
    atbatsBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Hits.txt`, 'utf8');
  let hitssplit = hitsdata.match(sentenceEx);
  for (let ci=0;ci<hitssplit!.length;ci++) {
    let thisguy = dataEx.exec(hitssplit![ci])
    hitsBarsArr[ci][0].setText(thisguy![1]);
    hitsBarsArr[ci][1].setText(thisguy![2]);
  }
  let slamsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Slams.txt`, 'utf8');
  let slamssplit = slamsdata.match(sentenceEx);
  for (let ci=0;ci<slamssplit!.length;ci++) {
    let thisguy = dataEx.exec(slamssplit![ci])
    slamsBarsArr[ci][0].setText(thisguy![1]);
    slamsBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitstooutdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Hits to Out.txt`, 'utf8');
  let hitstooutsplit = hitstooutdata.match(sentenceEx);
  for (let ci=0;ci<hitstooutsplit!.length;ci++) {
    let thisguy = dataEx.exec(hitstooutsplit![ci])
    hitstooutBarsArr[ci][0].setText(thisguy![1]);
    hitstooutBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitstooffensedata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Hits to Offense.txt`, 'utf8');
  let hitstooffensesplit = hitstooffensedata.match(sentenceEx);
  for (let ci=0;ci<hitstooffensesplit!.length;ci++) {
    let thisguy = dataEx.exec(hitstooffensesplit![ci])
    hitstooffenseBarsArr[ci][0].setText(thisguy![1]);
    hitstooffenseBarsArr[ci][1].setText(thisguy![2]);
  }
  let fouloutsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Foulouts.txt`, 'utf8');
  let fouloutssplit = fouloutsdata.match(sentenceEx);
  for (let ci=0;ci<fouloutssplit!.length;ci++) {
    let thisguy = dataEx.exec(fouloutssplit![ci])
    fouloutsBarsArr[ci][0].setText(thisguy![1]);
    fouloutsBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikeoutsbattingdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Strikeouts Batting.txt`, 'utf8');
  let strikeoutsbattingsplit = strikeoutsbattingdata.match(sentenceEx);
  for (let ci=0;ci<strikeoutsbattingsplit!.length;ci++) {
    let thisguy = dataEx.exec(strikeoutsbattingsplit![ci])
    strikeoutsbattingBarsArr[ci][0].setText(thisguy![1]);
    strikeoutsbattingBarsArr[ci][1].setText(thisguy![2]);
  }
  let tacklesdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Tackles.txt`, 'utf8');
  let tacklessplit = tacklesdata.match(sentenceEx);
  for (let ci=0;ci<tacklessplit!.length;ci++) {
    let thisguy = dataEx.exec(tacklessplit![ci])
    tacklesBarsArr[ci][0].setText(thisguy![1]);
    tacklesBarsArr[ci][1].setText(thisguy![2]);
  }
  let blockssheddata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Blocks Shed.txt`, 'utf8');
  let blocksshedsplit = blockssheddata.match(sentenceEx);
  for (let ci=0;ci<blocksshedsplit!.length;ci++) {
    let thisguy = dataEx.exec(blocksshedsplit![ci])
    blocksshedBarsArr[ci][0].setText(thisguy![1]);
    blocksshedBarsArr[ci][1].setText(thisguy![2]);
  }
  let interceptionsdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Interceptions.txt`, 'utf8');
  let interceptionssplit = interceptionsdata.match(sentenceEx);
  for (let ci=0;ci<interceptionssplit!.length;ci++) {
    let thisguy = dataEx.exec(interceptionssplit![ci])
    interceptionsBarsArr[ci][0].setText(thisguy![1]);
    interceptionsBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsfieldeddefdata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Balls Fielded (DEF).txt`, 'utf8');
  let ballsfieldeddefsplit = ballsfieldeddefdata.match(sentenceEx);
  for (let ci=0;ci<ballsfieldeddefsplit!.length;ci++) {
    let thisguy = dataEx.exec(ballsfieldeddefsplit![ci])
    ballsfieldeddefBarsArr[ci][0].setText(thisguy![1]);
    ballsfieldeddefBarsArr[ci][1].setText(thisguy![2]);
  }
  let totaloutsrecordeddata = fs.readFileSync(`./dist/src/records/Middle/${recordTypesSelect}/Total Outs Recorded.txt`, 'utf8');
  let totaloutsrecordedsplit = totaloutsrecordeddata.match(sentenceEx);
  for (let ci=0;ci<totaloutsrecordedsplit!.length;ci++) {
    let thisguy = dataEx.exec(totaloutsrecordedsplit![ci])
    totaloutsrecordedBarsArr[ci][0].setText(thisguy![1]);
    totaloutsrecordedBarsArr[ci][1].setText(thisguy![2]);
  } stacked.setCurrentWidget(recordsScroll);
  
});

const entryRecords = new QPushButton();

entryRecords.setObjectName('entryRecords');
entryRecords.setText("Entry Leagues");
entryRecords.addEventListener("released", () => {
  
  let pointsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Points Scored.txt`, 'utf8');
  let sentenceEx = new RegExp(/.+.|!/g);
  let pointssplit = pointsdata.match(sentenceEx);
  let dataEx = new RegExp(/(.+) (\d+)/);
  for (let ci=0;ci<pointssplit!.length;ci++) {
    let thisguy = dataEx.exec(pointssplit![ci])
    pointBarsArr[ci][0].setText(thisguy![1]);
    pointBarsArr[ci][1].setText(thisguy![2]);
  }
  let assistsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Assists.txt`, 'utf8');
  let assistssplit = assistsdata.match(sentenceEx);
  for (let ci=0;ci<assistssplit!.length;ci++) {
    let thisguy = dataEx.exec(assistssplit![ci])
    assistsBarsArr[ci][0].setText(thisguy![1]);
    assistsBarsArr[ci][1].setText(thisguy![2]);
  }
  let assistpointsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Assist Points.txt`, 'utf8');
  let assistpointssplit = assistpointsdata.match(sentenceEx);
  for (let ci=0;ci<assistpointssplit!.length;ci++) {
    let thisguy = dataEx.exec(assistpointssplit![ci])
    assistpointsBarsArr[ci][0].setText(thisguy![1]);
    assistpointsBarsArr[ci][1].setText(thisguy![2]);
  }
  let brokentacklesdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Broken Tackles.txt`, 'utf8');
  let brokentacklessplit = brokentacklesdata.match(sentenceEx);
  for (let ci=0;ci<brokentacklessplit!.length;ci++) {
    let thisguy = dataEx.exec(brokentacklessplit![ci])
    brokentacklesBarsArr[ci][0].setText(thisguy![1]);
    brokentacklesBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsfieldedoffdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Balls Fielded (OFF).txt`, 'utf8');
  let ballsfieldedoffsplit = ballsfieldedoffdata.match(sentenceEx);
  for (let ci=0;ci<ballsfieldedoffsplit!.length;ci++) {
    let thisguy = dataEx.exec(ballsfieldedoffsplit![ci])
    ballsfieldedoffBarsArr[ci][0].setText(thisguy![1]);
    ballsfieldedoffBarsArr[ci][1].setText(thisguy![2]);
  }
  let blocksdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Blocks.txt`, 'utf8');
  let blockssplit = blocksdata.match(sentenceEx);
  for (let ci=0;ci<blockssplit!.length;ci++) {
    let thisguy = dataEx.exec(blockssplit![ci])
    blocksBarsArr[ci][0].setText(thisguy![1]);
    blocksBarsArr[ci][1].setText(thisguy![2]);
  }
  let turnoversdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Turnovers.txt`, 'utf8');
  let turnoverssplit = turnoversdata.match(sentenceEx);
  for (let ci=0;ci<turnoverssplit!.length;ci++) {
    let thisguy = dataEx.exec(turnoverssplit![ci])
    turnoversBarsArr[ci][0].setText(thisguy![1]);
    turnoversBarsArr[ci][1].setText(thisguy![2]);
  }
  let pitchesdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Pitches.txt`, 'utf8');
  let pitchessplit = pitchesdata.match(sentenceEx);
  for (let ci=0;ci<pitchessplit!.length;ci++) {
    let thisguy = dataEx.exec(pitchessplit![ci])
    pitchesBarsArr[ci][0].setText(thisguy![1]);
    pitchesBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikesdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Strikes.txt`, 'utf8');
  let strikessplit = strikesdata.match(sentenceEx);
  for (let ci=0;ci<strikessplit!.length;ci++) {
    let thisguy = dataEx.exec(strikessplit![ci])
    strikesBarsArr[ci][0].setText(thisguy![1]);
    strikesBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Balls.txt`, 'utf8');
  let ballssplit = ballsdata.match(sentenceEx);
  for (let ci=0;ci<ballssplit!.length;ci++) {
    let thisguy = dataEx.exec(ballssplit![ci])
    ballsBarsArr[ci][0].setText(thisguy![1]);
    ballsBarsArr[ci][1].setText(thisguy![2]);
  }
  let foulsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Fouls.txt`, 'utf8');
  let foulssplit = foulsdata.match(sentenceEx);
  for (let ci=0;ci<foulssplit!.length;ci++) {
    let thisguy = dataEx.exec(foulssplit![ci])
    foulsBarsArr[ci][0].setText(thisguy![1]);
    foulsBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikeoutspitchingdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Strikeouts Pitching.txt`, 'utf8');
  let strikeoutspitchingsplit = strikeoutspitchingdata.match(sentenceEx);
  for (let ci=0;ci<strikeoutspitchingsplit!.length;ci++) {
    let thisguy = dataEx.exec(strikeoutspitchingsplit![ci])
    strikeoutspitchingBarsArr[ci][0].setText(thisguy![1]);
    strikeoutspitchingBarsArr[ci][1].setText(thisguy![2]);
  }
  let balloutsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Ballouts.txt`, 'utf8');
  let balloutssplit = balloutsdata.match(sentenceEx);
  for (let ci=0;ci<balloutssplit!.length;ci++) {
    let thisguy = dataEx.exec(balloutssplit![ci])
    balloutsBarsArr[ci][0].setText(thisguy![1]);
    balloutsBarsArr[ci][1].setText(thisguy![2]);
  }
  let slamsgivendata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Slams Given.txt`, 'utf8');
  let slamsgivensplit = slamsgivendata.match(sentenceEx);
  for (let ci=0;ci<slamsgivensplit!.length;ci++) {
    let thisguy = dataEx.exec(slamsgivensplit![ci])
    slamsgivenBarsArr[ci][0].setText(thisguy![1]);
    slamsgivenBarsArr[ci][1].setText(thisguy![2]);
  }
  let atbatsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/At-Bats.txt`, 'utf8');
  let atbatssplit = atbatsdata.match(sentenceEx);
  for (let ci=0;ci<atbatssplit!.length;ci++) {
    let thisguy = dataEx.exec(atbatssplit![ci])
    atbatsBarsArr[ci][0].setText(thisguy![1]);
    atbatsBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Hits.txt`, 'utf8');
  let hitssplit = hitsdata.match(sentenceEx);
  for (let ci=0;ci<hitssplit!.length;ci++) {
    let thisguy = dataEx.exec(hitssplit![ci])
    hitsBarsArr[ci][0].setText(thisguy![1]);
    hitsBarsArr[ci][1].setText(thisguy![2]);
  }
  let slamsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Slams.txt`, 'utf8');
  let slamssplit = slamsdata.match(sentenceEx);
  for (let ci=0;ci<slamssplit!.length;ci++) {
    let thisguy = dataEx.exec(slamssplit![ci])
    slamsBarsArr[ci][0].setText(thisguy![1]);
    slamsBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitstooutdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Hits to Out.txt`, 'utf8');
  let hitstooutsplit = hitstooutdata.match(sentenceEx);
  for (let ci=0;ci<hitstooutsplit!.length;ci++) {
    let thisguy = dataEx.exec(hitstooutsplit![ci])
    hitstooutBarsArr[ci][0].setText(thisguy![1]);
    hitstooutBarsArr[ci][1].setText(thisguy![2]);
  }
  let hitstooffensedata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Hits to Offense.txt`, 'utf8');
  let hitstooffensesplit = hitstooffensedata.match(sentenceEx);
  for (let ci=0;ci<hitstooffensesplit!.length;ci++) {
    let thisguy = dataEx.exec(hitstooffensesplit![ci])
    hitstooffenseBarsArr[ci][0].setText(thisguy![1]);
    hitstooffenseBarsArr[ci][1].setText(thisguy![2]);
  }
  let fouloutsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Foulouts.txt`, 'utf8');
  let fouloutssplit = fouloutsdata.match(sentenceEx);
  for (let ci=0;ci<fouloutssplit!.length;ci++) {
    let thisguy = dataEx.exec(fouloutssplit![ci])
    fouloutsBarsArr[ci][0].setText(thisguy![1]);
    fouloutsBarsArr[ci][1].setText(thisguy![2]);
  }
  let strikeoutsbattingdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Strikeouts Batting.txt`, 'utf8');
  let strikeoutsbattingsplit = strikeoutsbattingdata.match(sentenceEx);
  for (let ci=0;ci<strikeoutsbattingsplit!.length;ci++) {
    let thisguy = dataEx.exec(strikeoutsbattingsplit![ci])
    strikeoutsbattingBarsArr[ci][0].setText(thisguy![1]);
    strikeoutsbattingBarsArr[ci][1].setText(thisguy![2]);
  }
  let tacklesdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Tackles.txt`, 'utf8');
  let tacklessplit = tacklesdata.match(sentenceEx);
  for (let ci=0;ci<tacklessplit!.length;ci++) {
    let thisguy = dataEx.exec(tacklessplit![ci])
    tacklesBarsArr[ci][0].setText(thisguy![1]);
    tacklesBarsArr[ci][1].setText(thisguy![2]);
  }
  let blockssheddata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Blocks Shed.txt`, 'utf8');
  let blocksshedsplit = blockssheddata.match(sentenceEx);
  for (let ci=0;ci<blocksshedsplit!.length;ci++) {
    let thisguy = dataEx.exec(blocksshedsplit![ci])
    blocksshedBarsArr[ci][0].setText(thisguy![1]);
    blocksshedBarsArr[ci][1].setText(thisguy![2]);
  }
  let interceptionsdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Interceptions.txt`, 'utf8');
  let interceptionssplit = interceptionsdata.match(sentenceEx);
  for (let ci=0;ci<interceptionssplit!.length;ci++) {
    let thisguy = dataEx.exec(interceptionssplit![ci])
    interceptionsBarsArr[ci][0].setText(thisguy![1]);
    interceptionsBarsArr[ci][1].setText(thisguy![2]);
  }
  let ballsfieldeddefdata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Balls Fielded (DEF).txt`, 'utf8');
  let ballsfieldeddefsplit = ballsfieldeddefdata.match(sentenceEx);
  for (let ci=0;ci<ballsfieldeddefsplit!.length;ci++) {
    let thisguy = dataEx.exec(ballsfieldeddefsplit![ci])
    ballsfieldeddefBarsArr[ci][0].setText(thisguy![1]);
    ballsfieldeddefBarsArr[ci][1].setText(thisguy![2]);
  }
  let totaloutsrecordeddata = fs.readFileSync(`./dist/src/records/Entry/${recordTypesSelect}/Total Outs Recorded.txt`, 'utf8');
  let totaloutsrecordedsplit = totaloutsrecordeddata.match(sentenceEx);
  for (let ci=0;ci<totaloutsrecordedsplit!.length;ci++) {
    let thisguy = dataEx.exec(totaloutsrecordedsplit![ci])
    totaloutsrecordedBarsArr[ci][0].setText(thisguy![1]);
    totaloutsrecordedBarsArr[ci][1].setText(thisguy![2]);
  } stacked.setCurrentWidget(recordsScroll);
  
});

const leagueRecordsSelect = new QWidget();
leagueRecordsSelect.setObjectName('leagueRecordsSelect');
const leagueRecordsSelectLayout = new FlexLayout();
leagueRecordsSelect.setLayout(leagueRecordsSelectLayout);

const recordsMenuLeagues = new QWidget()
recordsMenuLeagues.setObjectName('recordsMenuLeagues');
const recordsMenuLeaguesLayout = new FlexLayout();
recordsMenuLeagues.setLayout(recordsMenuLeaguesLayout);
recordsMenuLeagues.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start'; justify-content: 'center';");

recordsMenuLeaguesLayout.addWidget(premierRecords);
recordsMenuLeaguesLayout.addWidget(transitionalRecords);
recordsMenuLeaguesLayout.addWidget(middleRecords);
recordsMenuLeaguesLayout.addWidget(entryRecords);



const recordTypesMenu = new QWidget();
recordTypesMenu.setObjectName('recordTypesMenu');
const recordTypesMenuLayout = new FlexLayout();
recordTypesMenu.setLayout(recordTypesMenuLayout)
recordTypesMenu.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start'; justify-content: 'center';");

recordTypesMenuLayout.addWidget(gameRecords);
recordTypesMenuLayout.addWidget(seasonRecords);
recordTypesMenuLayout.addWidget(careerRecords);



statsSelectLayout.addWidget(playersButton);
statsSelectLayout.addWidget(rosters);
statsSelectLayout.addWidget(teamStats);
statsSelectLayout.addWidget(seasonworldStats);
statsSelectLayout.addWidget(careerworldStats);
statsSelectLayout.addWidget(recordsButton);

//
const schedule = new QWidget;
schedule.setObjectName("schedule");
const scheduleLayout = new FlexLayout();
schedule.setLayout(scheduleLayout);


const scheduleScroll = new QScrollArea();
scheduleScroll.setInlineStyle(`flex: 8; background-color: transparent; width: 800px;`);
const scheduleScrollLayout = new FlexLayout();
scheduleScroll.setLayout(scheduleScrollLayout);


const scheduleTopBar = new QWidget;
scheduleTopBar.setObjectName("scheduleTopBar");
const scheduleTopBarLayout = new FlexLayout();
scheduleTopBar.setLayout(scheduleTopBarLayout);

const scheduleBottomBar = new QWidget;
scheduleBottomBar.setObjectName("scheduleBottomBar");
const scheduleBottomBarLayout = new FlexLayout();
scheduleBottomBar.setLayout(scheduleBottomBarLayout);

const schedView = new QWidget;
schedView.setObjectName("schedView");
const schedViewLayout = new FlexLayout();
schedView.setLayout(schedViewLayout);

schedViewLayout.addWidget(scheduleTopBar);
schedViewLayout.addWidget(scheduleScroll);
schedViewLayout.addWidget(scheduleBottomBar);

const blankView = new QWidget();

let watchGame = new QWidget();
watchGame.setObjectName("watchGame");
let watchGameLayout = new FlexLayout();
watchGame.setLayout(watchGameLayout);

let awayteamlabel = new QLabel();
awayteamlabel.setText("Coos Bay Meadowlarks");
awayteamlabel.setFixedHeight(15);
awayteamlabel.setFixedWidth(150);
let hometeamlabel = new QLabel();
hometeamlabel.setText("Ashland Bards");
hometeamlabel.setFixedHeight(15);
hometeamlabel.setFixedWidth(150);
let top1 = new QLabel();
top1.setObjectName("boxscorebox")
top1.setText("0");
let bottom1 = new QLabel();
bottom1.setObjectName("boxscorebox")
bottom1.setText("0");
let top2 = new QLabel();
top2.setObjectName("boxscorebox")
top2.setText("0");
let bottom2 = new QLabel();
bottom2.setObjectName("boxscorebox")
bottom2.setText("0");
let top3 = new QLabel();
top3.setObjectName("boxscorebox")
top3.setText("0");
let bottom3 = new QLabel();
bottom3.setObjectName("boxscorebox")
bottom3.setText("0");
let top4 = new QLabel();
top4.setObjectName("boxscorebox")
top4.setText("0");
let bottom4 = new QLabel();
bottom4.setObjectName("boxscorebox")
bottom4.setText("0");
let top5 = new QLabel();
top5.setObjectName("boxscorebox")
top5.setText("0");
let bottom5 = new QLabel();
bottom5.setObjectName("boxscorebox")
bottom5.setText("0");
let top6 = new QLabel();
top6.setObjectName("boxscorebox")
top6.setText("0");
let bottom6 = new QLabel();
bottom6.setObjectName("boxscorebox")
bottom6.setText("0");
let awayfinal = new QLabel();
awayfinal.setObjectName("boxscorebox")
awayfinal.setText("0");
let homefinal = new QLabel();
homefinal.setObjectName("boxscorebox")
homefinal.setText("0");

const boxscore = new QWidget();
boxscore.setObjectName("boxscore");
const boxscoreLayout = new FlexLayout();
boxscore.setLayout(boxscoreLayout);

const versus = new QWidget();
versus.setObjectName("versus");
const versusLayout = new FlexLayout();
versus.setLayout(versusLayout);
versus.setInlineStyle('flex-direction: column;');

versusLayout.addWidget(awayteamlabel);
versusLayout.addWidget(hometeamlabel);

const inning1 = new QWidget();
inning1.setObjectName("inning1");
const inning1Layout = new FlexLayout();
inning1.setLayout(inning1Layout);
inning1.setInlineStyle('flex-direction: column');

inning1Layout.addWidget(top1);
inning1Layout.addWidget(bottom1);

const inning2 = new QWidget();
inning2.setObjectName("inning2");
const inning2Layout = new FlexLayout();
inning2.setLayout(inning2Layout);
inning2.setInlineStyle('flex-direction: column');

inning2Layout.addWidget(top2);
inning2Layout.addWidget(bottom2);

const inning3 = new QWidget();
inning3.setObjectName("inning3");
const inning3Layout = new FlexLayout();
inning3.setLayout(inning3Layout);
inning3.setInlineStyle('flex-direction: column');

inning3Layout.addWidget(top3);
inning3Layout.addWidget(bottom3);

const inning4 = new QWidget();
inning4.setObjectName("inning4");
const inning4Layout = new FlexLayout();
inning4.setLayout(inning4Layout);
inning4.setInlineStyle('flex-direction: column');

inning4Layout.addWidget(top4);
inning4Layout.addWidget(bottom4);

const inning5 = new QWidget();
inning5.setObjectName("inning5");
const inning5Layout = new FlexLayout();
inning5.setLayout(inning5Layout);
inning5.setInlineStyle('flex-direction: column');

inning5Layout.addWidget(top5);
inning5Layout.addWidget(bottom5);

const inning6 = new QWidget();
inning6.setObjectName("inning6");
const inning6Layout = new FlexLayout();
inning6.setLayout(inning6Layout);
inning6.setInlineStyle('flex-direction: column');

inning6Layout.addWidget(top6);
inning6Layout.addWidget(bottom6);

const inning7 = new QWidget();
inning7.setObjectName("inning7");
const inning7Layout = new FlexLayout();
inning7.setLayout(inning7Layout);
inning7.setInlineStyle('flex-direction: column');

inning7Layout.addWidget(awayfinal);
inning7Layout.addWidget(homefinal);


boxscoreLayout.addWidget(versus);
boxscoreLayout.addWidget(inning1);
boxscoreLayout.addWidget(inning2);
boxscoreLayout.addWidget(inning3);
boxscoreLayout.addWidget(inning4);
boxscoreLayout.addWidget(inning5);
boxscoreLayout.addWidget(inning6);
boxscoreLayout.addWidget(inning7);


let currentaction = new QLabel();
currentaction.setText("")
currentaction.setObjectName("actionLabel");
currentaction.setInlineStyle('font-size: 25px; height: 100px; color: #00D420; font-family: "Copperplate Gothic Bold";');
currentaction.setAlignment(132);
currentaction.setWordWrap(true);
let lastaction = new QLabel();
lastaction.setText("")
lastaction.setObjectName("actionLabel");
lastaction.setInlineStyle('font-size: 13px; height: 50px; color: rgba(0,154,23, 75%); font-family: "Copperplate Gothic Bold";');
lastaction.setAlignment(132);
lastaction.setWordWrap(true);
let thirdaction = new QLabel();
thirdaction.setText("")
thirdaction.setObjectName("actionLabel");
thirdaction.setInlineStyle('font-size: 7px; height: 25px; color: rgba(0,154,23, 50%); font-family: "Copperplate Gothic Bold";');
thirdaction.setAlignment(132);
thirdaction.setWordWrap(true);
let fourthaction = new QLabel();
fourthaction.setText("")
fourthaction.setObjectName("actionLabel");
fourthaction.setInlineStyle('font-size: 4px; height: 12px; color: rgba(0,154,23, 25%); font-family: "Copperplate Gothic Bold";');
fourthaction.setAlignment(132);
fourthaction.setWordWrap(true);
let fifthaction = new QLabel();
fifthaction.setText("")
fifthaction.setObjectName("actionLabel");
fifthaction.setInlineStyle('font-size: 1px; height: 12px; color: rgba(0,154,23, 12%); font-family: "Copperplate Gothic Bold";');
fifthaction.setAlignment(132);
fifthaction.setWordWrap(true);


let gamespeed = 1000;
let speedtrack = 0;
let run: any;
let timingSlider = new QSlider();
timingSlider.setOrientation(1);
timingSlider.setObjectName("timingSlider");
timingSlider.setMinimum(1);
timingSlider.setMaximum(20);
timingSlider.setTickInterval(5);
timingSlider.addEventListener("sliderReleased", () => {
   gamespeed = 5000 / timingSlider.value();
   let wrtext = wrctext;
   if (rscheck == true) {
     wrtext = `RS Week ${wrtext}`;
   } else if (pocheck == true) {
     wrtext = `PO Round ${wrtext}`;
   }
   let action = gameTextSplitter(hometeamlabel.text(), awayteamlabel.text(), season, selectedLeague, wrtext);
   clearInterval(run);
   run = setInterval(() => {
    fifthaction.setText(fourthaction.text());
    fifthaction.repaint();
    fourthaction.setText(thirdaction.text());
    fourthaction.repaint();
    thirdaction.setText(lastaction.text());
    thirdaction.repaint();
    lastaction.setText(currentaction.text());
    lastaction.repaint();
    currentaction.setText(action![speedtrack]);
    currentaction.repaint();
    if (currentaction.text() == "One point scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 1;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Two points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 2;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Five points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 5;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Three points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 3;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    }let firstEx = new RegExp(/first safely/);
    let secondEx = new RegExp(/second safely/);
    let thirdEx = new RegExp(/third safely/);
    let homeEx = new RegExp(/home safely/);
    let staysfirst = new RegExp(/stays (on|at) first/);
    let stayssecond = new RegExp(/stays on second/);
    let staysthird = new RegExp(/stays on third/);
    let tacklebeforesecondEx = new RegExp(/before he reaches second/);
    let tacklebeforethirdEx = new RegExp(/before he reaches third/);
    let tacklebeforehomeEx = new RegExp(/before he reaches home/);
    let slamEx = new RegExp(/SLAM/);
    let strikesEx = new RegExp(/Strike!|Swing and a miss!/);
    let ballsEx = new RegExp(/Ball\./);
    let foulsEx = new RegExp(/Foul ball!/);
    let outsEx = new RegExp(/OUT/);
    let strikeoutEx = new RegExp(/That last strike/);
    let balloutEx = new RegExp(/That's the fourth ball/);
    let fouloutEx = new RegExp(/That's four foul balls/);
    let endgameEx = new RegExp(/broadcast/);
    if (currentaction.text().match(strikesEx) !== null) {
      let newval = Number(instrikescount.text()) + 1;
      instrikescount.setText(newval);
      instrikescount.repaint();
    }
    if (currentaction.text().match(ballsEx) !== null) {
      let newval = Number(inballscount.text()) + 1;
      inballscount.setText(newval);
      inballscount.repaint();
    }
    if (currentaction.text().match(foulsEx) !== null) {
      let newval = Number(infoulscount.text()) + 1;
      infoulscount.setText(newval);
      infoulscount.repaint();
    }
    if (currentaction.text().match(outsEx) !== null) {
      let newval = Number(inoutscount.text()) + 1;
      inoutscount.setText(newval);
      inoutscount.repaint();
    }
    if (currentaction.text().match(strikeoutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(balloutEx) !== null) {
      inballscount.setText("0");
      inballscount.repaint();
    }
    if (currentaction.text().match(fouloutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(tacklebeforesecondEx) !== null) {
      if (basestrack.firstn == false) {
      basestrack.first = false;
      } else {
        basestrack.firstn = false;
      }
    }
    if (currentaction.text().match(tacklebeforethirdEx) !== null) {
      if (basestrack.secondn == false) {
      basestrack.second = false;
      } else {
        basestrack.secondn = false;
      }
    }
    if (currentaction.text().match(tacklebeforehomeEx) !== null) {
      if (basestrack.thirdn == false) {
      basestrack.third = false;
      } else {
        basestrack.thirdn = false;
      }
    }
    if (currentaction.text().match(firstEx) !== null) {
      basestrack.firstn = true;
    }
    if (currentaction.text().match(secondEx) !== null) {
      basestrack.secondn = true;
      if (basestrack.first == true && basestrack.firstn == false) {
        basestrack.first = false;
      }
    }
    if (currentaction.text().match(thirdEx) !== null) {
      basestrack.thirdn = true;
      if (basestrack.second == true && basestrack.secondn == false) {
        basestrack.second = false;
      }
    }
    if (currentaction.text().match(homeEx) !== null) {
      basestrack.home = true;
      if (basestrack.third == true && basestrack.thirdn == false) {
        basestrack.third = false;
      }
    }
    if (basestrack.firstn == true) {
      basestrack.first = true;
      basestrack.firstn = false;
    }
    if (basestrack.secondn == true) {
      basestrack.second = true;
      basestrack.secondn = false;
    }
    if (basestrack.thirdn == true) {
      basestrack.third = true;
      basestrack.thirdn = false;
    }
    if (currentaction.text().match(staysfirst) !== null) {
      basestrack.first = true;
    }
    if (currentaction.text().match(stayssecond) !== null) {
      basestrack.second = true;
    }
    if (currentaction.text().match(staysthird) !== null) {
      basestrack.third = true;
    }
    if (basestrack.first == true && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(manonfirstp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonfirstpandsecond);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(basesloadedp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonsecondp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(manonsecondpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonthirdp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonfirstpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(basesempty);
      baselabel.repaint();
    }
    if (currentaction.text().match(slamEx) !== null) {
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
    }
    let finscoreaway = (Number(top1.text()) + Number(top2.text()) + Number(top3.text()) + Number(top4.text()) + Number(top5.text()) + Number(top6.text()));
    awayfinal.setText(finscoreaway);
    awayfinal.repaint();
    let finscorehome = (Number(bottom1.text()) + Number(bottom2.text()) + Number(bottom3.text()) + Number(bottom4.text()) + Number(bottom5.text()) + Number(bottom6.text()));
    homefinal.setText(finscorehome);
    homefinal.repaint();
    let endinningEx = new RegExp(/home: .+, away: .+/);
    if (currentaction.text() !== null) {
    if (currentaction.text().match(endinningEx)! !== null) {
      instrikescount.setText("0");
      inballscount.setText("0");
      infoulscount.setText("0");
      inoutscount.setText("0");
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
      if (boxscorearr[currentinning] !== undefined) {
      boxscorearr[currentinning].setInlineStyle("background-color: grey;");
      }
      currentinning++;
    }
    }
    if (currentaction.text().match(endgameEx) !== null) {
      clearInterval(run);
      currentinning = 0;
      playButton.setDisabled(true);
      pauseButton.setDisabled(true);
      playballbutton.setDisabled(true);
      timingSlider.setDisabled(true);
      gamesView.setDisabled(false);
      statsbutton.setDisabled(false);
      addorremoveteamsbutton.setDisabled(false);
      runOffseasonButton.setDisabled(false);
      backButton.setDisabled(false);
      gameStatsButton.show();
      nextGameButton.show();
    }
    speedtrack++}, gamespeed);
    return run;
});

timingSlider.setValue(5);

let currentinning = 0;

let boxscorearr: any[] = [top1, bottom1, top2, bottom2, top3, bottom3, top4, bottom4, top5, bottom5, top6, bottom6];
let basestrack = {first: false, firstn: false, second: false, secondn: false, third: false, thirdn: false, home: false};

const playballbutton = new QPushButton();

playballbutton.setObjectName("playballbutton");
playballbutton.setText("Play ball!");
playballbutton.addEventListener("released", () => {
  let wrtext = wrctext;
  if (rscheck == true) {
    wrtext = `RS Week ${wrtext}`;
  } else if (pocheck == true) {
    wrtext = `PO Round ${wrtext}`;
  }
  let action = gameTextSplitter(hometeamlabel.text(), awayteamlabel.text(), season, selectedLeague, wrtext);
  run = setInterval(() => {
    fifthaction.setText(fourthaction.text());
    fifthaction.repaint();
    fourthaction.setText(thirdaction.text());
    fourthaction.repaint();
    thirdaction.setText(lastaction.text());
    thirdaction.repaint();
    lastaction.setText(currentaction.text());
    lastaction.repaint();
    currentaction.setText(action![speedtrack]);
    currentaction.repaint();
    if (currentaction.text() == "One point scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 1;
      console.log(newscore);
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Two points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 2;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Five points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 5;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Three points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 3;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    }
    let firstEx = new RegExp(/first safely/);
    let secondEx = new RegExp(/second safely/);
    let thirdEx = new RegExp(/third safely/);
    let homeEx = new RegExp(/home safely/);
    let staysfirst = new RegExp(/stays (on|at) first/);
    let stayssecond = new RegExp(/stays on second/);
    let staysthird = new RegExp(/stays on third/);
    let tacklebeforesecondEx = new RegExp(/before he reaches second/);
    let tacklebeforethirdEx = new RegExp(/before he reaches third/);
    let tacklebeforehomeEx = new RegExp(/before he reaches home/);
    let slamEx = new RegExp(/SLAM/);
    let strikesEx = new RegExp(/Strike!|Swing and a miss!/);
    let ballsEx = new RegExp(/Ball\./);
    let foulsEx = new RegExp(/Foul ball!/);
    let outsEx = new RegExp(/OUT/);
    let strikeoutEx = new RegExp(/That last strike/);
    let balloutEx = new RegExp(/That's the fourth ball/);
    let fouloutEx = new RegExp(/That's four foul balls/);
    let endgameEx = new RegExp(/broadcast/);
    if (currentaction.text().match(strikesEx) !== null) {
      let newval = Number(instrikescount.text()) + 1;
      instrikescount.setText(newval);
      instrikescount.repaint();
    }
    if (currentaction.text().match(ballsEx) !== null) {
      let newval = Number(inballscount.text()) + 1;
      inballscount.setText(newval);
      inballscount.repaint();
    }
    if (currentaction.text().match(foulsEx) !== null) {
      let newval = Number(infoulscount.text()) + 1;
      infoulscount.setText(newval);
      infoulscount.repaint();
    }
    if (currentaction.text().match(outsEx) !== null) {
      let newval = Number(inoutscount.text()) + 1;
      inoutscount.setText(newval);
      inoutscount.repaint();
    }
    if (currentaction.text().match(strikeoutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(balloutEx) !== null) {
      inballscount.setText("0");
      inballscount.repaint();
    }
    if (currentaction.text().match(fouloutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(tacklebeforesecondEx) !== null) {
      if (basestrack.firstn == false) {
      basestrack.first = false;
      } else {
        basestrack.firstn = false;
      }
    }
    if (currentaction.text().match(tacklebeforethirdEx) !== null) {
      if (basestrack.secondn == false) {
      basestrack.second = false;
      } else {
        basestrack.secondn = false;
      }
    }
    if (currentaction.text().match(tacklebeforehomeEx) !== null) {
      if (basestrack.thirdn == false) {
      basestrack.third = false;
      } else {
        basestrack.thirdn = false;
      }
    }
    if (currentaction.text().match(firstEx) !== null) {
      basestrack.firstn = true;
    }
    if (currentaction.text().match(secondEx) !== null) {
      basestrack.secondn = true;
      if (basestrack.first == true && basestrack.firstn == false) {
        basestrack.first = false;
      }
    }
    if (currentaction.text().match(thirdEx) !== null) {
      basestrack.thirdn = true;
      if (basestrack.second == true && basestrack.secondn == false) {
        basestrack.second = false;
      }
    }
    if (currentaction.text().match(homeEx) !== null) {
      basestrack.home = true;
      if (basestrack.third == true && basestrack.thirdn == false) {
        basestrack.third = false;
      }
    }
    if (basestrack.firstn == true) {
      basestrack.first = true;
      basestrack.firstn = false;
    }
    if (basestrack.secondn == true) {
      basestrack.second = true;
      basestrack.secondn = false;
    }
    if (basestrack.thirdn == true) {
      basestrack.third = true;
      basestrack.thirdn = false;
    }
    if (currentaction.text().match(staysfirst) !== null) {
      basestrack.first = true;
    }
    if (currentaction.text().match(stayssecond) !== null) {
      basestrack.second = true;
    }
    if (currentaction.text().match(staysthird) !== null) {
      basestrack.third = true;
    }
    if (basestrack.first == true && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(manonfirstp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonfirstpandsecond);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(basesloadedp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonsecondp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(manonsecondpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonthirdp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonfirstpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(basesempty);
      baselabel.repaint();
    }
    if (currentaction.text().match(slamEx) !== null) {
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
    }
    let finscoreaway = (Number(top1.text()) + Number(top2.text()) + Number(top3.text()) + Number(top4.text()) + Number(top5.text()) + Number(top6.text()));
    awayfinal.setText(finscoreaway);
    awayfinal.repaint();
    let finscorehome = (Number(bottom1.text()) + Number(bottom2.text()) + Number(bottom3.text()) + Number(bottom4.text()) + Number(bottom5.text()) + Number(bottom6.text()));
    homefinal.setText(finscorehome);
    homefinal.repaint();
    let endinningEx = new RegExp(/home: .+, away: .+/);
    if (currentaction.text() !== null) {
    if (currentaction.text().match(endinningEx)! !== null) {
      instrikescount.setText("0");
      inballscount.setText("0");
      infoulscount.setText("0");
      inoutscount.setText("0");
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
      boxscorearr[currentinning].setInlineStyle("background-color: grey;");
      currentinning++;
    }
    }
    if (currentaction.text().match(endgameEx) !== null) {
      clearInterval(run);
      playButton.setDisabled(true);
      pauseButton.setDisabled(true);
      playballbutton.setDisabled(true);
      timingSlider.setDisabled(true);
      gamesView.setDisabled(false);
      statsbutton.setDisabled(false);
      addorremoveteamsbutton.setDisabled(false);
      
      runOffseasonButton.setDisabled(false);
      backButton.setDisabled(false);
      gameStatsButton.show();
      nextGameButton.show();
    }
    speedtrack++}, 1000);
    pauseButton.show();
    playButton.show();
    playballbutton.hide();
  return run;
});

const pauseButton = new QPushButton();

let pauseMap = new QPixmap();
pauseMap.load(pause);
let pauseIm = new QIcon(pauseMap);
pauseButton.setIcon(pauseIm);
pauseButton.addEventListener("released", () => {
  
  clearInterval(run);
})

pauseButton.hide();

const playButton = new QPushButton();

let playMap = new QPixmap();
playMap.load(play);
let playIm = new QIcon(playMap);
playButton.setIcon(playIm);
playButton.addEventListener("released", () => {
  let wrtext = wrctext;
  if (rscheck == true) {
    wrtext = `RS Week ${wrtext}`;
  } else if (pocheck == true) {
    wrtext = `PO Round ${wrtext}`;
  }
  let action = gameTextSplitter(hometeamlabel.text(), awayteamlabel.text(), season, selectedLeague, wrtext);
  clearInterval(run);
  run = setInterval(() => {
    fifthaction.setText(fourthaction.text());
    fifthaction.repaint();
    fourthaction.setText(thirdaction.text());
    fourthaction.repaint();
    thirdaction.setText(lastaction.text());
    thirdaction.repaint();
    lastaction.setText(currentaction.text());
    lastaction.repaint();
    currentaction.setText(action![speedtrack]);
    currentaction.repaint();
    if (currentaction.text() == "One point scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 1;
      console.log(newscore);
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Two points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 2;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Five points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 5;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Three points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 3;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    }let firstEx = new RegExp(/first safely/);
    let secondEx = new RegExp(/second safely/);
    let thirdEx = new RegExp(/third safely/);
    let homeEx = new RegExp(/home safely/);
    let staysfirst = new RegExp(/stays (on|at) first/);
    let stayssecond = new RegExp(/stays on second/);
    let staysthird = new RegExp(/stays on third/);
    let tacklebeforesecondEx = new RegExp(/before he reaches second/);
    let tacklebeforethirdEx = new RegExp(/before he reaches third/);
    let tacklebeforehomeEx = new RegExp(/before he reaches home/);
    let slamEx = new RegExp(/SLAM/);
    let strikesEx = new RegExp(/Strike!|Swing and a miss!/);
    let ballsEx = new RegExp(/Ball\./);
    let foulsEx = new RegExp(/Foul ball!/);
    let outsEx = new RegExp(/OUT/);
    let strikeoutEx = new RegExp(/That last strike/);
    let balloutEx = new RegExp(/That's the fourth ball/);
    let fouloutEx = new RegExp(/That's four foul balls/);
    let endgameEx = new RegExp(/broadcast/);
    if (currentaction.text().match(strikesEx) !== null) {
      let newval = Number(instrikescount.text()) + 1;
      instrikescount.setText(newval);
      instrikescount.repaint();
    }
    if (currentaction.text().match(ballsEx) !== null) {
      let newval = Number(inballscount.text()) + 1;
      inballscount.setText(newval);
      inballscount.repaint();
    }
    if (currentaction.text().match(foulsEx) !== null) {
      let newval = Number(infoulscount.text()) + 1;
      infoulscount.setText(newval);
      infoulscount.repaint();
    }
    if (currentaction.text().match(outsEx) !== null) {
      let newval = Number(inoutscount.text()) + 1;
      inoutscount.setText(newval);
      inoutscount.repaint();
    }
    if (currentaction.text().match(strikeoutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(balloutEx) !== null) {
      inballscount.setText("0");
      inballscount.repaint();
    }
    if (currentaction.text().match(fouloutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(tacklebeforesecondEx) !== null) {
      if (basestrack.firstn == false) {
      basestrack.first = false;
      } else {
        basestrack.firstn = false;
      }
    }
    if (currentaction.text().match(tacklebeforethirdEx) !== null) {
      if (basestrack.secondn == false) {
      basestrack.second = false;
      } else {
        basestrack.secondn = false;
      }
    }
    if (currentaction.text().match(tacklebeforehomeEx) !== null) {
      if (basestrack.thirdn == false) {
      basestrack.third = false;
      } else {
        basestrack.thirdn = false;
      }
    }
    if (currentaction.text().match(firstEx) !== null) {
      basestrack.firstn = true;
    }
    if (currentaction.text().match(secondEx) !== null) {
      basestrack.secondn = true;
      if (basestrack.first == true && basestrack.firstn == false) {
        basestrack.first = false;
      }
    }
    if (currentaction.text().match(thirdEx) !== null) {
      basestrack.thirdn = true;
      if (basestrack.second == true && basestrack.secondn == false) {
        basestrack.second = false;
      }
    }
    if (currentaction.text().match(homeEx) !== null) {
      basestrack.home = true;
      if (basestrack.third == true && basestrack.thirdn == false) {
        basestrack.third = false;
      }
    }
    if (basestrack.firstn == true) {
      basestrack.first = true;
      basestrack.firstn = false;
    }
    if (basestrack.secondn == true) {
      basestrack.second = true;
      basestrack.secondn = false;
    }
    if (basestrack.thirdn == true) {
      basestrack.third = true;
      basestrack.thirdn = false;
    }
    if (currentaction.text().match(staysfirst) !== null) {
      basestrack.first = true;
    }
    if (currentaction.text().match(stayssecond) !== null) {
      basestrack.second = true;
    }
    if (currentaction.text().match(staysthird) !== null) {
      basestrack.third = true;
    }
    if (basestrack.first == true && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(manonfirstp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonfirstpandsecond);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(basesloadedp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonsecondp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(manonsecondpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonthirdp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonfirstpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(basesempty);
      baselabel.repaint();
    }
    if (currentaction.text().match(slamEx) !== null) {
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
    }
    let finscoreaway = (Number(top1.text()) + Number(top2.text()) + Number(top3.text()) + Number(top4.text()) + Number(top5.text()) + Number(top6.text()));
    awayfinal.setText(finscoreaway);
    awayfinal.repaint();
    let finscorehome = (Number(bottom1.text()) + Number(bottom2.text()) + Number(bottom3.text()) + Number(bottom4.text()) + Number(bottom5.text()) + Number(bottom6.text()));
    homefinal.setText(finscorehome);
    homefinal.repaint();
    let endinningEx = new RegExp(/home: .+, away: .+/);
    if (currentaction.text() !== null) {
    if (currentaction.text().match(endinningEx)! !== null) {
      instrikescount.setText("0");
      inballscount.setText("0");
      infoulscount.setText("0");
      inoutscount.setText("0");
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
      boxscorearr[currentinning].setInlineStyle("background-color: grey;");
      currentinning++;
    }
    }
    if (currentaction.text().match(endgameEx) !== null) {
      clearInterval(run);
      playButton.setDisabled(true);
      pauseButton.setDisabled(true);
      playballbutton.setDisabled(true);
      timingSlider.setDisabled(true);
      gamesView.setDisabled(false);
      statsbutton.setDisabled(false);
      addorremoveteamsbutton.setDisabled(false);
      
      runOffseasonButton.setDisabled(false);
      backButton.setDisabled(false);
      gameStatsButton.show();
      nextGameButton.show();
    }
    speedtrack++}, 1000);
    return run;
})

playButton.hide();

const pauseplay = new QWidget();
pauseplay.setObjectName("pauseplay");
const pauseplayLayout = new FlexLayout();
pauseplay.setLayout(pauseplayLayout);
pauseplay.setInlineStyle("flex-direction: 'row'; justify-content: 'space-around'; align-items: 'center';");
const nextTextButton = new QPushButton();

nextTextButton.setObjectName('nextTextButton');
let nextMap = new QPixmap();
nextMap.load(nextpbp);
let nextpbpIco = new QIcon(nextMap);
nextTextButton.setIcon(nextpbpIco);
nextTextButton.addEventListener("released", () => {
  let wrtext = wrctext;
  if (rscheck == true) {
    wrtext = `RS Week ${wrtext}`;
  } else if (pocheck == true) {
    wrtext = `PO Round ${wrtext}`;
  }
  let action = gameTextSplitter(hometeamlabel.text(), awayteamlabel.text(), season, selectedLeague, wrtext);
  clearInterval(run);
  fifthaction.setText(fourthaction.text());
    fifthaction.repaint();
    fourthaction.setText(thirdaction.text());
    fourthaction.repaint();
    thirdaction.setText(lastaction.text());
    thirdaction.repaint();
    lastaction.setText(currentaction.text());
    lastaction.repaint();
    currentaction.setText(action![speedtrack]);
    currentaction.repaint();
    if (currentaction.text() == "One point scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 1;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Two points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 2;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Five points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 5;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    } else if (currentaction.text() == "Three points scored!") {
      let newscore = Number(boxscorearr[currentinning].text()) + 3;
      boxscorearr[currentinning].setText(newscore);
      boxscorearr[currentinning].repaint();
    }let firstEx = new RegExp(/first safely/);
    let secondEx = new RegExp(/second safely/);
    let thirdEx = new RegExp(/third safely/);
    let homeEx = new RegExp(/home safely/);
    let staysfirst = new RegExp(/stays (on|at) first/);
    let stayssecond = new RegExp(/stays on second/);
    let staysthird = new RegExp(/stays on third/);
    let tacklebeforesecondEx = new RegExp(/before he reaches second/);
    let tacklebeforethirdEx = new RegExp(/before he reaches third/);
    let tacklebeforehomeEx = new RegExp(/before he reaches home/);
    let slamEx = new RegExp(/SLAM/);
    let strikesEx = new RegExp(/Strike!|Swing and a miss!/);
    let ballsEx = new RegExp(/Ball\./);
    let foulsEx = new RegExp(/Foul ball!/);
    let outsEx = new RegExp(/OUT/);
    let strikeoutEx = new RegExp(/That last strike/);
    let balloutEx = new RegExp(/That's the fourth ball/);
    let fouloutEx = new RegExp(/That's four foul balls/);
    let endgameEx = new RegExp(/broadcast/);
    if (currentaction.text().match(strikesEx) !== null) {
      let newval = Number(instrikescount.text()) + 1;
      instrikescount.setText(newval);
      instrikescount.repaint();
    }
    if (currentaction.text().match(ballsEx) !== null) {
      let newval = Number(inballscount.text()) + 1;
      inballscount.setText(newval);
      inballscount.repaint();
    }
    if (currentaction.text().match(foulsEx) !== null) {
      let newval = Number(infoulscount.text()) + 1;
      infoulscount.setText(newval);
      infoulscount.repaint();
    }
    if (currentaction.text().match(outsEx) !== null) {
      let newval = Number(inoutscount.text()) + 1;
      inoutscount.setText(newval);
      inoutscount.repaint();
    }
    if (currentaction.text().match(strikeoutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(balloutEx) !== null) {
      inballscount.setText("0");
      inballscount.repaint();
    }
    if (currentaction.text().match(fouloutEx) !== null) {
      instrikescount.setText("0");
      instrikescount.repaint();
      infoulscount.setText("0");
      infoulscount.repaint();
    }
    if (currentaction.text().match(tacklebeforesecondEx) !== null) {
      if (basestrack.firstn == false) {
      basestrack.first = false;
      } else {
        basestrack.firstn = false;
      }
    }
    if (currentaction.text().match(tacklebeforethirdEx) !== null) {
      if (basestrack.secondn == false) {
      basestrack.second = false;
      } else {
        basestrack.secondn = false;
      }
    }
    if (currentaction.text().match(tacklebeforehomeEx) !== null) {
      if (basestrack.thirdn == false) {
      basestrack.third = false;
      } else {
        basestrack.thirdn = false;
      }
    }
    if (currentaction.text().match(firstEx) !== null) {
      basestrack.firstn = true;
    }
    if (currentaction.text().match(secondEx) !== null) {
      basestrack.secondn = true;
      if (basestrack.first == true && basestrack.firstn == false) {
        basestrack.first = false;
      }
    }
    if (currentaction.text().match(thirdEx) !== null) {
      basestrack.thirdn = true;
      if (basestrack.second == true && basestrack.secondn == false) {
        basestrack.second = false;
      }
    }
    if (currentaction.text().match(homeEx) !== null) {
      basestrack.home = true;
      if (basestrack.third == true && basestrack.thirdn == false) {
        basestrack.third = false;
      }
    }
    if (basestrack.firstn == true) {
      basestrack.first = true;
      basestrack.firstn = false;
    }
    if (basestrack.secondn == true) {
      basestrack.second = true;
      basestrack.secondn = false;
    }
    if (basestrack.thirdn == true) {
      basestrack.third = true;
      basestrack.thirdn = false;
    }
    if (currentaction.text().match(staysfirst) !== null) {
      basestrack.first = true;
    }
    if (currentaction.text().match(stayssecond) !== null) {
      basestrack.second = true;
    }
    if (currentaction.text().match(staysthird) !== null) {
      basestrack.third = true;
    }
    if (basestrack.first == true && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(manonfirstp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonfirstpandsecond);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(basesloadedp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == false) {
      baselabel.setPixmap(manonsecondp);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == true && basestrack.third == true) {
      baselabel.setPixmap(manonsecondpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonthirdp);
      baselabel.repaint();
    } else if (basestrack.first == true && basestrack.second == false && basestrack.third == true) {
      baselabel.setPixmap(manonfirstpandthird);
      baselabel.repaint();
    } else if (basestrack.first == false && basestrack.second == false && basestrack.third == false) {
      baselabel.setPixmap(basesempty);
      baselabel.repaint();
    }
    if (currentaction.text().match(slamEx) !== null) {
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
    }
    let finscoreaway = (Number(top1.text()) + Number(top2.text()) + Number(top3.text()) + Number(top4.text()) + Number(top5.text()) + Number(top6.text()));
    awayfinal.setText(finscoreaway);
    awayfinal.repaint();
    let finscorehome = (Number(bottom1.text()) + Number(bottom2.text()) + Number(bottom3.text()) + Number(bottom4.text()) + Number(bottom5.text()) + Number(bottom6.text()));
    homefinal.setText(finscorehome);
    homefinal.repaint();
    let endinningEx = new RegExp(/home: .+, away: .+/);
    if (currentaction.text() !== null) {
    if (currentaction.text().match(endinningEx)! !== null) {
      instrikescount.setText("0");
      inballscount.setText("0");
      infoulscount.setText("0");
      inoutscount.setText("0");
      basestrack.first = false;
      basestrack.firstn = false;
      basestrack.second = false;
      basestrack.secondn = false;
      basestrack.third = false;
      basestrack.thirdn = false;
      basestrack.home = false;
      if (boxscorearr[currentinning] !== undefined) {
      boxscorearr[currentinning].setInlineStyle("background-color: grey;");
      }
      currentinning++;
    }
    }
    if (currentaction.text().match(endgameEx) !== null) {
      clearInterval(run);
      currentinning = 0;
      playButton.setDisabled(true);
      pauseButton.setDisabled(true);
      playballbutton.setDisabled(true);
      timingSlider.setDisabled(true);
      gamesView.setDisabled(false);
      statsbutton.setDisabled(false);
      addorremoveteamsbutton.setDisabled(false);
      
      runOffseasonButton.setDisabled(false);
      backButton.setDisabled(false);
      gameStatsButton.show();
      nextGameButton.show();
    }
    speedtrack++;
})

pauseplayLayout.addWidget(pauseButton);
pauseplayLayout.addWidget(nextTextButton);
pauseplayLayout.addWidget(playButton);

const watchGameText = new QWidget();
watchGameText.setObjectName("watchGameText");
const watchGameTextLayout = new FlexLayout();
watchGameText.setLayout(watchGameTextLayout);



watchGameTextLayout.addWidget(fifthaction);
watchGameTextLayout.addWidget(fourthaction);
watchGameTextLayout.addWidget(thirdaction);
watchGameTextLayout.addWidget(lastaction);
watchGameTextLayout.addWidget(currentaction);


let basesempty = new QPixmap();
basesempty.load(field);
let manonfirstp = new QPixmap();
manonfirstp.load(manonfirst);
let manonsecondp = new QPixmap();
manonsecondp.load(manonsecond);
let manonthirdp = new QPixmap();
manonthirdp.load(manonthird);
let manonfirstpandsecond = new QPixmap();
manonfirstpandsecond.load(manonfirstandsecond);
let manonfirstpandthird = new QPixmap();
manonfirstpandthird.load(manonfirstandthird);
let manonsecondpandthird = new QPixmap();
manonsecondpandthird.load(manonsecondandthird);
let basesloadedp = new QPixmap();
basesloadedp.load(basesloaded);
let baselabel = new QLabel();
baselabel.setPixmap(basesempty);



let fieldDisplay = new QWidget();
fieldDisplay.setFixedWidth(340);
fieldDisplay.setFixedHeight(270);
let fielddisplayLayout = new FlexLayout();
fieldDisplay.setLayout(fielddisplayLayout);
fieldDisplay.addEventListener(WidgetEventTypes.Paint, () => {

});

const inningStats = new QWidget();
inningStats.setObjectName("inningStats");
inningStats.setInlineStyle('flex-direction: row;');
const inningStatsLayout = new FlexLayout();
inningStats.setLayout(inningStatsLayout);

const instrikes = new QLabel();
instrikes.setText("strikes:");
let instrikescount = new QLabel();
instrikescount.setText("0");
instrikescount.setInlineStyle('width: 20');

const inballs = new QLabel();
inballs.setText("balls:");
let inballscount = new QLabel();
inballscount.setText("0");
inballscount.setInlineStyle('width: 20');

const infouls = new QLabel();
infouls.setText("fouls:");
let infoulscount = new QLabel();
infoulscount.setText("0");
infoulscount.setInlineStyle('width: 20');

const inouts = new QLabel();
inouts.setText("outs:")
let inoutscount = new QLabel();
inoutscount.setText("0");
inoutscount.setInlineStyle('width: 20');

inningStatsLayout.addWidget(instrikes);
inningStatsLayout.addWidget(instrikescount);
inningStatsLayout.addWidget(inballs);
inningStatsLayout.addWidget(inballscount);
inningStatsLayout.addWidget(infouls);
inningStatsLayout.addWidget(infoulscount);
inningStatsLayout.addWidget(inouts);
inningStatsLayout.addWidget(inoutscount);

const wgBBmiddle = new QWidget();
wgBBmiddle.setObjectName("wgBBmiddle");
const wgBBmiddleLayout = new FlexLayout();
wgBBmiddle.setLayout(wgBBmiddleLayout);

wgBBmiddleLayout.addWidget(inningStats);
wgBBmiddleLayout.addWidget(fieldDisplay);

wgBBmiddle.setInlineStyle("flex-direction: column;");

let wgteamhome = new QLabel();
wgteamhome.setObjectName("wgteamhome");

let wgroster1h = new QLabel();
let wgroster2h = new QLabel();
let wgroster3h = new QLabel();
let wgroster4h = new QLabel();
let wgroster5h = new QLabel();
let wgroster6h = new QLabel();

let hros1ovr = new QLabel();
hros1ovr.setFixedWidth(20);
hros1ovr.setInlineStyle("text-align: 'left';");
let hros2ovr = new QLabel();
hros2ovr.setFixedWidth(20);
hros2ovr.setInlineStyle("text-align: 'left';");
let hros3ovr = new QLabel();
hros3ovr.setFixedWidth(20);
hros3ovr.setInlineStyle("text-align: 'left';");
let hros4ovr = new QLabel();
hros4ovr.setFixedWidth(20);
hros4ovr.setInlineStyle("text-align: 'left';");
let hros5ovr = new QLabel();
hros5ovr.setFixedWidth(20);
hros5ovr.setInlineStyle("text-align: 'left';");
let hros6ovr = new QLabel();
hros6ovr.setFixedWidth(20);
hros6ovr.setInlineStyle("text-align: 'left';");
let hometeamovrLabel = new QLabel();
hometeamovrLabel.setFixedWidth(20);
hometeamovrLabel.setInlineStyle("text-align: 'right';");

const wgHomeTeam = new QWidget();
wgHomeTeam.setInlineStyle("flex-direction: row;");
const wgHomeTeamLayout = new FlexLayout();
wgHomeTeam.setLayout(wgHomeTeamLayout);

wgHomeTeamLayout.addWidget(hometeamovrLabel);
wgHomeTeamLayout.addWidget(wgteamhome);

const hrosterFirst = new QWidget();
hrosterFirst.setInlineStyle("flex-direction: 'row';");
const hrosterFirstLayout = new FlexLayout();
hrosterFirst.setLayout(hrosterFirstLayout);

hrosterFirstLayout.addWidget(hros1ovr);
hrosterFirstLayout.addWidget(wgroster1h);

const hrosterSecond = new QWidget();
hrosterSecond.setInlineStyle("flex-direction: 'row';");
const hrosterSecondLayout = new FlexLayout();
hrosterSecond.setLayout(hrosterSecondLayout);

hrosterSecondLayout.addWidget(hros2ovr);
hrosterSecondLayout.addWidget(wgroster2h);

const hrosterThird = new QWidget();
hrosterThird.setInlineStyle("flex-direction: 'row';");
const hrosterThirdLayout = new FlexLayout();
hrosterThird.setLayout(hrosterThirdLayout);

hrosterThirdLayout.addWidget(hros3ovr);
hrosterThirdLayout.addWidget(wgroster3h);

const hrosterFourth = new QWidget();
hrosterFourth.setInlineStyle("flex-direction: 'row';");
const hrosterFourthLayout = new FlexLayout();
hrosterFourth.setLayout(hrosterFourthLayout);

hrosterFourthLayout.addWidget(hros4ovr);
hrosterFourthLayout.addWidget(wgroster4h);

const hrosterFifth = new QWidget();
hrosterFifth.setInlineStyle("flex-direction: 'row';");
const hrosterFifthLayout = new FlexLayout();
hrosterFifth.setLayout(hrosterFifthLayout);

hrosterFifthLayout.addWidget(hros5ovr);
hrosterFifthLayout.addWidget(wgroster5h);

const hrosterSixth = new QWidget();
hrosterSixth.setInlineStyle("flex-direction: 'row';");
const hrosterSixthLayout = new FlexLayout();
hrosterSixth.setLayout(hrosterSixthLayout);

hrosterSixthLayout.addWidget(hros6ovr);
hrosterSixthLayout.addWidget(wgroster6h);

const wgLeftBottom = new QWidget();
wgLeftBottom.setObjectName("wgLeftBottom");
const wgLeftBottomLayout = new FlexLayout();
wgLeftBottom.setLayout(wgLeftBottomLayout);
wgLeftBottom.setInlineStyle("flex-direction: 'column';");

wgLeftBottomLayout.addWidget(wgHomeTeam);
wgLeftBottomLayout.addWidget(hrosterFirst);
wgLeftBottomLayout.addWidget(hrosterSecond);
wgLeftBottomLayout.addWidget(hrosterThird);
wgLeftBottomLayout.addWidget(hrosterFourth);
wgLeftBottomLayout.addWidget(hrosterFifth);
wgLeftBottomLayout.addWidget(hrosterSixth);




let wgteamaway = new QLabel();
wgteamaway.setObjectName("wgteamaway");

let wgroster1a = new QLabel();
let wgroster2a = new QLabel();
let wgroster3a = new QLabel();
let wgroster4a = new QLabel();
let wgroster5a = new QLabel();
let wgroster6a = new QLabel();

let aros1ovr = new QLabel();
aros1ovr.setFixedWidth(20);
aros1ovr.setObjectName('awayrosterWG');
aros1ovr.setInlineStyle("text-align: 'right';");
let aros2ovr = new QLabel();
aros2ovr.setFixedWidth(20);
aros2ovr.setInlineStyle("text-align: 'right';");
let aros3ovr = new QLabel();
aros3ovr.setFixedWidth(20);
aros3ovr.setInlineStyle("text-align: 'right';");
let aros4ovr = new QLabel();
aros4ovr.setFixedWidth(20);
aros4ovr.setInlineStyle("text-align: 'right';");
let aros5ovr = new QLabel();
aros5ovr.setFixedWidth(20);
aros5ovr.setInlineStyle("text-align: 'right';");
let aros6ovr = new QLabel();
aros6ovr.setFixedWidth(20);
aros6ovr.setInlineStyle("text-align: 'right';");
let awayteamovrLabel = new QLabel();
awayteamovrLabel.setFixedWidth(20);
awayteamovrLabel.setInlineStyle("text-align: 'left';");

const wgAwayTeam = new QWidget();
wgAwayTeam.setInlineStyle("flex-direction: row;");
const wgAwayTeamLayout = new FlexLayout();
wgAwayTeam.setLayout(wgAwayTeamLayout);

wgAwayTeamLayout.addWidget(awayteamovrLabel);
wgAwayTeamLayout.addWidget(wgteamaway);


const arosterFirst = new QWidget();
arosterFirst.setInlineStyle("flex-direction: 'row';");
const arosterFirstLayout = new FlexLayout();
arosterFirst.setLayout(arosterFirstLayout);

arosterFirstLayout.addWidget(aros1ovr);
arosterFirstLayout.addWidget(wgroster1a);


const arosterSecond = new QWidget();
arosterSecond.setInlineStyle("flex-direction: 'row';");
const arosterSecondLayout = new FlexLayout();
arosterSecond.setLayout(arosterSecondLayout);

arosterSecondLayout.addWidget(aros2ovr);
arosterSecondLayout.addWidget(wgroster2a);


const arosterThird = new QWidget();
arosterThird.setInlineStyle("flex-direction: 'row';");
const arosterThirdLayout = new FlexLayout();
arosterThird.setLayout(arosterThirdLayout);

arosterThirdLayout.addWidget(aros3ovr);
arosterThirdLayout.addWidget(wgroster3a);

const arosterFourth = new QWidget();
arosterFourth.setInlineStyle("flex-direction: 'row';");
const arosterFourthLayout = new FlexLayout();
arosterFourth.setLayout(arosterFourthLayout);

arosterFourthLayout.addWidget(aros4ovr);
arosterFourthLayout.addWidget(wgroster4a);


const arosterFifth = new QWidget();
arosterFifth.setInlineStyle("flex-direction: 'row';");
const arosterFifthLayout = new FlexLayout();
arosterFifth.setLayout(arosterFifthLayout);

arosterFifthLayout.addWidget(aros5ovr);
arosterFifthLayout.addWidget(wgroster5a);

const arosterSixth = new QWidget();
arosterSixth.setInlineStyle("flex-direction: 'row';");
const arosterSixthLayout = new FlexLayout();
arosterSixth.setLayout(arosterSixthLayout);

arosterSixthLayout.addWidget(aros6ovr);
arosterSixthLayout.addWidget(wgroster6a);


const wgRightBottom = new QWidget();
wgRightBottom.setObjectName("wgRightBottom");
const wgRightBottomLayout = new FlexLayout();
wgRightBottom.setLayout(wgRightBottomLayout);
wgRightBottom.setInlineStyle("flex-direction: 'column';");

wgRightBottomLayout.addWidget(wgAwayTeam);
wgRightBottomLayout.addWidget(arosterFirst);
wgRightBottomLayout.addWidget(arosterSecond);
wgRightBottomLayout.addWidget(arosterThird);
wgRightBottomLayout.addWidget(arosterFourth);
wgRightBottomLayout.addWidget(arosterFifth);
wgRightBottomLayout.addWidget(arosterSixth);




const watchGameBottomBar = new QWidget();
watchGameBottomBar.setObjectName("watchgGameBottomBar");
const watchGameBottomBarLayout = new FlexLayout();
watchGameBottomBar.setLayout(watchGameBottomBarLayout);


watchGameBottomBarLayout.addWidget(wgLeftBottom);
watchGameBottomBarLayout.addWidget(wgBBmiddle);
watchGameBottomBarLayout.addWidget(wgRightBottom);

watchGameBottomBar.setInlineStyle('flex-direction: row; justify-content: space-between');

const pbWidg = new QWidget();
pbWidg.setObjectName("pbWidg");
const pbWidgLayout = new FlexLayout();
pbWidg.setLayout(pbWidgLayout);
pbWidgLayout.addWidget(playballbutton);

const sliderWidg = new QWidget();
sliderWidg.setObjectName("sliderWidg");
const sliderWidgLayout = new FlexLayout();
sliderWidg.setLayout(sliderWidgLayout);
sliderWidgLayout.addWidget(timingSlider);


const playpauseWidg = new QWidget();
playpauseWidg.setObjectName("playpauseWidg");
const playpauseWidgLayout = new FlexLayout();
playpauseWidg.setLayout(playpauseWidgLayout);
playpauseWidgLayout.addWidget(pauseplay);


const wgMiddleBar = new QWidget();
wgMiddleBar.setObjectName("wgMiddleBar");
const wgMiddleBarLayout = new FlexLayout();
wgMiddleBar.setLayout(wgMiddleBarLayout);

wgMiddleBarLayout.addWidget(pbWidg);
wgMiddleBarLayout.addWidget(sliderWidg);
wgMiddleBarLayout.addWidget(playpauseWidg);

const gamestatsscreen = new QWidget();
gamestatsscreen.setObjectName('gamestatsscreen');
const gamestatsscreenLayout = new FlexLayout();
gamestatsscreen.setLayout(gamestatsscreenLayout);

let awaystatslabel = new QLabel();
awaystatslabel.setObjectName('awaystatslabel');

let homestatslabel = new QLabel();
homestatslabel.setObjectName('homestatslabel');

let awaystatstree = new QTreeWidget();
let homestatstree = new QTreeWidget();

let statstreeheaders: any[] = ["Name", "Points Scored", "Assists", "Assist Points", "Broken Tackles", "Balls Fielded (OFF)", "Blocks", "Turnovers", "Pitches",
"Strikes", "Balls", "Fouls", "Strikeouts Pitching", "Ballouts", "Slams Given", "At-Bats", "Hits", "Slams", "Hits to Out", "Hits to Offense",
"Foulouts", "Strikeouts Batting",`Tackles`, "Blocks Shed", "Interceptions", "Balls Fielded (DEF)", "Total Outs Recorded"];

let recordFiles: any[] = ["Points Scored", "Assists", "Assist Points", "Broken Tackles", "Balls Fielded (OFF)", "Blocks", "Turnovers", "Pitches",
"Strikes", "Balls", "Fouls", "Strikeouts Pitching", "Ballouts", "Slams Given", "At-Bats", "Hits", "Slams", "Hits to Out", "Hits to Offense",
"Foulouts", "Strikeouts Batting", "Tackles", "Blocks Shed", "Interceptions", "Balls Fielded (DEF)", "Total Outs Recorded"];
awaystatstree.setHeaderLabels(statstreeheaders);
homestatstree.setHeaderLabels(statstreeheaders);
gamestatsscreenLayout.addWidget(awaystatslabel);
gamestatsscreenLayout.addWidget(awaystatstree);
gamestatsscreenLayout.addWidget(homestatslabel);
gamestatsscreenLayout.addWidget(homestatstree);

const underBoxBar = new QWidget()
underBoxBar.setObjectName('underBoxBar');
const underBoxBarLayout = new FlexLayout();
underBoxBar.setLayout(underBoxBarLayout);

const gameStatsButton = new QPushButton();

gameStatsButton.setObjectName('gameStatsButton');
gameStatsButton.setText('Stats');
gameStatsButton.addEventListener("released", () => {
  
  awaystatslabel.setText(awayteamlabel.text().toUpperCase());
  homestatslabel.setText(hometeamlabel.text().toUpperCase());
  let awayteamst: any = teamToObject(awaystatslabel.text());
  let hometeam: any = teamToObject(homestatslabel.text());
if (  awaystatstree !== null) {
    awaystatstree.clear();
};
  for (let h=0;h<awayteamst.roster.length;h++) {
    let player = awayteamst.roster[h].name;
    let stats = watchgamestats[player];
    let item = new QTreeWidgetItem();
    item.setText(0, player);
    if (stats.pointsScored > 0) {
      item.setData(1, 0, stats.pointsScored);
    } else {
      item.setText(1, "0");
    }
    if (stats.assists > 0) {
      item.setData(2, 0, stats.assists);
    } else {
      item.setText(2, "0");
    }
    if (stats.assistpoints > 0) {
      item.setData(3, 0, stats.assistpoints);
    } else {
      item.setText(3, "0");
    }
    if (stats.brokentackles > 0) {
      item.setData(4, 0, stats.brokentackles);
    } else {
      item.setText(4, "0");
    }
    if (stats.ballsfieldedoff > 0) {
      item.setData(5, 0, stats.ballsfieldedoff);
    } else {
      item.setText(5, "0");
    }
    if (stats.blocks > 0) {
      item.setData(6, 0, stats.blocks);
    } else {
      item.setText(6, "0");
    }
    if (stats.turnovers > 0) {
      item.setData(7, 0, stats.turnovers);
    } else {
      item.setText(7, "0");
    }
    if (stats.pitches > 0) {
      item.setData(8, 0, stats.pitches);
    } else {
      item.setText(8, "0");
    }
    if (stats.strikes > 0) {
      item.setData(9, 0, stats.strikes);
    } else {
      item.setText(9, "0");
    }
    if (stats.balls > 0) {
      item.setData(10, 0, stats.balls);
    } else {
      item.setText(10, "0");
    }
    if (stats.fouls > 0) {
      item.setData(11, 0, stats.fouls);
    } else {
      item.setText(11, "0");
    }
    if (stats.strikeoutspitching > 0) {
      item.setData(12, 0, stats.strikeoutspitching);
    } else {
      item.setText(12, "0");
    }
    if (stats.ballouts > 0) {
      item.setData(13, 0, stats.ballouts);
    } else {
      item.setText(13, "0");
    }
    if (stats.slamsgiven > 0) {
      item.setData(14, 0, stats.slamsgiven);
    } else {
      item.setText(14, "0");
    }
    if (stats.atbats > 0) {
      item.setData(15, 0, stats.atbats);
    } else {
      item.setText(15, "0");
    }
    if (stats.hits > 0) {
      item.setData(16, 0, stats.hits);
    } else {
      item.setText(16, "0");
    }
    if (stats.slams > 0) {
      item.setData(17, 0, stats.slams);
    } else {
      item.setText(17, "0");
    }
    if (stats.hitstoout > 0) {
      item.setData(18, 0, stats.hitstoout);
    } else {
      item.setText(18, "0");
    }
    if (stats.hitstooffense > 0) {
      item.setData(19, 0, stats.hitstooffense);
    } else {
      item.setText(19, "0");
    }
    if (stats.foulouts > 0) {
      item.setData(20, 0, stats.foulouts);
    } else {
      item.setText(20, "0");
    }
    if (stats.strikeoutsbatting > 0) {
      item.setData(21, 0, stats.strikeoutsbatting);
    } else {
      item.setText(21, "0");
    }
    if (stats.tackles > 0) {
      item.setData(22, 0, stats.tackles);
    } else {
      item.setText(22, "0");
    }
    if (stats.blocksshed > 0) {
      item.setData(23, 0, stats.blocksshed);
    } else {
      item.setText(23, "0");
    }
    if (stats.interceptions > 0) {
      item.setData(24, 0, stats.interceptions);
    } else {
      item.setText(24, "0");
    }
    if (stats.ballsfieldeddef > 0) {
      item.setData(25, 0, stats.ballsfieldeddef);
    } else {
      item.setText(25, "0");
    }
    if (stats.totaloutsrecorded > 0) {
      item.setData(26, 0, stats.totaloutsrecorded);
    } else {
      item.setText(26, "0");
    }
    awaystatstree.addTopLevelItem(item);
  }
if (  homestatstree !== null) {
    homestatstree.clear();
};
  for (let h=0;h<hometeam.roster.length;h++) {
    let player = hometeam.roster[h].name;
    let stats = watchgamestats[player];
    let item = new QTreeWidgetItem();
    item.setText(0, player);
    if (stats.pointsScored > 0) {
      item.setData(1, 0, stats.pointsScored);
    } else {
      item.setText(1, "0");
    }
    if (stats.assists > 0) {
      item.setData(2, 0, stats.assists);
    } else {
      item.setText(2, "0");
    }
    if (stats.assistpoints > 0) {
      item.setData(3, 0, stats.assistpoints);
    } else {
      item.setText(3, "0");
    }
    if (stats.brokentackles > 0) {
      item.setData(4, 0, stats.brokentackles);
    } else {
      item.setText(4, "0");
    }
    if (stats.ballsfieldedoff > 0) {
      item.setData(5, 0, stats.ballsfieldedoff);
    } else {
      item.setText(5, "0");
    }
    if (stats.blocks > 0) {
      item.setData(6, 0, stats.blocks);
    } else {
      item.setText(6, "0");
    }
    if (stats.turnovers > 0) {
      item.setData(7, 0, stats.turnovers);
    } else {
      item.setText(7, "0");
    }
    if (stats.pitches > 0) {
      item.setData(8, 0, stats.pitches);
    } else {
      item.setText(8, "0");
    }
    if (stats.strikes > 0) {
      item.setData(9, 0, stats.strikes);
    } else {
      item.setText(9, "0");
    }
    if (stats.balls > 0) {
      item.setData(10, 0, stats.balls);
    } else {
      item.setText(10, "0");
    }
    if (stats.fouls > 0) {
      item.setData(11, 0, stats.fouls);
    } else {
      item.setText(11, "0");
    }
    if (stats.strikeoutspitching > 0) {
      item.setData(12, 0, stats.strikeoutspitching);
    } else {
      item.setText(12, "0");
    }
    if (stats.ballouts > 0) {
      item.setData(13, 0, stats.ballouts);
    } else {
      item.setText(13, "0");
    }
    if (stats.slamsgiven > 0) {
      item.setData(14, 0, stats.slamsgiven);
    } else {
      item.setText(14, "0");
    }
    if (stats.atbats > 0) {
      item.setData(15, 0, stats.atbats);
    } else {
      item.setText(15, "0");
    }
    if (stats.hits > 0) {
      item.setData(16, 0, stats.hits);
    } else {
      item.setText(16, "0");
    }
    if (stats.slams > 0) {
      item.setData(17, 0, stats.slams);
    } else {
      item.setText(17, "0");
    }
    if (stats.hitstoout > 0) {
      item.setData(18, 0, stats.hitstoout);
    } else {
      item.setText(18, "0");
    }
    if (stats.hitstooffense > 0) {
      item.setData(19, 0, stats.hitstooffense);
    } else {
      item.setText(19, "0");
    }
    if (stats.foulouts > 0) {
      item.setData(20, 0, stats.foulouts);
    } else {
      item.setText(20, "0");
    }
    if (stats.strikeoutsbatting > 0) {
      item.setData(21, 0, stats.strikeoutsbatting);
    } else {
      item.setText(21, "0");
    }
    if (stats.tackles > 0) {
      item.setData(22, 0, stats.tackles);
    } else {
      item.setText(22, "0");
    }
    if (stats.blocksshed > 0) {
      item.setData(23, 0, stats.blocksshed);
    } else {
      item.setText(23, "0");
    }
    if (stats.interceptions > 0) {
      item.setData(24, 0, stats.interceptions);
    } else {
      item.setText(24, "0");
    }
    if (stats.ballsfieldeddef > 0) {
      item.setData(25, 0, stats.ballsfieldeddef);
    } else {
      item.setText(25, "0");
    }
    if (stats.totaloutsrecorded > 0) {
      item.setData(26, 0, stats.totaloutsrecorded);
    } else {
      item.setText(26, "0");
    }
    homestatstree.addTopLevelItem(item);
  }
  stacked.setCurrentWidget(gamestatsscreen);
});
gameStatsButton.hide();

const nextGameButton = new QPushButton();

nextGameButton.setObjectName('nextGameButton');
nextGameButton.setText('Next Game');
nextGameButton.addEventListener("released", () => {
  
  stacked.setCurrentWidget(gamestowatchscreen);
})
nextGameButton.hide();


underBoxBarLayout.addWidget(gameStatsButton);
underBoxBarLayout.addWidget(nextGameButton);

const watchGameTopBar = new QWidget();
watchGameTopBar.setObjectName('watchGameTopBar');
const watchGameTopBarLayout = new FlexLayout();
watchGameTopBar.setLayout(watchGameTopBarLayout);
watchGameTopBar.setInlineStyle('flex-direction: column; align-items: flex-start; align-self: stretch;');

watchGameTopBarLayout.addWidget(boxscore);
watchGameTopBarLayout.addWidget(underBoxBar);

fielddisplayLayout.addWidget(baselabel);
watchGameLayout.addWidget(watchGameTopBar);
watchGameLayout.addWidget(watchGameText);
watchGameLayout.addWidget(wgMiddleBar);
watchGameLayout.addWidget(watchGameBottomBar);

stacked.addWidget(blankView);
stacked.addWidget(watchGame);
stacked.addWidget(gamestatsscreen);
stacked.addWidget(schedView);
stacked.addWidget(stats);
stacked.addWidget(statsSelect);
stacked.addWidget(sportPhase);
stacked.addWidget(teamview);
stacked.addWidget(playerview);
stacked.addWidget(teamStatsView);
stacked.addWidget(recordsMenuLeagues);
stacked.addWidget(recordTypesMenu);
stacked.addWidget(recordsScroll);


const fileDialog = new QFileDialog();
fileDialog.setFileMode(FileMode.AnyFile);
fileDialog.setNameFilter('Spreadsheets (*.xlsx)');

let matchuparray: any[] = [];
let matchuparray2: any[] = [];
let scoresarray: any[] = [];
let week: any[] = [];
let checkboxes: any[] = [];
let weekscoresarray: any[] = [];

function sheetSelect() {
  matchuparray = [];
  matchuparray2 = [];
  scoresarray = [];
  week = [];
  checkboxes = [];
  fileDialog.exec();
  var string = fileDialog.selectedFiles()[0];
  const path = xlsx.parse(string);
  let file = path[0].data;
  let errors: any[] = [];
  for (let yu = 0; yu < file!.length; yu++) {
    if (file![yu].length > 0) {
  try {
      const filePath = `./dist/src/teams/${file![yu]}.txt`;
      fs.statSync(filePath);
  } catch (err) {
    errors.push(file![yu]);
  }
}
}
if (errors.length > 0) {
  const fatfingers = new QMessageBox;
  const okButton = new QPushButton;
  okButton.setText("Oops");
  fatfingers.addButton(okButton, ButtonRole.AcceptRole);
  let msgtext;
  for (let h=0;h<errors.length;h++) {
    if (msgtext == undefined) {
      msgtext = `${errors[h]}\n`
    } else {
      msgtext = msgtext + ` ${errors[h]}\n`;
    }
  }
  let disses: any[] = ["Bad fingers.", "Poorly done.", "Typing school lessons: $300", "Don't you type all day? Like, for work?", "Try again, but better.", "Try different letters next time, pal.", "So close, but so, so, so far.", "Clicking 'Oops' will immediately order a new pair of reading glasses.", "How Bremerton of you."];
  let randDiss = randInt(0,8);
  fatfingers.setText(`The following teams do not exist:\n\n ${msgtext} \n ${disses[randDiss]}`);
  fatfingers.exec();
  return;
}
  week = buildSchedule (file);
  for (let i=0;i<week.length;i++) {
    const checkbox = new QCheckBox();
    checkbox.setObjectName("checkbox");
    checkboxes.push(checkbox);
    const away = new QLabel();
    away.setText(`${week[i][0]}:`);
    away.setObjectName("away");
    const home = new QLabel();
    home.setObjectName("home");
    home.setText(`${week[i][1]}:`)
    let scoreboxaway = new QLabel();
    const scoreboxLayout = new FlexLayout();
    scoreboxaway.setLayout(scoreboxLayout);
    scoreboxaway.setObjectName("scorebox");
    let scoreboxhome = new QLabel();
    scoreboxhome.setLayout(scoreboxLayout);
    scoreboxhome.setObjectName("scorebox2");
    let scorray = [scoreboxaway, scoreboxhome];
    const matchup = new QWidget();
    matchup.setObjectName("matchup");
    const matchupLayout = new FlexLayout();
    matchup.setLayout(matchupLayout);
    matchupLayout.addWidget(checkbox);
    matchupLayout.addWidget(away);
    matchupLayout.addWidget(home);
    matchupLayout.addWidget(scoreboxaway);
    matchupLayout.addWidget(scoreboxhome);
    matchuparray2.push(matchup);
    scheduleLayout.addWidget(matchup);
    matchuparray.push(matchupLayout);
    scoresarray.push(scorray);
    stacked.setCurrentWidget(schedView);
  }
  }


const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);


const statsbutton = new QPushButton();

statsbutton.setText("Stats")
statsbutton.setObjectName("statsbutton")
statsbutton.addEventListener('clicked', () => {
    stacked.setCurrentWidget(statsSelect);
});

let gamestowatchButtons: any[] = [];
let allgameswatched: Boolean = false;
const schedulebutton = new QPushButton();

schedulebutton.setText("Load Schedule")
schedulebutton.setObjectName("loadschedule")
schedulebutton.addEventListener('clicked', () => {
  checkedgames = [];
  for (let gi=0;gi<gamestowatchButtons.length;gi++) {
    gamestowatchButtons[gi].deleteLater();
  }
  gamestowatchButtons = [];
  for (let yu=0;yu<matchuparray2.length;yu++) {
    matchuparray2[yu].delete();
  }
  allgameswatched = false;
  schedule.repaint();
  scheduleScroll.setWidget(schedule);
  leagueCheck.show();
  seasonPhaseCheck.show();
  stacked.setCurrentWidget(schedView);
  sheetSelect();
  watchgamesbutton.hide();
  rungamesbutton.show();});

let selectedLeague: string;
const premierCheck = new QRadioButton();
premierCheck.setText("Premier");
premierCheck.addEventListener("released", () => {
  
  selectedLeague = "Premier";
})
const transitionalCheck = new QRadioButton();
transitionalCheck.setText("Transitional");
transitionalCheck.addEventListener("released", () => {
  
  selectedLeague = "Transitional";
})
const middleCheck = new QRadioButton();
middleCheck.setText("Middle");
middleCheck.addEventListener("released", () => {
  
  selectedLeague = "Middle";
})
const entryCheck = new QRadioButton();
entryCheck.setText("Entry");
entryCheck.addEventListener("released", () => {
  
  selectedLeague = "Entry";
})

let rscheck: boolean = false;
let pocheck: boolean = false;
const regularSeasonCheck = new QRadioButton();
regularSeasonCheck.setText("Regular Season");
regularSeasonCheck.addEventListener("clicked", () => {
  rscheck = true;
  pocheck = false;
  weekroundCheck.setText("Enter week.");
})

const playoffsCheck = new QRadioButton();
playoffsCheck.setText("Playoffs");
playoffsCheck.addEventListener("clicked", () => {
  rscheck = false;
  pocheck = true;
  weekroundCheck.setText("Enter round.");
})

const leagueCheck = new QWidget();
leagueCheck.setObjectName("leagueCheck");
leagueCheck.setInlineStyle("flex-direction: 'row';");
const leagueCheckLayout = new FlexLayout();
leagueCheck.setLayout(leagueCheckLayout);

leagueCheckLayout.addWidget(premierCheck);
leagueCheckLayout.addWidget(transitionalCheck);
leagueCheckLayout.addWidget(middleCheck);
leagueCheckLayout.addWidget(entryCheck);

let wrctext: string = "";
const weekroundCheck = new QLineEdit();
weekroundCheck.addEventListener("textChanged", () => {
  wrctext = weekroundCheck.text();
})

const seasonPhaseCheck = new QWidget();
seasonPhaseCheck.setObjectName('seasonPhaseCheck');
seasonPhaseCheck.setInlineStyle("flex-direction: 'row';");
const seasonPhaseCheckLayout = new FlexLayout();
seasonPhaseCheck.setLayout(seasonPhaseCheckLayout);

seasonPhaseCheckLayout.addWidget(regularSeasonCheck);
seasonPhaseCheckLayout.addWidget(playoffsCheck);
seasonPhaseCheckLayout.addWidget(weekroundCheck);

seasonPhaseCheck.hide();

scheduleLayout.addWidget(leagueCheck);
scheduleLayout.addWidget(seasonPhaseCheck);
leagueCheck.hide();

scheduleTopBarLayout.addWidget(schedulebutton);

let checkedgames: any[] = [];
let weekstats: any[];
let rungamesbutton = new QPushButton();
rungamesbutton.setText("Run Games")
rungamesbutton.setObjectName("rungames")
rungamesbutton.addEventListener('clicked', () => {
let seasonPhase: string = "";
let leaguePhase: string = selectedLeague;
if (regularSeasonCheck.isChecked() == true) {
  seasonPhase = "Regular Season"
} else if (playoffsCheck.isChecked() == true) {
  seasonPhase = "Playoffs"
}
const noleagueChecked = new QMessageBox();
noleagueChecked.setText(`Season phase is set to ${seasonPhase}. Please select league.`);
const okLButton = new QPushButton();

okLButton.setText("Ok");
noleagueChecked.addButton(okLButton, ButtonRole.AcceptRole);
const nophaseChecked = new QMessageBox();
nophaseChecked.setText(`League is set to ${selectedLeague}s. Please select season phase.`);
const okPButton = new QPushButton();

okPButton.setText("Ok");
nophaseChecked.addButton(okPButton, ButtonRole.AcceptRole);
const noleaguenorphaseChecked = new QMessageBox();
noleaguenorphaseChecked.setText("Please select league and season phase.")
const okLPButton = new QPushButton()
okLPButton.setText("Ok");
noleaguenorphaseChecked.addButton(okLPButton, ButtonRole.AcceptRole);
const leaguephaseCheck = new QMessageBox();
leaguephaseCheck.setText(`League is set to ${selectedLeague}s. Season phase is set to ${seasonPhase}. Continue?`);
const yeahButton = new QPushButton();

yeahButton.setText("Yes.");
const nahButton = new QPushButton();

nahButton.setText("No.");
leaguephaseCheck.addButton(nahButton, ButtonRole.AcceptRole);
leaguephaseCheck.addButton(yeahButton, ButtonRole.RejectRole);
if (selectedLeague == undefined && regularSeasonCheck.isChecked() == false && playoffsCheck.isChecked() == false) {
  noleaguenorphaseChecked.exec();
  return;
} else if (selectedLeague == undefined && (regularSeasonCheck.isChecked() == true || playoffsCheck.isChecked() == true)) {
  noleagueChecked.exec();
  return;
} else if (selectedLeague !== undefined && (regularSeasonCheck.isChecked() == false && playoffsCheck.isChecked() == false)) {
  nophaseChecked.exec();
  return;
} else {
  leaguephaseCheck.exec();
}
if (leaguephaseCheck.result() === 1) {
let dir = `./dist/src/games history/${season}/${selectedLeague}`;
rungamesbutton.setText("Running...");
rungamesbutton.repaint();
for (let k=0;k<week.length;k++) {
  if (checkboxes[k].isChecked() == false) {
    try {
      let wrtext = weekroundCheck.text();
      if (regularSeasonCheck.isChecked() == true) {
        wrtext = `RS Week ${wrtext}`;
      } else if (playoffsCheck.isChecked() == true) {
        wrtext = `PO Round ${wrtext}`;
      }
let thisgame = gameRunner(teamToObject(week[k][1]), teamToObject(week[k][0]), dir, wrtext);
if (playoffsCheck.isChecked() == true) {
  updateTeamStats(thisgame[0].home, thisgame[0].away, thisgame[0].hometeam, thisgame[0].awayteam, season, true);
}
scoresarray[k][0].setText(thisgame[0].away);
scoresarray[k][1].setText(thisgame[0].home);
scoresarray[k][0].repaint();
scoresarray[k][1].repaint();
if (regularSeasonCheck.isChecked() == true) {
updateStats(thisgame[1], season);
updateTeamStats(thisgame[0].home, thisgame[0].away, thisgame[0].hometeam, thisgame[0].awayteam, season, false);
let recordEx = new RegExp(/.+ (\d+)/g);
let recordCheck = Object.keys(thisgame[1]);
let team1Ex = new RegExp(`${week[k][1]}`);
let team2Ex = new RegExp(`${week[k][0]}`);
let teamslist = fs.readFileSync(`./dist/src/records/${selectedLeague}/Teams.txt`, 'utf8');
if (teamslist.match(team1Ex) == null) {
  fs.writeFileSync(`./dist/src/records/${selectedLeague}/Teams.txt`, `${week[k][1]}\n`, {flag: 'a'});
}
if (teamslist.match(team2Ex) == null) {
  fs.writeFileSync(`./dist/src/records/${selectedLeague}/Teams.txt`, `${week[k][0]}\n`, {flag: 'a'});
}
for (let fi=0;fi<recordCheck.length;fi++) {
  let statsarr = Object.keys(thisgame[1][recordCheck[fi]]);
  for (let di=2;di<statsarr.length;di++) {
    let statdata = fs.readFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, 'utf8');
    let thisrecord = statdata.match(recordEx);
    if (thisgame[1][recordCheck[fi]][statsarr[di]] > 0) {
      if (thisrecord == null) {
        fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}\n`, {flag: "w"});
      } else {
        let index = thisrecord.length;
          for (let si=0;si<thisrecord.length;si++) {
            let numx= new RegExp(/\d+/);
            let amount = numx.exec(thisrecord[si]);
            let singlerecord = Number(amount);
            if (thisgame[1][recordCheck[fi]][statsarr[di]] > singlerecord) {
              index = si;
              si = 10000;
            } else {
              continue;
            }
          }
          if (index === thisrecord.length && thisrecord.length < 10) {
            fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}\n`, {flag: "a"});
          } else if (index < thisrecord.length && thisrecord.length < 10) {
            fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${thisrecord![thisrecord.length-1]}\n`, {flag: "a"});
            statdata = fs.readFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, 'utf8');
            let newlist = statdata.match(recordEx);
            for (let bi=thisrecord.length;bi>index;bi--) {
            statdata = statdata.replace(newlist![bi], `${newlist![bi-1]}`);
            }
            statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}`);
            fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${statdata}`, {flag: "w"});
          } else if (index < thisrecord.length && thisrecord.length === 10) {
                for (let ai=9;ai>index;ai--) {
                  statdata = statdata.replace(thisrecord![ai], thisrecord![ai-1]);
                }
                statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}`);
                fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${statdata}`, {flag: "w"});
          } else {
          continue;
        }
      }
    }
    }
  }
  for (let fi=0;fi<recordCheck.length;fi++) {
    let playerFile;
    if (thisgame[1][recordCheck[fi]].number !== 0) {
      playerFile = fs.readFileSync(`./dist/src/players/active/${recordCheck[fi]} ${thisgame[1][recordCheck[fi]].number}.txt`, 'utf8');
    } else {
      playerFile = fs.readFileSync(`./dist/src/players/active/${recordCheck[fi]}.txt`, 'utf8');
    }
    let seasonsEx = new RegExp(/Season (\d+)/g);
    let numEx = new RegExp(/\d+/);
    let seaExtract = playerFile.match(seasonsEx);
    let seasons: any[] = [];
    for (let qi=0;qi<seaExtract!.length;qi++) {
      let num = numEx.exec(seaExtract![qi])![0];
      seasons.push(num);
    }
    let beelz = recordCheck[fi];
    if (thisgame[1][beelz].number !== 0) {
      beelz = beelz + ` ${thisgame[1][recordCheck[fi]].number}`;
    }
    let careerstatistics: any = careerStats(beelz, seasons);
    let statsarr = Object.keys(careerstatistics);
    for (let di=3;di<statsarr.length;di++) {
      let continued = 0;
      let statdata = fs.readFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, 'utf8');
      let thisrecord = statdata.match(recordEx);
      let fuckX = new RegExp(`${recordCheck[fi]}`, "g");
      if (statdata.match(fuckX) !== null) {
        let playerRecX = new RegExp(`${recordCheck[fi]} \.\?\.\?\.\?\.\?\.\?`);
        let prevRec: any = playerRecX.exec(statdata);
        let thisamount = Number(numEx.exec(prevRec));
        if (careerstatistics[statsarr[di]] >= thisamount) {
          statdata = statdata.replace(`${prevRec[0]}\n`, "");
          fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${statdata}`, {flag: "w"});
          thisrecord = statdata.match(recordEx);
        } else {
          continued = 1;
        }
      }
      if (continued === 1) {
        continue;
      }
      if (careerstatistics[statsarr[di]] > 0) {
        if (thisrecord == null) {
          fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}\n`, {flag: "w"});
        } else {
          let index = thisrecord.length;
            for (let si=0;si<thisrecord.length;si++) {
              let numx= new RegExp(/\d+/);
              let amount = numx.exec(thisrecord[si]);
              let singlerecord = Number(amount);
              if (careerstatistics[statsarr[di]] > singlerecord) {
                index = si;
                si = 10000;
              } else {
                continue;
              }
            }
            if (index === thisrecord.length && thisrecord.length < 10) {
              fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}\n`, {flag: "a"});
            } else if (index < thisrecord.length && thisrecord.length < 10) {
              fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${thisrecord![thisrecord.length-1]}\n`, {flag: "a"});
              statdata = fs.readFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, 'utf8');
              let newlist = statdata.match(recordEx);
              for (let bi=thisrecord.length;bi>index;bi--) {
              statdata = statdata.replace(newlist![bi], `${newlist![bi-1]}`);
              }
              statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}`);
              fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${statdata}`, {flag: "w"});
            } else if (index < thisrecord.length && thisrecord.length === 10) {
                  for (let ai=9;ai>index;ai--) {
                    statdata = statdata.replace(thisrecord![ai], thisrecord![ai-1]);
                  }
                  statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}`);
                  fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${statdata}`, {flag: "w"});
            } else {
            continue;
          }
        }
      }
      }
    }
}
}  catch (err) {
  if (err) {
    fs.writeFileSync(`Error.txt`, `${err}`, {flag: "w"});
  }
  }
}
else {
  checkedgames.push([week[k][1], week[k][0], k]);
  continue;
}
}
if (checkedgames.length > 0) {
  watchgamesbutton.show();
}
rungamesbutton.repaint();
rungamesbutton.setText("Run Games");
copyScoresButton.show();
} else {
  return;
}
});

let copyScoresButton = new QPushButton();
copyScoresButton.setText("Copy Scores");
copyScoresButton.addEventListener("released", () => {
  let texttocopy: string = ""
  for (let i=0;i<scoresarray.length;i++) {
    texttocopy = texttocopy + `${scoresarray[i][0].text()}\n`;
    texttocopy = texttocopy + `${scoresarray[i][1].text()}\n`
    texttocopy = texttocopy + `\n`;
  }
  const clipboard = QApplication.clipboard();
  clipboard?.setText(texttocopy);
  const okmsg = new QMessageBox();
  okmsg.setText("Scores copied!");
  const okButt = new QPushButton();
  okButt.setText("OK.");
  okmsg.addButton(okButt, ButtonRole.AcceptRole);
  okmsg.exec();
})

copyScoresButton.hide();

let gamestowatchscreen = new QWidget();
gamestowatchscreen.setObjectName('gamestowatchscreen');
let gamestowatchscreenLayout = new FlexLayout();
gamestowatchscreen.setLayout(gamestowatchscreenLayout);

stacked.addWidget(gamestowatchscreen);

let watchgamestats: any;
const watchgamesbutton = new QPushButton();

watchgamesbutton.setText('Watch Selected Games');
watchgamesbutton.addEventListener("released", () => {
  let wrtext = weekroundCheck.text();
  if (allgameswatched == false) {
  for (let ye=0;ye<checkedgames.length;ye++) {
    let thiswatch = new QPushButton();
    thiswatch.setText(`${checkedgames[ye][1]} @ ${checkedgames[ye][0]}`);
    thiswatch.addEventListener("released", () => {
  
      let teams = thiswatch.text().split(" @ ");
      let hometeam: any = teamToObject(teams[1]);
      let awayteam: any = teamToObject(teams[0]);
      let dir = `./dist/src/games history/${season}/${selectedLeague}`
      if (rscheck == true) {
        wrtext = `RS Week ${wrtext}`;
      } else if (pocheck == true) {
        wrtext = `PO Round ${wrtext}`;
      }
      let thisgame = gameRunner(hometeam, awayteam, dir, wrtext);
      if (rscheck == true) {
      updateStats(thisgame[1], season);
      updateTeamStats(thisgame[0].home, thisgame[0].away, thisgame[0].hometeam, thisgame[0].awayteam, season);
      let recordEx = new RegExp(/.+ (\d+)/g);
let recordCheck = Object.keys(thisgame[1]);
let team1Ex = new RegExp(`${hometeam.name}`);
let team2Ex = new RegExp(`${awayteam.name}`);
let teamslist = fs.readFileSync(`./dist/src/records/${selectedLeague}/Teams.txt`, 'utf8');
if (teamslist.match(team1Ex) == null) {
  fs.writeFileSync(`./dist/src/records/${selectedLeague}/Teams.txt`, `${hometeam.name}\n`, {flag: 'a'});
}
if (teamslist.match(team2Ex) == null) {
  fs.writeFileSync(`./dist/src/records/${selectedLeague}/Teams.txt`, `${awayteam.name}\n`, {flag: 'a'});
}
for (let fi=0;fi<recordCheck.length;fi++) {
  let statsarr = Object.keys(thisgame[1][recordCheck[fi]]);
  for (let di=2;di<statsarr.length;di++) {
    let statdata = fs.readFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, 'utf8');
    let thisrecord = statdata.match(recordEx);
    if (thisgame[1][recordCheck[fi]][statsarr[di]] > 0) {
      if (thisrecord == null) {
        fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}\n`, {flag: "w"});
      } else {
        let index = thisrecord.length;
          for (let si=0;si<thisrecord.length;si++) {
            let numx= new RegExp(/\d+/);
            let amount = numx.exec(thisrecord[si]);
            let singlerecord = Number(amount);
            if (thisgame[1][recordCheck[fi]][statsarr[di]] > singlerecord) {
              index = si;
              si = 10000;
            } else {
              continue;
            }
          }
          if (index === thisrecord.length && thisrecord.length < 10) {
            fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}\n`, {flag: "a"});
          } else if (index < thisrecord.length && thisrecord.length < 10) {
            fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${thisrecord![thisrecord.length-1]}\n`, {flag: "a"});
            statdata = fs.readFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, 'utf8');
            let newlist = statdata.match(recordEx);
            for (let bi=thisrecord.length;bi>index;bi--) {
            statdata = statdata.replace(newlist![bi], `${newlist![bi-1]}`);
            }
            statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}`);
            fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${statdata}`, {flag: "w"});
          } else if (index < thisrecord.length && thisrecord.length === 10) {
                for (let ai=9;ai>index;ai--) {
                  statdata = statdata.replace(thisrecord![ai], thisrecord![ai-1]);
                }
                statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${thisgame[1][recordCheck[fi]][statsarr[di]]}`);
                fs.writeFileSync(`./dist/src/records/${selectedLeague}/Game/${recordFiles[di-2]}.txt`, `${statdata}`, {flag: "w"});
          } else {
          continue;
        }
      }
    }
    }
  }
  for (let fi=0;fi<recordCheck.length;fi++) {
    let beelz = recordCheck[fi];
    console.log(beelz);
    if (thisgame[1][recordCheck[fi]].number !== 0) {
      beelz = beelz + ` ${thisgame[1][recordCheck[fi]].number}`;
    }
    let playerFile = fs.readFileSync(`./dist/src/players/active/${beelz}.txt`, 'utf8');
    let seasonsEx = new RegExp(/Season (\d+)/g);
    let numEx = new RegExp(/\d+/);
    let seaExtract = playerFile.match(seasonsEx);
    let seasons: any[] = [];
    for (let qi=0;qi<seaExtract!.length;qi++) {
      let num = numEx.exec(seaExtract![qi])![0];
      seasons.push(num);
    }
    let careerstatistics: any = careerStats(beelz, seasons);
    let statsarr = Object.keys(careerstatistics);
    for (let di=3;di<statsarr.length;di++) {
      let continued = 0;
      let statdata = fs.readFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, 'utf8');
      let thisrecord = statdata.match(recordEx);
      let fuckX = new RegExp(`${recordCheck[fi]}`, "g");
      if (statdata.match(fuckX) !== null) {
        let playerRecX = new RegExp(`${recordCheck[fi]} \.\?\.\?\.\?\.\?\.\?`);
        let prevRec: any = playerRecX.exec(statdata);
        let thisamount = Number(numEx.exec(prevRec));
        if (careerstatistics[statsarr[di]] >= thisamount) {
          statdata = statdata.replace(`${prevRec[0]}\n`, "");
          fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${statdata}`, {flag: "w"});
          thisrecord = statdata.match(recordEx);
        } else {
          continued = 1;
        }
      }
      if (continued === 1) {
        continue;
      }
      if (careerstatistics[statsarr[di]] > 0) {
        if (thisrecord == null) {
          fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}\n`, {flag: "w"});
        } else {
          let index = thisrecord.length;
            for (let si=0;si<thisrecord.length;si++) {
              let numx= new RegExp(/\d+/);
              let amount = numx.exec(thisrecord[si]);
              let singlerecord = Number(amount);
              if (careerstatistics[statsarr[di]] > singlerecord) {
                index = si;
                si = 10000;
              } else {
                continue;
              }
            }
            if (index === thisrecord.length && thisrecord.length < 10) {
              fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}\n`, {flag: "a"});
            } else if (index < thisrecord.length && thisrecord.length < 10) {
              fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${thisrecord![thisrecord.length-1]}\n`, {flag: "a"});
              statdata = fs.readFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, 'utf8');
              let newlist = statdata.match(recordEx);
              for (let bi=thisrecord.length;bi>index;bi--) {
              statdata = statdata.replace(newlist![bi], `${newlist![bi-1]}`);
              }
              statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}`);
              fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${statdata}`, {flag: "w"});
            } else if (index < thisrecord.length && thisrecord.length === 10) {
                  for (let ai=9;ai>index;ai--) {
                    statdata = statdata.replace(thisrecord![ai], thisrecord![ai-1]);
                  }
                  statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${careerstatistics[statsarr[di]]}`);
                  fs.writeFileSync(`./dist/src/records/Career/${recordFiles[di-3]}.txt`, `${statdata}`, {flag: "w"});
            } else {
            continue;
          }
        }
      }
      }
    }
  }
      scoresarray[checkedgames[ye][2]][0].setText(thisgame[0].away);
      scoresarray[checkedgames[ye][2]][1].setText(thisgame[0].home);
      watchgamestats = thisgame[1];
      awayteamlabel.setText(teams[0]);
      hometeamlabel.setText(teams[1]);
      wgteamhome.setText(teams[1].toUpperCase());
      wgteamaway.setText(teams[0].toUpperCase());
      wgroster1a.setText(awayteam.roster[0].name);
      wgroster2a.setText(awayteam.roster[1].name);
      wgroster3a.setText(awayteam.roster[2].name);
      wgroster4a.setText(awayteam.roster[3].name);
      wgroster5a.setText(awayteam.roster[4].name);
      wgroster6a.setText(awayteam.roster[5].name);
      wgroster1h.setText(hometeam.roster[0].name);
      wgroster2h.setText(hometeam.roster[1].name);
      wgroster3h.setText(hometeam.roster[2].name);
      wgroster4h.setText(hometeam.roster[3].name);
      wgroster5h.setText(hometeam.roster[4].name);
      wgroster6h.setText(hometeam.roster[5].name);
      wgteamhome.repaint();
      wgteamaway.repaint();
      wgroster1a.repaint();
      wgroster2a.repaint();
      wgroster3a.repaint();
      wgroster4a.repaint();
      wgroster5a.repaint();
      wgroster6a.repaint();
      wgroster1h.repaint();
      wgroster2h.repaint();
      wgroster3h.repaint();
      wgroster4h.repaint();
      wgroster5h.repaint();
      wgroster6h.repaint();
      let awayoveralls: any[] = [];
      let homeoveralls: any[] = [];
      let awayteamovr = 0;
      let hometeamovr = 0;
      for (let ty=0;ty<awayteam.roster.length;ty++) {
        let overall = Math.round((awayteam.roster[ty].power + awayteam.roster[ty].speed + awayteam.roster[ty].eye + awayteam.roster[ty].tackle + awayteam.roster[ty].breaktackle + awayteam.roster[ty].block + awayteam.roster[ty].breakblock + awayteam.roster[ty].awareness) / 8);
        awayoveralls.push(overall);
        awayteamovr = awayteamovr + overall;
      }
      awayteamovr = Math.round(awayteamovr / 6);
      awayteamovrLabel.setText(awayteamovr);
      aros1ovr.setText(awayoveralls[0]);
      aros2ovr.setText(awayoveralls[1]);
      aros3ovr.setText(awayoveralls[2]);
      aros4ovr.setText(awayoveralls[3]);
      aros5ovr.setText(awayoveralls[4]);
      aros6ovr.setText(awayoveralls[5]);
      awayteamovrLabel.repaint();
      aros1ovr.repaint();
      aros2ovr.repaint();
      aros3ovr.repaint();
      aros4ovr.repaint();
      aros5ovr.repaint();
      aros6ovr.repaint();
      for (let ty=0;ty<hometeam.roster.length;ty++) {
        let overall = Math.round((hometeam.roster[ty].power + hometeam.roster[ty].speed + hometeam.roster[ty].eye + hometeam.roster[ty].tackle + hometeam.roster[ty].breaktackle + hometeam.roster[ty].block + hometeam.roster[ty].breakblock + hometeam.roster[ty].awareness) / 8);
        homeoveralls.push(overall);
        hometeamovr = hometeamovr + overall;
      }
      hometeamovr = Math.round(hometeamovr / 6);
      hometeamovrLabel.setText(hometeamovr);
      hros1ovr.setText(homeoveralls[0]);
      hros2ovr.setText(homeoveralls[1]);
      hros3ovr.setText(homeoveralls[2]);
      hros4ovr.setText(homeoveralls[3]);
      hros5ovr.setText(homeoveralls[4]);
      hros6ovr.setText(homeoveralls[5]);
      hros1ovr.repaint();
      hros2ovr.repaint();
      hros3ovr.repaint();
      hros4ovr.repaint();
      hros5ovr.repaint();
      hros6ovr.repaint();
      for (let it=0;it<boxscorearr.length;it++) {
        boxscorearr[it].setText("0");
        boxscorearr[it].setInlineStyle("background-color: 'white';")
        boxscorearr[it].repaint();
      }
      awayfinal.setText("0");
      awayfinal.repaint();
      homefinal.setText("0");
      homefinal.repaint();
      currentaction.setText("");
      currentaction.repaint();
      lastaction.setText("");
      lastaction.repaint();
      thirdaction.setText("");
      thirdaction.repaint();
      fourthaction.setText("");
      fourthaction.repaint();
      fifthaction.setText("");
      fifthaction.repaint();
      currentinning = 0;
      playButton.setDisabled(false);
      pauseButton.setDisabled(false);
      playballbutton.setDisabled(false);
      timingSlider.setDisabled(false);
      playballbutton.show();
      playButton.hide();
      pauseButton.hide();
      gamesView.setDisabled(true);
      statsbutton.setDisabled(true);
      addorremoveteamsbutton.setDisabled(true);
      
      runOffseasonButton.setDisabled(true);
      backButton.setDisabled(true);
      speedtrack = 0;
      thiswatch.setDisabled(true);
      gameStatsButton.hide();
      nextGameButton.hide();
      stacked.setCurrentWidget(watchGame);
    })
    allgameswatched = true;
    let buttonHolder = new QWidget();
    let buttonHolderLayout = new FlexLayout();
    buttonHolder.setLayout(buttonHolderLayout);
    buttonHolderLayout.addWidget(thiswatch);
    gamestowatchscreenLayout.addWidget(buttonHolder);
    gamestowatchButtons.push(buttonHolder);
  }
  stacked.setCurrentWidget(gamestowatchscreen);
} else {
  stacked.setCurrentWidget(gamestowatchscreen);
}
})


watchgamesbutton.hide();
rungamesbutton.hide();
scheduleBottomBarLayout.addWidget(watchgamesbutton);
scheduleBottomBarLayout.addWidget(rungamesbutton);
scheduleBottomBarLayout.addWidget(copyScoresButton);

const addorremoveteamsbutton = new QPushButton();

addorremoveteamsbutton.setText("Add or Remove Teams")
addorremoveteamsbutton.setObjectName("addteams")
addorremoveteamsbutton.addEventListener("released", () => {
  
  stacked.setCurrentWidget(addorremoveTeamsScreen);
})
addorremoveteamsbutton.setInlineStyle("height: 25px;")

const addorremoveTeamsScreen = new QWidget();
const addorremoveTeamsScreenLayout = new FlexLayout();
addorremoveTeamsScreen.setLayout(addorremoveTeamsScreenLayout);
addorremoveTeamsScreen.setInlineStyle("flex-direction: 'column';")

const addteamsButton = new QPushButton();

addteamsButton.setText("Add Teams");
addteamsButton.addEventListener("released", () => {
  
  stacked.setCurrentWidget(addteamsScreen);
})
const removeteamsButton = new QPushButton();

removeteamsButton.setText("Remove Teams");
removeteamsButton.addEventListener("released", () => {
  
  stacked.setCurrentWidget(removeteamsScreen);
})

addorremoveTeamsScreenLayout.addWidget(addteamsButton);
addorremoveTeamsScreenLayout.addWidget(removeteamsButton);

const addteamsScreen = new QWidget();
addteamsScreen.setObjectName("addTeamsScreen");
const addteamsScreenLayout = new FlexLayout();
addteamsScreen.setLayout(addteamsScreenLayout);
addteamsScreen.setInlineStyle("flex-direction: 'column'; justify-content: 'space-between';");

const addteamsTopBar = new QWidget();
addteamsTopBar.setObjectName("addteamsTopBar");
const addteamsTopBarLayout = new FlexLayout();
addteamsTopBar.setLayout(addteamsTopBarLayout);
addteamsTopBar.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start'; justify-content: 'space-between';");


let ntRoster: any = [];
const enterteamName = new QLineEdit();
enterteamName.setText("Enter team name.");
enterteamName.setInlineStyle("font-size: 12px;");
const selectRegionLabel = new QLabel();
selectRegionLabel.setText("Select Region:");
selectRegionLabel.setInlineStyle("font-size: 10px");
const generateRosterButton = new QPushButton();

generateRosterButton.setText("Reveal Players");
generateRosterButton.addEventListener("released", () => {
  
  newteamnameLabel.setText(enterteamName.text());
  newteamnameLabel.repaint();
  ntRoster = [];
  let ntregion: string;
  let regKeys = Object.keys(draftOrderObj);
  ntregion = regKeys[selectRegion.currentIndex()];
  let teamoverallRating = 0;
  for (let hg=0;hg<6;hg++) {
    let star = false;
    if (randInt(0,1000) === 1) {
      star = true;
    }
    let ageGen: number = 0;
    if (star == true) {
      ageGen = randInt(20, 24);
    } else {
      ageGen = randInt(20, 40);
    }
    let newplayer = {name: nameGenerator(ntregion), overall: 0, number: 0, power: statGen(star), speed: speedGen(star), eye: statGen(star), tackle: statGen(star), breaktackle: statGen(star), block: statGen(star), breakblock: statGen(star), awareness: statGen(star), age: ageGen, potential: potGen(star)};
    newplayer.overall = playerOverall(newplayer);
    teamoverallRating = teamoverallRating + newplayer.overall;
    ntRoster.push(newplayer);
  }
  teamoverallRating = Math.floor(teamoverallRating / 6);
  ntOvrLabel.setText(`Overall: ${teamoverallRating}`);
  for (let gy=0;gy<newRArr.length;gy++) {
    newRArr[gy][0].setText(ntRoster[gy].name);
    newRArr[gy][1].setText(ntRoster[gy].overall);
    newRArr[gy][0].repaint();
    newRArr[gy][1].repaint();
  }
})

const addteamsBottomBar = new QWidget();
addteamsBottomBar.setObjectName("addTeamsBottomBar");
const addteamsBottomBarLayout = new FlexLayout();
addteamsBottomBar.setLayout(addteamsBottomBarLayout);
addteamsBottomBar.setInlineStyle("flex-direction: 'row'; justify-content: 'center';")

const addteamsSaveBar = new QWidget();
const addteamsSaveBarLayout = new FlexLayout();
addteamsSaveBar.setLayout(addteamsSaveBarLayout);
addteamsSaveBar.setInlineStyle("flex-direction: 'row'; justify-content: 'center';");

const saveTeamButton = new QPushButton();

saveTeamButton.setText("Save Team");
saveTeamButton.addEventListener("released", () => {
  
  const saveCheck = new QMessageBox();
  saveCheck.setText(`If there is another team named ${newteamnameLabel.text()}, that team will be overwritten. Save team?`);
  const yesButton = new QPushButton;
  yesButton.setText("Yes");
  const noButton = new QPushButton();

  noButton.setText("No");
  saveCheck.addButton(noButton, ButtonRole.AcceptRole);
  saveCheck.addButton(yesButton, ButtonRole.RejectRole);
  saveCheck.exec();
  if (saveCheck.result() === 1) {
  let teamname = newteamnameLabel.text();
  let activeplayers = fs.readdirSync(`./dist/src/players/active`);
  let filenameX = new RegExp(/(.+).txt/);
  let alreadynamed = "";
  for (let k=0;k<activeplayers.length;k++) {
      alreadynamed = alreadynamed + filenameX.exec(activeplayers[k])![1];
  }
  let ntregion: string;
  let regKeys = Object.keys(draftOrderObj);
  ntregion = regKeys[selectRegion.currentIndex()];
  let roster = ntRoster;
  let namestowrite: string[] = [];
  for (let i=0;i<roster.length;i++) {
    let rookienameX = new RegExp(`${roster[i].name}`, "g");
            if (alreadynamed.match(rookienameX) !== null) {
              roster[i].number = (alreadynamed.match(rookienameX)!.length + 1);
              namestowrite.push(`${roster[i].name} ${roster[i].number}`);
                fs.writeFileSync(`./dist/src/players/active/${roster[i].name} ${(alreadynamed.match(rookienameX)!.length + 1)}.txt`, `name: ${roster[i].name}\n  power: ${roster[i].power}\n  speed: ${roster[i].speed}\n  eye: ${roster[i].eye}\n  tackle: ${roster[i].tackle}\n  breaktackle: ${roster[i].breaktackle}\n  block: ${roster[i].block}\n  breakblock: ${roster[i].breakblock}\n  awareness: ${roster[i].awareness}\n  age: ${roster[i].age}\n  potential: ${roster[i].potential}\n\n\n\nstats:\n`, {flag: "w"});
                let statblock = fs.readFileSync(`./dist/src/static/static.txt`, 'utf8');
                statblock = statblock.replace("Season 0", `Season ${season}`);
                fs.writeFileSync(`./dist/src/players/active/${roster[i].name} ${(alreadynamed.match(rookienameX)!.length + 1)}.txt`, statblock, {flag: "a"});
              } else {
              namestowrite.push(`${roster[i].name}`);
                fs.writeFileSync(`./dist/src/players/active/${roster[i].name}.txt`, `name: ${roster[i].name}\n  power: ${roster[i].power}\n  speed: ${roster[i].speed}\n  eye: ${roster[i].eye}\n  tackle: ${roster[i].tackle}\n  breaktackle: ${roster[i].breaktackle}\n  block: ${roster[i].block}\n  breakblock: ${roster[i].breakblock}\n  awareness: ${roster[i].awareness}\n  age: ${roster[i].age}\n  potential: ${roster[i].potential}\n\n\n\nstats:\n`, {flag: "w"});
                let statblock = fs.readFileSync(`./dist/src/static/static.txt`, 'utf8');
                statblock = statblock.replace("Season 0", `Season ${season}`);
                fs.writeFileSync(`./dist/src/players/active/${roster[i].name}.txt`, statblock, {flag: "a"});
              }
  }
  fs.writeFileSync(`./dist/src/teams/${teamname}.txt`, `name: ${teamname}\n  region: ${ntregion}\n  roster:\n    ${namestowrite[0]}\n    ${namestowrite[1]}\n    ${namestowrite[2]}\n    ${namestowrite[3]}\n    ${namestowrite[4]}\n    ${namestowrite[5]}\n\nstats:\nSeason ${season}:\n  Points Against: 0\n  Wins: 0\n  Losses: 0\n  Ties: 0\n  League: Any\n`, {flag: "w"});
  teams = fs.readdirSync(`./dist/src/teams`);
} else {
  return;
}
});

addteamsSaveBarLayout.addWidget(saveTeamButton);

const atBBTile = new QWidget();
atBBTile.setObjectName("atBBTile");
const atBBTileLayout = new FlexLayout();
atBBTile.setLayout(atBBTileLayout);
atBBTile.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start'; align-content: 'flex-start';");

const selectRegion = new QComboBox();
selectRegion.addItem(undefined, "Zone 1 - Sphere: English");
selectRegion.addItem(undefined, "Zone 2 - Sphere: Spanish");
selectRegion.addItem(undefined, "Zone 3 - Sphere: Chinese");
selectRegion.addItem(undefined, "Zone 4 - Sphere: Japanese");
selectRegion.addItem(undefined, "Zone 5 - Sphere: Italian");
selectRegion.addItem(undefined, "Zone 6 - Sphere: Germanic");
selectRegion.addItem(undefined, "Zone 7 - Sphere: Franco");
selectRegion.addItem(undefined, "Zone 8 - Sphere: Eastern Euro");
selectRegion.addItem(undefined, "Zone 9 - Sphere: Korean");
selectRegion.addItem(undefined, "Zone 10 - Sphere: Vietnamese");
selectRegion.addItem(undefined, "Zone 11 - Sphere: Indian");
selectRegion.addItem(undefined, "Zone 12 - Sphere: Arabic");
selectRegion.addItem(undefined, "Zone 13 - Sphere: Subsaharan");
selectRegion.addItem(undefined, "Zone 14 - Sphere: Greek");
selectRegion.addItem(undefined, "Zone 15 - Sphere: Scandinavian");

let newteamnameLabel = new QLabel();
newteamnameLabel.setInlineStyle("font-size: 30px; width: 500px");
let ntOvrLabel = new QLabel();
ntOvrLabel.setText("Overall:")

const newteamRosterLabel = new QLabel();
newteamRosterLabel.setText("Roster:");

const newR1bar = new QWidget()
const newR1barLayout = new FlexLayout();
newR1bar.setLayout(newR1barLayout);
newR1bar.setInlineStyle("flex-direction: 'row'; justify-content: 'space-between';");
let newR1Label = new QLabel();
newR1Label.setInlineStyle("font-size: 20px; width: 400px;");
let newR1ovr = new QLabel();
newR1ovr.setInlineStyle("font-size: 20px; width: 50px");
newR1barLayout.addWidget(newR1Label);
newR1barLayout.addWidget(newR1ovr);

const newR2bar = new QWidget()
const newR2barLayout = new FlexLayout();
newR2bar.setLayout(newR2barLayout);
newR2bar.setInlineStyle("flex-direction: 'row'; justify-content: 'space-between';");
let newR2Label = new QLabel();
newR2Label.setInlineStyle("font-size: 20px; width: 400px;");
let newR2ovr = new QLabel();
newR2ovr.setInlineStyle("font-size: 20px; width: 50px");
newR2barLayout.addWidget(newR2Label);
newR2barLayout.addWidget(newR2ovr);

const newR3bar = new QWidget()
const newR3barLayout = new FlexLayout();
newR3bar.setLayout(newR3barLayout);
newR3bar.setInlineStyle("flex-direction: 'row'; justify-content: 'space-between';");
let newR3Label = new QLabel();
newR3Label.setInlineStyle("font-size: 20px; width: 400px;");
let newR3ovr = new QLabel();
newR3ovr.setInlineStyle("font-size: 20px; width: 50px");
newR3barLayout.addWidget(newR3Label);
newR3barLayout.addWidget(newR3ovr);

const newR4bar = new QWidget()
const newR4barLayout = new FlexLayout();
newR4bar.setLayout(newR4barLayout);
newR4bar.setInlineStyle("flex-direction: 'row'; justify-content: 'space-between';");
let newR4Label = new QLabel();
newR4Label.setInlineStyle("font-size: 20px; width: 400px;");
let newR4ovr = new QLabel();
newR4ovr.setInlineStyle("font-size: 20px; width: 50px");
newR4barLayout.addWidget(newR4Label);
newR4barLayout.addWidget(newR4ovr);

const newR5bar = new QWidget()
const newR5barLayout = new FlexLayout();
newR5bar.setLayout(newR5barLayout);
newR5bar.setInlineStyle("flex-direction: 'row'; justify-content: 'space-between';");
let newR5Label = new QLabel();
newR5Label.setInlineStyle("font-size: 20px; width: 400px;");
let newR5ovr = new QLabel();
newR5ovr.setInlineStyle("font-size: 20px; width: 50px");
newR5barLayout.addWidget(newR5Label);
newR5barLayout.addWidget(newR5ovr);

const newR6bar = new QWidget()
const newR6barLayout = new FlexLayout();
newR6bar.setLayout(newR6barLayout);
newR6bar.setInlineStyle("flex-direction: 'row'; justify-content: 'space-between';");
let newR6Label = new QLabel();
newR6Label.setInlineStyle("font-size: 20px; width: 400px;");
let newR6ovr = new QLabel();
newR6ovr.setInlineStyle("font-size: 20px; width: 50px");
newR6barLayout.addWidget(newR6Label);
newR6barLayout.addWidget(newR6ovr);

let newRArr: any[] = [[newR1Label, newR1ovr], [newR2Label, newR2ovr], [newR3Label, newR3ovr], [newR4Label, newR4ovr], [newR5Label, newR5ovr], [newR6Label, newR6ovr]];

atBBTileLayout.addWidget(newteamnameLabel);
atBBTileLayout.addWidget(ntOvrLabel);
atBBTileLayout.addWidget(newteamRosterLabel);
atBBTileLayout.addWidget(newR1bar);
atBBTileLayout.addWidget(newR2bar);
atBBTileLayout.addWidget(newR3bar);
atBBTileLayout.addWidget(newR4bar);
atBBTileLayout.addWidget(newR5bar);
atBBTileLayout.addWidget(newR6bar);

addteamsBottomBarLayout.addWidget(atBBTile);

addteamsTopBarLayout.addWidget(enterteamName);
addteamsTopBarLayout.addWidget(selectRegionLabel);
addteamsTopBarLayout.addWidget(selectRegion);
addteamsTopBarLayout.addWidget(generateRosterButton);

addteamsScreenLayout.addWidget(addteamsTopBar);
addteamsScreenLayout.addWidget(addteamsBottomBar);
addteamsScreenLayout.addWidget(addteamsSaveBar);

const removeteamsScreen = new QWidget();
const removeteamsScreenLayout = new FlexLayout();
removeteamsScreen.setLayout(removeteamsScreenLayout);

const removeText = new QTextEdit();
removeText.setInlineStyle("height: 200px; width: 100px; font-size: 10px;");
removeText.setText("Enter teams to be removed.");

const finalremoveButton = new QPushButton();

finalremoveButton.setText("Remove Teams");
finalremoveButton.addEventListener("released", () => {
  
  const finalsolution = new QMessageBox();
  let splitX = new RegExp(/\b.+\b/g);
  let teamsforannihilation = removeText.toPlainText().match(splitX);
  if (teamsforannihilation == null || teamsforannihilation == undefined) {
    return;
  }
  let deadteams: string = "";
  for (let h=0;h<teamsforannihilation!.length;h++) {
    deadteams = deadteams + `${teamsforannihilation![h]}\n`;
  }
  finalsolution.setText(`The following teams will be removed, and their players moved to free agency:\n\n${deadteams}\nContinue?`);
  const yesButton = new QPushButton;
  yesButton.setText("Yes");
  const noButton = new QPushButton();

  noButton.setText("No");
  finalsolution.addButton(noButton, ButtonRole.AcceptRole);
  finalsolution.addButton(yesButton, ButtonRole.RejectRole);
  finalsolution.exec();
  if (finalsolution.result() === 1) {
    let deadguys: any[] = [];
    for (let op=0;op<teamsforannihilation!.length;op++) {
      let thisteam = teamToObject(teamsforannihilation[op]);
      let thisroster: any = thisteam.roster;
      for (let n=0;n<thisroster.length;n++) {
        let name = thisroster[n].name.toString();
        if (thisroster[n].number !== 0) {
          name = name + ` ${thisroster[n].number}`
        };
        let data = fs.readFileSync(`./dist/src/players/active/${name}.txt`, 'utf8');
        deadguys.push(`${name}.txt`);
        fs.writeFileSync(`./dist/src/players/free agents/${thisteam.region}/${name}.txt`, data, {flag: "w"});
      }
    }
    for (let o=0;o<deadguys.length;o++) {
      fs.unlinkSync(`./dist/src/players/active/${deadguys[o]}`);
      }
    for (let v=0;v<teamsforannihilation.length;v++) {
      fs.unlinkSync(`./dist/src/teams/${teamsforannihilation[v]}.txt`);
      }
      teams = fs.readdirSync(`./dist/src/teams`);
  } else {
    return;
  }
})

removeteamsScreenLayout.addWidget(removeText);
removeteamsScreenLayout.addWidget(finalremoveButton);



const gamesView = new QPushButton();

gamesView.setText("Games");
gamesView.addEventListener("released", () => {
  
  stacked.setCurrentWidget(schedView);
})


let draft: any;
let rookiesugh: any;
let signedFas: any;
let allFas: QTreeWidgetItem[] = [];
const runOffseasonButton = new QPushButton();

runOffseasonButton.setObjectName('runOffseason');
runOffseasonButton.setText("Run Offseason");
runOffseasonButton.addEventListener("released", () => {
  
  const certainMsg = new QMessageBox();
  certainMsg.setText("Are you sure you want to run the offseason?");
  const yesButton = new QPushButton;
  yesButton.setText("Yes");
  const noButton = new QPushButton();

  noButton.setText("No");
  certainMsg.addButton(noButton, ButtonRole.AcceptRole);
  certainMsg.addButton(yesButton, ButtonRole.RejectRole);
  certainMsg.exec();
  if (certainMsg.result() === 1) {
    try {
    retireesButton.setDisabled(false);
    seasonRecordRecord();
  let offseason: any = runOffseason();
  let retirees: any = offseason[0];
  let progression: any = offseason[1];
  let order: any = offseason[6];
  let rookies: any = offseason[2];
  rookiesugh = offseason[2];
  draft = offseason[3];
  let draftsignings: any = offseason[4];
  signedFas = offseason[5];
  for (let i=0;i<retirees.length;i++) {
    let item = new QTreeWidgetItem();
    item.setText(0, retirees[i][0]);
    item.setText(1, retirees[i][2]);
    item.setData(2, 0, retirees[i][1]);
    retireesTree.addTopLevelItem(item);
  }
  for (let i=0;i<progression.length;i++) {
    let item = new QTreeWidgetItem();
    let improvement = new QTreeWidgetItem();
    item.setText(0, progression[i][1].name);
    item.setData(1, 0, progression[i][1].overall);
    item.setData(2, 0, progression[i][1].power);
    item.setData(3, 0, progression[i][1].speed);
    item.setData(4, 0, progression[i][1].eye);
    item.setData(5, 0, progression[i][1].tackle);
    item.setData(6, 0, progression[i][1].breaktackle);
    item.setData(7, 0, progression[i][1].block);
    item.setData(8, 0, progression[i][1].breakblock);
    item.setData(9, 0, progression[i][1].awareness);
    item.setText(10, progression[i][1].potential);
    item.setData(11, 0, progression[i][1].age);
    let sign = (a: number, b: number) => {if(a - b > 0) { return `+${a-b}`} else {return `${a-b}`}};
    improvement.setText(1, sign(progression[i][1].overall, progression[i][0].overall))
    improvement.setText(2, sign(progression[i][1].power, progression[i][0].power));
    improvement.setText(3, sign(progression[i][1].speed, progression[i][0].speed));
    improvement.setText(4, sign(progression[i][1].eye, progression[i][0].eye));
    improvement.setText(5, sign(progression[i][1].tackle, progression[i][0].tackle));
    improvement.setText(6, sign(progression[i][1].breaktackle, progression[i][0].breaktackle));
    improvement.setText(7, sign(progression[i][1].block, progression[i][0].block));
    improvement.setText(8, sign(progression[i][1].breakblock, progression[i][0].breakblock));
    improvement.setText(9, sign(progression[i][1].awareness, progression[i][0].awareness));
    item.addChild(improvement);
    progressionTree.addTopLevelItem(item);
  }
  let orderKeys = Object.keys(order);
  for (let i=0;i<orderKeys.length;i++) {
    for (let y=0;y<order[orderKeys[i]].length;y++) {
      let item = new QTreeWidgetItem();
      item.setText(0, order[orderKeys[i]][y]);
      item.setData(1, 0, (y+1));
      draftOrderObj[orderKeys[i]].addTopLevelItem(item);
    }
  }
  let draftclassKeys = Object.keys(rookies);
  for (let i=0;i<draftclassKeys.length;i++) {
    if (draftClassObj[draftclassKeys[i]].children().length > 0) {
      for (let z=0;z<draftClassObj[draftclassKeys[i]].children().length;z++) {
        draftClassObj[draftclassKeys[i]].takeTopLevelItem(0);
      }
    }
  }
  for (let i=0;i<draftclassKeys.length;i++) {
    for (let y=0;y<rookies[draftclassKeys[i]].length;y++) {
      let item = new QTreeWidgetItem();
      item.setText(0, rookies[draftclassKeys[i]][y].name);
      item.setData(1, 0, rookies[draftclassKeys[i]][y].overall);
      item.setData(2, 0, rookies[draftclassKeys[i]][y].power);
      item.setData(3, 0, rookies[draftclassKeys[i]][y].speed);
      item.setData(4, 0, rookies[draftclassKeys[i]][y].eye);
      item.setData(5, 0, rookies[draftclassKeys[i]][y].tackle);
      item.setData(6, 0, rookies[draftclassKeys[i]][y].breaktackle);
      item.setData(7, 0, rookies[draftclassKeys[i]][y].block);
      item.setData(8, 0, rookies[draftclassKeys[i]][y].breakblock);
      item.setData(9, 0, rookies[draftclassKeys[i]][y].awareness);
      item.setText(10, rookies[draftclassKeys[i]][y].potential);
      item.setData(11, 0, rookies[draftclassKeys[i]][y].age);
      draftClassObj[draftclassKeys[i]].addTopLevelItem(item);
    }
  }
  for (let i=0;i<draftsignings[0].length;i++) {
    let item = new QTreeWidgetItem();
    item.setText(0, draftsignings[0][i][0]);
    let subitem1 = new QTreeWidgetItem()
    let subitem2 = new QTreeWidgetItem();
    subitem1.setText(1, draftsignings[0][i][2]);
    subitem2.setText(1, draftsignings[1][i][2]);
    subitem1.setText(2, draftsignings[0][i][3]);
    subitem2.setText(2, draftsignings[1][i][3]);
    item.addChild(subitem1);
    item.addChild(subitem2);
    draftSigningsObj[draftsignings[0][i][1]].addTopLevelItem(item);
  }
  let faKeys: any = Object.keys(faSigningsObj);
  for (let i=0;i<faKeys.length;i++) {
    let dir = fs.readdirSync(`./dist/src/players/free agents/${faKeys[i]}`);
    for (let y=0;y<dir.length;y++) {
      let nameX = new RegExp(/(.+).txt/);
      let player = nameX.exec(dir[y])![1];
      let thisplayer = playerToObject(player, faKeys[i]);
      let item = new QTreeWidgetItem();
      item.setText(0, thisplayer.name!);
      item.setData(2, 0, playerOverall(thisplayer));
      item.setData(3, 0, thisplayer.power!);
      item.setData(4, 0, thisplayer.speed!);
      item.setData(5, 0, thisplayer.eye!);
      item.setData(6, 0, thisplayer.tackle!);
      item.setData(7, 0, thisplayer.breaktackle!);
      item.setData(8, 0, thisplayer.block!);
      item.setData(9, 0, thisplayer.breakblock!);
      item.setData(10, 0, thisplayer.awareness!);
      item.setText(11, thisplayer.potential!);
      item.setData(12, 0, thisplayer.age!);
      allFas.push(item);
      faSigningsObj[faKeys[i]].addTopLevelItem(item);
    }
  }
  for (let hx=0;hx<signedFas.length;hx++) {
    for (let gx=0;gx<signedFas[hx].length;gx++) {
      let item = new QTreeWidgetItem();
      item.setText(0, signedFas[hx][gx][1].name!);
      item.setData(2, 0, playerOverall(signedFas[hx][gx][1]));
      item.setData(3, 0, signedFas[hx][gx][1].power!);
      item.setData(4, 0, signedFas[hx][gx][1].speed!);
      item.setData(5, 0, signedFas[hx][gx][1].eye!);
      item.setData(6, 0, signedFas[hx][gx][1].tackle!);
      item.setData(7, 0, signedFas[hx][gx][1].breaktackle!);
      item.setData(8, 0, signedFas[hx][gx][1].block!);
      item.setData(9, 0, signedFas[hx][gx][1].breakblock!);
      item.setData(10, 0, signedFas[hx][gx][1].awareness!);
      item.setText(11, signedFas[hx][gx][1].potential!);
      item.setData(12, 0, signedFas[hx][gx][1].age!);
      allFas.push(item);
      faSigningsObj[signedFas[hx][gx][2]].addTopLevelItem(item);
    }
  }
  season = Number(fs.readFileSync(`./dist/src/tracker/tracker.txt`, 'utf8'));
  teams = fs.readdirSync(`./dist/src/teams`);
  players = fs.readdirSync(`./dist/src/players/active`);
  teamcount = 0;
  playercount = 0;
  stacked.setCurrentWidget(offseasonView);
} catch (err) {
  console.log(err);
  fs.writeFileSync('Offseason Error.txt', `${err}\n`, {flag: "w"});
}
} else {
  return;
}

});

const loadingView = new QWidget();
const loadingViewLayout = new FlexLayout();
loadingView.setLayout(loadingViewLayout);
let loadingLabel = new QLabel();
loadingLabel.setText("Loading...");
loadingViewLayout.addWidget(loadingLabel);

stacked.addWidget(loadingView);
const offseasonView = new QWidget();
offseasonView.setObjectName("offseasonView");
offseasonView.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start'; justify-content: 'space-between';");
const offseasonLayout = new FlexLayout();
offseasonView.setLayout(offseasonLayout);


const finishOffseasonButton = new QPushButton();

finishOffseasonButton.setText("Finish Offseason");
finishOffseasonButton.addEventListener("released", () => {
  
  finishOffseasonButton.setDisabled(true);
  simdraftclicked = false;
  teamsentered = [];
  faWeek = 0;
  draft = [];
  rookiesugh = [];
  signedFas = [];
  allFas = [];
  statitems = [];
    const offDone = new QMessageBox();
    offDone.setText("Offseason has finished.");
    const okClearButton = new QPushButton;
    okClearButton.setText("Ok.");
    offDone.addButton(okClearButton, ButtonRole.AcceptRole);
    offDone.exec(); 
})

finishOffseasonButton.setDisabled(true);

const retireesButton = new QPushButton();

retireesButton.setObjectName("retireesButton");
retireesButton.setText("Retirements");
retireesButton.addEventListener("released", () => {
  
  retireesButton.setDisabled(true);
  progressionButton.setDisabled(false);
  stacked.setCurrentWidget(retireesView);
})

retireesButton.setDisabled(true);

const retireesView = new QWidget();
retireesView.setObjectName("retireesView");
const retireesViewLayout = new FlexLayout();
retireesView.setLayout(retireesViewLayout);

const retireesTree: QTreeWidget = new QTreeWidget();
const retireesHeaders: string[] = ["Name", "Team", "Age"];
retireesTree.setHeaderLabels(retireesHeaders);
retireesTree.setSortingEnabled(true);

retireesViewLayout.addWidget(retireesTree);

const progressionButton = new QPushButton();

progressionButton.setObjectName("progressionButton");
progressionButton.setText("Player Progression");
progressionButton.addEventListener("released", () => {
  
  progressionButton.setDisabled(true);
  draftOrderButton.setDisabled(false);
  stacked.setCurrentWidget(progressionView);
})

progressionButton.setDisabled(true);

const progressionView = new QWidget();
progressionView.setObjectName("progressionView");
const progressionViewLayout = new FlexLayout();
progressionView.setLayout(progressionViewLayout);

const progressionheaders: string[] = ["Name", "Overall", "Power", "Speed", "Eye", "Tackle", "Break Tackle", "Block", "Break Block", "Awareness", "Growth", "Age"];

const progressionTree = new QTreeWidget();
progressionTree.setHeaderLabels(progressionheaders);
progressionTree.setSortingEnabled(true);

progressionViewLayout.addWidget(progressionTree);

const draftOrderButton = new QPushButton();

draftOrderButton.setObjectName("draftOrderButton");
draftOrderButton.setText("Draft Order");
draftOrderButton.addEventListener("released", () => {
  
  draftOrderButton.setDisabled(true);
  draftClassButton.setDisabled(false);
  stacked.setCurrentWidget(draftOrderView);
})

draftOrderButton.setDisabled(true);

const draftOrderView = new QTabWidget();
draftOrderView.setObjectName("draftOrderView");
const draftOrderViewLayout = new FlexLayout();
draftOrderView.setLayout(draftOrderViewLayout);

const draftOrderheaders: string[] = ["Name", "Pick"];

const americanOrder = new QTreeWidget();
americanOrder.setHeaderLabels(draftOrderheaders);
const arabicOrder = new QTreeWidget();
arabicOrder.setHeaderLabels(draftOrderheaders);
const chineseOrder = new QTreeWidget();
chineseOrder.setHeaderLabels(draftOrderheaders);
const easterneuroOrder = new QTreeWidget();
easterneuroOrder.setHeaderLabels(draftOrderheaders);
const frenchOrder = new QTreeWidget();
frenchOrder.setHeaderLabels(draftOrderheaders);
const germanOrder = new QTreeWidget();
germanOrder.setHeaderLabels(draftOrderheaders);
const greekOrder = new QTreeWidget();
greekOrder.setHeaderLabels(draftOrderheaders);
const hispanicOrder = new QTreeWidget();
hispanicOrder.setHeaderLabels(draftOrderheaders);
const indianOrder = new QTreeWidget();
indianOrder.setHeaderLabels(draftOrderheaders);
const italianOrder = new QTreeWidget();
italianOrder.setHeaderLabels(draftOrderheaders);
const japaneseOrder = new QTreeWidget();
japaneseOrder.setHeaderLabels(draftOrderheaders);
const koreanOrder = new QTreeWidget();
koreanOrder.setHeaderLabels(draftOrderheaders);
const scandinavianOrder = new QTreeWidget();
scandinavianOrder.setHeaderLabels(draftOrderheaders);
const subsaharanOrder = new QTreeWidget();
subsaharanOrder.setHeaderLabels(draftOrderheaders);
const vietnameseOrder = new QTreeWidget();
vietnameseOrder.setHeaderLabels(draftOrderheaders);

const draftOrderObj: any = {american: americanOrder, hispanic: hispanicOrder, chinese: chineseOrder, japanese: japaneseOrder, italian: italianOrder, german: germanOrder, french: frenchOrder, easterneuro: easterneuroOrder, korean: koreanOrder, vietnamese: vietnameseOrder, indian: indianOrder, arabic: arabicOrder, subsaharan: subsaharanOrder, greek: greekOrder, scandinavian: scandinavianOrder};



draftOrderView.addTab(americanOrder, new QIcon(), "Zone 1");
draftOrderView.addTab(hispanicOrder, new QIcon(), "Zone 2");
draftOrderView.addTab(chineseOrder, new QIcon(), "Zone 3");
draftOrderView.addTab(japaneseOrder, new QIcon(), "Zone 4");
draftOrderView.addTab(italianOrder, new QIcon(), "Zone 5");
draftOrderView.addTab(germanOrder, new QIcon(), "Zone 6");
draftOrderView.addTab(frenchOrder, new QIcon(), "Zone 7");
draftOrderView.addTab(easterneuroOrder, new QIcon(), "Zone 8");
draftOrderView.addTab(koreanOrder, new QIcon(), "Zone 9");
draftOrderView.addTab(vietnameseOrder, new QIcon(), "Zone 10");
draftOrderView.addTab(indianOrder, new QIcon(), "Zone 11");
draftOrderView.addTab(arabicOrder, new QIcon(), "Zone 12");
draftOrderView.addTab(subsaharanOrder, new QIcon(), "Zone 13");
draftOrderView.addTab(greekOrder, new QIcon(), "Zone 14");
draftOrderView.addTab(scandinavianOrder, new QIcon(), "Zone 15");



const draftClassButton = new QPushButton();

draftClassButton.setObjectName("draftClassButton");
draftClassButton.setText("View Draft Classes");
draftClassButton.addEventListener("released", () => {
  
  draftClassButton.setDisabled(true);
  thedraftButton.setDisabled(false);
  stacked.setCurrentWidget(draftClassView);
})
draftClassButton.setDisabled(true);

const draftClassView = new QTabWidget();
draftClassView.setObjectName("draftClassView");
const draftClassViewLayout = new FlexLayout();
draftClassView.setLayout(draftClassViewLayout);

const draftClassheaders: string[] = ["Name", "Overall", "Power", "Speed", "Eye", "Tackle", "Break Tackle", "Block", "Break Block", "Awareness", "Growth", "Age"];

const americanDraft = new QTreeWidget();
americanDraft.setHeaderLabels(draftClassheaders);
const arabicDraft = new QTreeWidget();
arabicDraft.setHeaderLabels(draftClassheaders);
const chineseDraft = new QTreeWidget();
chineseDraft.setHeaderLabels(draftClassheaders);
const easterneuroDraft = new QTreeWidget();
easterneuroDraft.setHeaderLabels(draftClassheaders);
const frenchDraft = new QTreeWidget();
frenchDraft.setHeaderLabels(draftClassheaders);
const germanDraft = new QTreeWidget();
germanDraft.setHeaderLabels(draftClassheaders);
const greekDraft = new QTreeWidget();
greekDraft.setHeaderLabels(draftClassheaders);
const hispanicDraft = new QTreeWidget();
hispanicDraft.setHeaderLabels(draftClassheaders);
const indianDraft = new QTreeWidget();
indianDraft.setHeaderLabels(draftClassheaders);
const italianDraft = new QTreeWidget();
italianDraft.setHeaderLabels(draftClassheaders);
const japaneseDraft = new QTreeWidget();
japaneseDraft.setHeaderLabels(draftClassheaders);
const koreanDraft = new QTreeWidget();
koreanDraft.setHeaderLabels(draftClassheaders);
const scandinavianDraft = new QTreeWidget();
scandinavianDraft.setHeaderLabels(draftClassheaders);
const subsaharanDraft = new QTreeWidget();
subsaharanDraft.setHeaderLabels(draftClassheaders);
const vietnameseDraft = new QTreeWidget();
vietnameseDraft.setHeaderLabels(draftClassheaders);

const draftClassObj: any = {american: americanDraft, hispanic: hispanicDraft, chinese: chineseDraft, japanese: japaneseDraft, italian: italianDraft, german: germanDraft, french: frenchDraft, easterneuro: easterneuroDraft, korean: koreanDraft, vietnamese: vietnameseDraft, indian: indianDraft, arabic: arabicDraft, subsaharan: subsaharanDraft, greek: greekDraft, scandinavian: scandinavianDraft};



draftClassView.addTab(americanDraft, new QIcon(), "Zone 1");
draftClassView.addTab(hispanicDraft, new QIcon(), "Zone 2");
draftClassView.addTab(chineseDraft, new QIcon(), "Zone 3");
draftClassView.addTab(japaneseDraft, new QIcon(), "Zone 4");
draftClassView.addTab(italianDraft, new QIcon(), "Zone 5");
draftClassView.addTab(germanDraft, new QIcon(), "Zone 6");
draftClassView.addTab(frenchDraft, new QIcon(), "Zone 7");
draftClassView.addTab(easterneuroDraft, new QIcon(), "Zone 8");
draftClassView.addTab(koreanDraft, new QIcon(), "Zone 9");
draftClassView.addTab(vietnameseDraft, new QIcon(), "Zone 10");
draftClassView.addTab(indianDraft, new QIcon(), "Zone 11");
draftClassView.addTab(arabicDraft, new QIcon(), "Zone 12");
draftClassView.addTab(subsaharanDraft, new QIcon(), "Zone 13");
draftClassView.addTab(greekDraft, new QIcon(), "Zone 14");
draftClassView.addTab(scandinavianDraft, new QIcon(), "Zone 15");

let simdraftclicked: Boolean = false;
const thedraftButton = new QPushButton();

thedraftButton.setObjectName("thedraftButton");
thedraftButton.setText("The Draft");
thedraftButton.addEventListener("released", () => {
  
  thedraftButton.setDisabled(true);
  draftSigningsButton.setDisabled(false);
  stacked.setCurrentWidget(draftBoard);
  let round1 = draft[0];
  let round2 = draft[1];
  let round1obj: any = {american: [], hispanic: [], chinese: [], japanese: [], italian: [], german: [], french: [], easterneuro: [], korean: [], vietnamese: [], indian: [], arabic: [], subsaharan: [], greek: [], scandinavian: []};
  let round2obj: any = {american: [], hispanic: [], chinese: [], japanese: [], italian: [], german: [], french: [], easterneuro: [], korean: [], vietnamese: [], indian: [], arabic: [], subsaharan: [], greek: [], scandinavian: []};
  for (let m=0;m<round1.length;m++) {
    round1obj[round1[m][2]].push(round1[m]);
  }
  for (let m=0;m<round2.length;m++) {
    round2obj[round2[m][2]].push(round2[m]);
  }
  let zone1: any = [round1obj.american, round2obj.american];
  let zone2: any = [round1obj.hispanic, round2obj.hispanic];
  let zone3: any = [round1obj.chinese, round2obj.chinese];
  let zone4: any = [round1obj.japanese, round2obj.japanese];
  let zone5: any = [round1obj.italian, round2obj.italian];
  let zone6: any = [round1obj.german, round2obj.german];
  let zone7: any = [round1obj.french, round2obj.french];
  let zone8: any = [round1obj.easterneuro, round2obj.easterneuro];
  let zone9: any = [round1obj.korean, round2obj.korean];
  let zone10: any = [round1obj.vietnamese, round2obj.vietnamese];
  let zone11: any = [round1obj.indian, round2obj.indian];
  let zone12: any = [round1obj.arabic, round2obj.arabic];
  let zone13: any = [round1obj.subsaharan, round2obj.subsaharan];
  let zone14: any = [round1obj.greek, round2obj.greek];
  let zone15: any = [round1obj.scandinavian, round2obj.scandinavian];
  let zoneArr: any = [zone1, zone2, zone3, zone4, zone5, zone6, zone7, zone8, zone9, zone10, zone11, zone12, zone13, zone14, zone15];
  let i = 0;
  let j = 0;
  let r = 0;
  let roundKeys: any = Object.keys(round1obj);
  let treeitems: any = {american: [], hispanic: [], chinese: [], japanese: [], italian: [], german: [], french: [], easterneuro: [], korean: [], vietnamese: [], indian: [], arabic: [], subsaharan: [], greek: [], scandinavian: []};
  roundLabel.setText(`Round 1`);
  roundLabel.repaint();
  for (let zx=0;zx<zonepicksArr.length;zx++) {
    for (let v=0;v<rookiesugh[roundKeys[zx]].length;v++) {
      let item = new QTreeWidgetItem();
      item.setText(0, rookiesugh[roundKeys[zx]][v].name);
      item.setData(1, 0, rookiesugh[roundKeys[zx]][v].overall);
      item.setData(2, 0, rookiesugh[roundKeys[zx]][v].power);
      item.setData(3, 0, rookiesugh[roundKeys[zx]][v].speed);
      item.setData(4, 0, rookiesugh[roundKeys[zx]][v].eye);
      item.setData(5, 0, rookiesugh[roundKeys[zx]][v].tackle);
      item.setData(6, 0, rookiesugh[roundKeys[zx]][v].breaktackle);
      item.setData(7, 0, rookiesugh[roundKeys[zx]][v].block);
      item.setData(8, 0, rookiesugh[roundKeys[zx]][v].breakblock);
      item.setData(9, 0, rookiesugh[roundKeys[zx]][v].awareness);
      item.setText(10, rookiesugh[roundKeys[zx]][v].potential);
      item.setData(11, 0, rookiesugh[roundKeys[zx]][v].age);
      treeitems[roundKeys[zx]].push(rookiesugh[roundKeys[zx]][v].name);
      zonepicksArr[zx].addTopLevelItem(item);
    }
  }
  stacked.setCurrentWidget(draftBoard);
  async function nextPick (intime: number, outtime: number) {
    selectionLabel.setText("");
    draftingteamLabel.repaint();
    pickLabel.setText(`Pick ${(j+1)}`);
    pickLabel.repaint();
    draftingteamLabel.setText(zoneArr[i][r][j][0]);
    draftingteamLabel.repaint();
    nextteamLabel.setText(zoneArr[i][r][j+1][0]);
    nextteamLabel.repaint();
    return new Promise ((resolve, reject) => {
      try {
    let x = setTimeout(() => {
        clearTimeout(x);
        resolve(outtime);
}, intime)
      } catch (err) {
        reject(err);
      }
}).then(() => {
          
          selectionLabel.setText(zoneArr[i][r][j][1].name);
          let index = treeitems[roundKeys[i]].indexOf(zoneArr[i][r][j][1].name);
          let firstpart = treeitems[roundKeys[i]].slice(0, index);
          let secondpart = treeitems[roundKeys[i]].slice(index+1);
          treeitems[roundKeys[i]] = firstpart.concat(secondpart);
          zonepicksArr[i].takeTopLevelItem(index);
        j++;
        if (j === zoneArr[i][r].length-1) {
          r++;
          roundLabel.setText("Round 2");
          roundLabel.repaint();
          j = 0;
        }
        if (r === 2) {
          r = 0;
          roundLabel.setText("Round 1");
          roundLabel.repaint();
          j = 0;
          zonelabelArr[i].setInlineStyle("font-size: '10px'; color: #580000");
          i++;
          if (i<zoneArr.length) {
          zonelabelArr[i].setInlineStyle("font-size: '10px'; color: #cc0000;");
          zonePicks.setCurrentWidget(zonepicksArr[i]);
          }
        }
        return new Promise ((resolve, reject) => {
          try {
            let x = setTimeout( () => {
              clearTimeout(x);
              resolve("whatever")
      }, outtime);
      } catch (err) {
        reject(err);
      }
    })
  });
}
  async function pickSwitcher(x: number, y: number) {
    let thistimer = await nextPick(x, y);
    return thistimer;
  }
  async function dumbLoop () {
   do {
    if (teamsentered.includes(zoneArr[i][r][j][0]) == true) {
      await pickSwitcher(3000, 4000);
    } else {
      if (simdraftclicked == true) {
    await pickSwitcher(100, 1);
      } else {
        await pickSwitcher(3000, 4000);
      }
    }
    console.log(i);
  } while (i<zoneArr.length);
  round1 = null;
round2 = null;
round1obj = null;
round2obj = null;
treeitems = null;
roundKeys = null;
}
dumbLoop();
})
thedraftButton.setDisabled(true);

const zonesWidg = new QWidget();
zonesWidg.setObjectName("zonesWidg");
const zonesWidgLayout = new FlexLayout();
zonesWidg.setLayout(zonesWidgLayout);
zonesWidg.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start'; justify-content: 'space-between'; width: 50px;");

let Zone1label = new QLabel();
Zone1label.setText("Zone 1");
Zone1label.setInlineStyle("font-size: '10px'; color: #cc0000");
let Zone2label = new QLabel();
Zone2label.setText("Zone 2");
Zone2label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone3label = new QLabel();
Zone3label.setText("Zone 3");
Zone3label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone4label = new QLabel();
Zone4label.setText("Zone 4");
Zone4label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone5label = new QLabel();
Zone5label.setText("Zone 5");
Zone5label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone6label = new QLabel();
Zone6label.setText("Zone 6");
Zone6label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone7label = new QLabel();
Zone7label.setText("Zone 7");
Zone7label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone8label = new QLabel();
Zone8label.setText("Zone 8");
Zone8label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone9label = new QLabel();
Zone9label.setText("Zone 9");
Zone9label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone10label = new QLabel();
Zone10label.setText("Zone 10");
Zone10label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone11label = new QLabel();
Zone11label.setText("Zone 11");
Zone11label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone12label = new QLabel();
Zone12label.setText("Zone 12");
Zone12label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone13label = new QLabel();
Zone13label.setText("Zone 13");
Zone13label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone14label = new QLabel();
Zone14label.setText("Zone 14");
Zone14label.setInlineStyle("font-size: '10px'; color: #580000;");
let Zone15label = new QLabel();
Zone15label.setText("Zone 15");
Zone15label.setInlineStyle("font-size: '10px'; color: #580000;");

zonesWidgLayout.addWidget(Zone1label);
zonesWidgLayout.addWidget(Zone2label);
zonesWidgLayout.addWidget(Zone3label);
zonesWidgLayout.addWidget(Zone4label);
zonesWidgLayout.addWidget(Zone5label);
zonesWidgLayout.addWidget(Zone6label);
zonesWidgLayout.addWidget(Zone7label);
zonesWidgLayout.addWidget(Zone8label);
zonesWidgLayout.addWidget(Zone9label);
zonesWidgLayout.addWidget(Zone10label);
zonesWidgLayout.addWidget(Zone11label);
zonesWidgLayout.addWidget(Zone12label);
zonesWidgLayout.addWidget(Zone13label);
zonesWidgLayout.addWidget(Zone14label);
zonesWidgLayout.addWidget(Zone15label);

let zonelabelArr: QLabel[] = [Zone1label, Zone2label, Zone3label, Zone4label, Zone5label, Zone6label, Zone7label, Zone8label, Zone9label, Zone10label, Zone11label, Zone12label, Zone13label, Zone14label, Zone15label];

const draftBoard = new QWidget();
draftBoard.setObjectName("draftBoard");
const draftBoardLayout = new FlexLayout();
draftBoard.setLayout(draftBoardLayout);
draftBoard.setInlineStyle("flex-direction: 'row';");

let roundLabel = new QLabel();
roundLabel.setText("Round 1");
let pickLabel = new QLabel();
pickLabel.setText("Pick 1");
pickLabel.setInlineStyle("width: 75px");
let draftingteamLabel = new QLabel();
draftingteamLabel.setInlineStyle("font-size: 30px; width: 700px;");
let selectionTextLabel = new QLabel();
selectionTextLabel.setText("Selection:");
let selectionLabel = new QLabel();
selectionLabel.setInlineStyle("font-size: 50px; width: 700px;");
let nextUpLabel = new QLabel();
nextUpLabel.setText("Next Up:");
let nextteamLabel = new QLabel();
nextteamLabel.setInlineStyle("width: 100px;");
let ontheclockLabel = new QLabel();
ontheclockLabel.setText("On the Clock:");
const teamstowatchLabel = new QLabel();
teamstowatchLabel.setText("Teams to Watch");

const nextNext = new QWidget();
nextNext.setObjectName("nextNext");
const nextNextLayout = new FlexLayout();
nextNext.setLayout(nextNextLayout);
nextNext.setInlineStyle("flex-direction: 'row'; align-items: 'flex-end';")


nextNextLayout.addWidget(nextUpLabel);
nextNextLayout.addWidget(nextteamLabel);

const roundandpick = new QWidget();
roundandpick.setObjectName("roundandpick");
const roundandpickLayout = new FlexLayout();
roundandpick.setLayout(roundandpickLayout);
roundandpick.setInlineStyle("flex-direction: 'row'; align-items: 'flex-start';");

roundandpickLayout.addWidget(roundLabel);
roundandpickLayout.addWidget(pickLabel);

const pickTile = new QWidget();
pickTile.setObjectName("pickTile");
const pickTileLayout = new FlexLayout();
pickTile.setLayout(pickTileLayout);
pickTile.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start';");

pickTileLayout.addWidget(roundandpick);
pickTileLayout.addWidget(ontheclockLabel);
pickTileLayout.addWidget(draftingteamLabel);
pickTileLayout.addWidget(selectionTextLabel);
pickTileLayout.addWidget(selectionLabel);

const teamstowatchTile = new QWidget();
teamstowatchTile.setObjectName("teamstowatchTile");
const teamstowatchTileLayout = new FlexLayout();
teamstowatchTile.setLayout(teamstowatchTileLayout);
teamstowatchTile.setInlineStyle("flex-direction: 'column';");

let teamsentered: any = [];
const draftteamswatch = new QTextEdit();
draftteamswatch.setInlineStyle("font-size: '15px';");
draftteamswatch.setObjectName("draftteamswatch");
draftteamswatch.setInlineStyle("width: 150px;");


const simDraft = new QPushButton();

simDraft.setObjectName("simDraft");
simDraft.setText("Sim Draft");
simDraft.addEventListener("released", () => {
  
  simdraftclicked = true;
})
simDraft.setInlineStyle("font-size: 10px;");

const simtonextTeam = new QPushButton();

simtonextTeam.setObjectName("simtonextTeam");
simtonextTeam.setText("Sim to Watched");
simtonextTeam.addEventListener("released", () => {
  
  let testReg = new RegExp(/\b.+\b/g);
  let data = draftteamswatch;
  teamsentered = data.toPlainText().match(testReg);
  console.log(teamsentered);
  simdraftclicked = true;
})
simtonextTeam.setInlineStyle("font-size: 10px;");

const simBar = new QWidget();
simBar.setObjectName("simBar");
const simBarLayout = new FlexLayout();
simBar.setLayout(simBarLayout);
simBar.setInlineStyle("flex-direction: 'row'; justify-content: 'space-between'; width: 125px;");

simBarLayout.addWidget(simDraft);
simBarLayout.addWidget(simtonextTeam);

teamstowatchTileLayout.addWidget(teamstowatchLabel);
teamstowatchTileLayout.addWidget(draftteamswatch);
teamstowatchTileLayout.addWidget(simBar);

const draftBoardTopBar = new QWidget();
draftBoardTopBar.setObjectName("draftBoardTopBar");
const draftBoardTopBarLayout = new FlexLayout();
draftBoardTopBar.setLayout(draftBoardTopBarLayout);
draftBoardTopBar.setInlineStyle("flex-direction: 'row'; align-items: 'flex-start'; justify-content: 'space-between';");

draftBoardTopBarLayout.addWidget(pickTile);
draftBoardTopBarLayout.addWidget(teamstowatchTile);

const zonePicks = new QStackedWidget();
zonePicks.setObjectName("zonePicks");

let zone1picks: QTreeWidget = new QTreeWidget();
zone1picks.setObjectName("zone1picks");
zone1picks.setHeaderLabels(progressionheaders);

let zone2picks: QTreeWidget = new QTreeWidget();
zone2picks.setObjectName("zone1picks");
zone2picks.setHeaderLabels(progressionheaders);

let zone3picks: QTreeWidget = new QTreeWidget();
zone3picks.setObjectName("zone1picks");
zone3picks.setHeaderLabels(progressionheaders);

let zone4picks: QTreeWidget = new QTreeWidget();
zone4picks.setObjectName("zone1picks");
zone4picks.setHeaderLabels(progressionheaders);

let zone5picks: QTreeWidget = new QTreeWidget();
zone5picks.setObjectName("zone1picks");
zone5picks.setHeaderLabels(progressionheaders);

let zone6picks: QTreeWidget = new QTreeWidget();
zone6picks.setObjectName("zone1picks");
zone6picks.setHeaderLabels(progressionheaders);

let zone7picks: QTreeWidget = new QTreeWidget();
zone7picks.setObjectName("zone1picks");
zone7picks.setHeaderLabels(progressionheaders);

let zone8picks: QTreeWidget = new QTreeWidget();
zone8picks.setObjectName("zone1picks");
zone8picks.setHeaderLabels(progressionheaders);

let zone9picks: QTreeWidget = new QTreeWidget();
zone9picks.setObjectName("zone1picks");
zone9picks.setHeaderLabels(progressionheaders);

let zone10picks: QTreeWidget = new QTreeWidget();
zone10picks.setObjectName("zone1picks");
zone10picks.setHeaderLabels(progressionheaders);

let zone11picks: QTreeWidget = new QTreeWidget();
zone11picks.setObjectName("zone1picks");
zone11picks.setHeaderLabels(progressionheaders);

let zone12picks: QTreeWidget = new QTreeWidget();
zone12picks.setObjectName("zone1picks");
zone12picks.setHeaderLabels(progressionheaders);

let zone13picks: QTreeWidget = new QTreeWidget();
zone13picks.setObjectName("zone1picks");
zone13picks.setHeaderLabels(progressionheaders);

let zone14picks: QTreeWidget = new QTreeWidget();
zone14picks.setObjectName("zone1picks");
zone14picks.setHeaderLabels(progressionheaders);

let zone15picks: QTreeWidget = new QTreeWidget();
zone15picks.setObjectName("zone1picks");
zone15picks.setHeaderLabels(progressionheaders);

const zonepicksArr: QTreeWidget[] = [zone1picks, zone2picks, zone3picks, zone4picks, zone5picks, zone6picks, zone7picks, zone8picks, zone9picks, zone10picks, zone11picks, zone12picks, zone13picks, zone14picks, zone15picks];

zonePicks.addWidget(zone1picks);
zonePicks.addWidget(zone2picks);
zonePicks.addWidget(zone3picks);
zonePicks.addWidget(zone4picks);
zonePicks.addWidget(zone5picks);
zonePicks.addWidget(zone6picks);
zonePicks.addWidget(zone7picks);
zonePicks.addWidget(zone8picks);
zonePicks.addWidget(zone9picks);
zonePicks.addWidget(zone10picks);
zonePicks.addWidget(zone11picks);
zonePicks.addWidget(zone12picks);
zonePicks.addWidget(zone13picks);
zonePicks.addWidget(zone14picks);
zonePicks.addWidget(zone15picks);

const draftBoardRight = new QWidget();
draftBoardRight.setObjectName("draftBoardRight");
const draftBoardRightLayout = new FlexLayout();
draftBoardRight.setLayout(draftBoardRightLayout);

draftBoardRightLayout.addWidget(draftBoardTopBar);
draftBoardRightLayout.addWidget(nextNext);
draftBoardRightLayout.addWidget(zonePicks);

draftBoardLayout.addWidget(zonesWidg);
draftBoardLayout.addWidget(draftBoardRight);

const draftSigningsButton = new QPushButton();

draftSigningsButton.setObjectName("draftSigningsButton");
draftSigningsButton.setText("Draft Signings");
draftSigningsButton.addEventListener("released", () => {
  
  draftSigningsButton.setDisabled(true);
  freeAgentsButton.setDisabled(false);
  stacked.setCurrentWidget(draftSigningsView);
})
draftSigningsButton.setDisabled(true);

const draftSigningsView = new QTabWidget();
draftSigningsView.setObjectName("draftSigningsView");
const draftSigningsViewLayout = new FlexLayout();
draftSigningsView.setLayout(draftSigningsViewLayout);

const draftSigningsheaders: string[] = ["Team", "Drafted", "Signed"];

const americanSignings = new QTreeWidget();
americanSignings.setHeaderLabels(draftSigningsheaders);
const arabicSignings = new QTreeWidget();
arabicSignings.setHeaderLabels(draftSigningsheaders);
const chineseSignings = new QTreeWidget();
chineseSignings.setHeaderLabels(draftSigningsheaders);
const easterneuroSignings = new QTreeWidget();
easterneuroSignings.setHeaderLabels(draftSigningsheaders);
const frenchSignings = new QTreeWidget();
frenchSignings.setHeaderLabels(draftSigningsheaders);
const germanSignings = new QTreeWidget();
germanSignings.setHeaderLabels(draftSigningsheaders);
const greekSignings = new QTreeWidget();
greekSignings.setHeaderLabels(draftSigningsheaders);
const hispanicSignings = new QTreeWidget();
hispanicSignings.setHeaderLabels(draftSigningsheaders);
const indianSignings = new QTreeWidget();
indianSignings.setHeaderLabels(draftSigningsheaders);
const italianSignings = new QTreeWidget();
italianSignings.setHeaderLabels(draftSigningsheaders);
const japaneseSignings = new QTreeWidget();
japaneseSignings.setHeaderLabels(draftSigningsheaders);
const koreanSignings = new QTreeWidget();
koreanSignings.setHeaderLabels(draftSigningsheaders);
const scandinavianSignings = new QTreeWidget();
scandinavianSignings.setHeaderLabels(draftSigningsheaders);
const subsaharanSignings = new QTreeWidget();
subsaharanSignings.setHeaderLabels(draftSigningsheaders);
const vietnameseSignings = new QTreeWidget();
vietnameseSignings.setHeaderLabels(draftSigningsheaders);

const draftSigningsObj: any = {american: americanSignings, hispanic: hispanicSignings, chinese: chineseSignings, japanese: japaneseSignings, italian: italianSignings, german: germanSignings, french: frenchSignings, easterneuro: easterneuroSignings, korean: koreanSignings, vietnamese: vietnameseSignings, indian: indianSignings, arabic: arabicSignings, subsaharan: subsaharanSignings, greek: greekSignings, scandinavian: scandinavianSignings};



draftSigningsView.addTab(americanSignings, new QIcon(), "Zone 1");
draftSigningsView.addTab(hispanicSignings, new QIcon(), "Zone 2");
draftSigningsView.addTab(chineseSignings, new QIcon(), "Zone 3");
draftSigningsView.addTab(japaneseSignings, new QIcon(), "Zone 4");
draftSigningsView.addTab(italianSignings, new QIcon(), "Zone 5");
draftSigningsView.addTab(germanSignings, new QIcon(), "Zone 6");
draftSigningsView.addTab(frenchSignings, new QIcon(), "Zone 7");
draftSigningsView.addTab(easterneuroSignings, new QIcon(), "Zone 8");
draftSigningsView.addTab(koreanSignings, new QIcon(), "Zone 9");
draftSigningsView.addTab(vietnameseSignings, new QIcon(), "Zone 10");
draftSigningsView.addTab(indianSignings, new QIcon(), "Zone 11");
draftSigningsView.addTab(arabicSignings, new QIcon(), "Zone 12");
draftSigningsView.addTab(subsaharanSignings, new QIcon(), "Zone 13");
draftSigningsView.addTab(greekSignings, new QIcon(), "Zone 14");
draftSigningsView.addTab(scandinavianSignings, new QIcon(), "Zone 15");

const freeAgentsButton = new QPushButton();

freeAgentsButton.setObjectName("freeAgentsButton");
freeAgentsButton.setText("Free Agent Signings");
freeAgentsButton.addEventListener("released", () => {
  
  freeAgentsButton.setDisabled(true);
  finishOffseasonButton.setDisabled(false);
  stacked.setCurrentWidget(freeAgentsView);
})

freeAgentsButton.setDisabled(true);

const freeAgentsView = new QWidget();
freeAgentsView.setObjectName("freeAgentsView");
const freeAgentsViewLayout = new FlexLayout();
freeAgentsView.setLayout(freeAgentsViewLayout);

const freeAgentsSignings = new QTabWidget();

const faSigningsheaders: string[] = ["Name", "Team", "Overall", "Power", "Speed", "Eye", "Tackle", "Break Tackle", "Block", "Break Block", "Awareness", "Growth", "Age"];

const americanFAs = new QTreeWidget();
americanFAs.setHeaderLabels(faSigningsheaders);
americanFAs.setSortingEnabled(true);
const arabicFAs = new QTreeWidget();
arabicFAs.setHeaderLabels(faSigningsheaders);
arabicFAs.setSortingEnabled(true);
const chineseFAs = new QTreeWidget();
chineseFAs.setHeaderLabels(faSigningsheaders);
chineseFAs.setSortingEnabled(true);
const easterneuroFAs = new QTreeWidget();
easterneuroFAs.setHeaderLabels(faSigningsheaders);
easterneuroFAs.setSortingEnabled(true);
const frenchFAs = new QTreeWidget();
frenchFAs.setHeaderLabels(faSigningsheaders);
frenchFAs.setSortingEnabled(true);
const germanFAs = new QTreeWidget();
germanFAs.setHeaderLabels(faSigningsheaders);
germanFAs.setSortingEnabled(true);
const greekFAs = new QTreeWidget();
greekFAs.setHeaderLabels(faSigningsheaders);
greekFAs.setSortingEnabled(true);
const hispanicFAs = new QTreeWidget();
hispanicFAs.setHeaderLabels(faSigningsheaders);
hispanicFAs.setSortingEnabled(true);
const indianFAs = new QTreeWidget();
indianFAs.setHeaderLabels(faSigningsheaders);
indianFAs.setSortingEnabled(true);
const italianFAs = new QTreeWidget();
italianFAs.setHeaderLabels(faSigningsheaders);
italianFAs.setSortingEnabled(true);
const japaneseFAs = new QTreeWidget();
japaneseFAs.setHeaderLabels(faSigningsheaders);
japaneseFAs.setSortingEnabled(true);
const koreanFAs = new QTreeWidget();
koreanFAs.setHeaderLabels(faSigningsheaders);
koreanFAs.setSortingEnabled(true);
const scandinavianFAs = new QTreeWidget();
scandinavianFAs.setHeaderLabels(faSigningsheaders);
scandinavianFAs.setSortingEnabled(true);
const subsaharanFAs = new QTreeWidget();
subsaharanFAs.setHeaderLabels(faSigningsheaders);
subsaharanFAs.setSortingEnabled(true);
const vietnameseFAs = new QTreeWidget();
vietnameseFAs.setHeaderLabels(faSigningsheaders);
vietnameseFAs.setSortingEnabled(true);

const faSigningsObj: any = {american: americanFAs, hispanic: hispanicFAs, chinese: chineseFAs, japanese: japaneseFAs, italian: italianFAs, german: germanFAs, french: frenchFAs, easterneuro: easterneuroFAs, korean: koreanFAs, vietnamese: vietnameseFAs, indian: indianFAs, arabic: arabicFAs, subsaharan: subsaharanFAs, greek: greekFAs, scandinavian: scandinavianFAs};



freeAgentsSignings.addTab(americanFAs, new QIcon(), "Zone 1");
freeAgentsSignings.addTab(hispanicFAs, new QIcon(), "Zone 2");
freeAgentsSignings.addTab(chineseFAs, new QIcon(), "Zone 3");
freeAgentsSignings.addTab(japaneseFAs, new QIcon(), "Zone 4");
freeAgentsSignings.addTab(italianFAs, new QIcon(), "Zone 5");
freeAgentsSignings.addTab(germanFAs, new QIcon(), "Zone 6");
freeAgentsSignings.addTab(frenchFAs, new QIcon(), "Zone 7");
freeAgentsSignings.addTab(easterneuroFAs, new QIcon(), "Zone 8");
freeAgentsSignings.addTab(koreanFAs, new QIcon(), "Zone 9");
freeAgentsSignings.addTab(vietnameseFAs, new QIcon(), "Zone 10");
freeAgentsSignings.addTab(indianFAs, new QIcon(), "Zone 11");
freeAgentsSignings.addTab(arabicFAs, new QIcon(), "Zone 12");
freeAgentsSignings.addTab(subsaharanFAs, new QIcon(), "Zone 13");
freeAgentsSignings.addTab(greekFAs, new QIcon(), "Zone 14");
freeAgentsSignings.addTab(scandinavianFAs, new QIcon(), "Zone 15");

let faWeekLabel = new QLabel();
faWeekLabel.setInlineStyle("font-size: 30px");
faWeekLabel.setText("Week 1");

let faWeek: number = 0;
const nextWeekButton = new QPushButton();

nextWeekButton.setText("Next Week");
nextWeekButton.addEventListener("released", () => {
  
  let tracker = signedFas;
  let faKeys = Object.keys(faSigningsObj);
  if (faWeek < 4) {
  for (let i=0;i<signedFas[faWeek].length;i++) {
    let item = signedFas[faWeek][i];
    for (let z=0;z<allFas.length;z++) {
      if (allFas[z].text(0) == item[1].name) {
        allFas[z].setText(1, item[0]);
      }
    }
  }
  faWeek = faWeek + 1;
  faWeekLabel.setText(`Week ${faWeek + 1}`);
  faWeekLabel.repaint();
} else {
  return;
}
})

const freeAgentButtonBar = new QWidget();
freeAgentButtonBar.setInlineStyle("flex-direction: 'row'; align-items: 'flex-end';");
const freeAgentsButtonBarLayout = new FlexLayout();
freeAgentButtonBar.setLayout(freeAgentsButtonBarLayout);

freeAgentsButtonBarLayout.addWidget(nextWeekButton);

freeAgentsViewLayout.addWidget(faWeekLabel);
freeAgentsViewLayout.addWidget(freeAgentButtonBar);
freeAgentsViewLayout.addWidget(freeAgentsSignings);

offseasonLayout.addWidget(retireesButton);
offseasonLayout.addWidget(progressionButton);
offseasonLayout.addWidget(draftOrderButton);
offseasonLayout.addWidget(draftClassButton);
offseasonLayout.addWidget(thedraftButton);
offseasonLayout.addWidget(draftSigningsButton);
offseasonLayout.addWidget(freeAgentsButton);
offseasonLayout.addWidget(finishOffseasonButton);

stacked.addWidget(offseasonView);
stacked.addWidget(retireesView);
stacked.addWidget(progressionView);
stacked.addWidget(draftOrderView);
stacked.addWidget(draftClassView);
stacked.addWidget(draftBoard);
stacked.addWidget(draftSigningsView);
stacked.addWidget(freeAgentsView);
stacked.addWidget(addorremoveTeamsScreen);
stacked.addWidget(addteamsScreen);
stacked.addWidget(removeteamsScreen);


function seasonRecordRecord() {
  try {
let recordEx = new RegExp(/.+ (\d+)/g);
let teambreak = new RegExp(/.+/g);
let recordCheck: any[] = [];
let premTeams = fs.readFileSync(`./dist/src/records/Premier/Teams.txt`, 'utf8');
let transTeams = fs.readFileSync(`./dist/src/records/Transitional/Teams.txt`, 'utf8');
let midTeams = fs.readFileSync(`./dist/src/records/Middle/Teams.txt`, 'utf8');
let entTeams = fs.readFileSync(`./dist/src/records/Entry/Teams.txt`, 'utf8');
let premiers = premTeams.match(teambreak);
let transitionals = transTeams.match(teambreak);
let middles = midTeams.match(teambreak);
let entries = entTeams.match(teambreak);
let folderArr = ["Premier", "Transitional", "Middle", "Entry"];
let teamsArr = [premiers, transitionals, middles, entries];
for (let xg=0;xg<teamsArr.length;xg++) {
  let leagueDiv: any = {};
  for (let gh=0;gh<teamsArr[xg]!.length;gh++) {
    let thisteam: any = teamToObject(teamsArr[xg]![gh]);
    leagueDiv[thisteam.roster[0].name] = individualStats(thisteam.roster[0].name, season);
    leagueDiv[thisteam.roster[1].name] = individualStats(thisteam.roster[1].name, season);
    leagueDiv[thisteam.roster[2].name] = individualStats(thisteam.roster[2].name, season);
    leagueDiv[thisteam.roster[3].name] = individualStats(thisteam.roster[3].name, season);
    leagueDiv[thisteam.roster[4].name] = individualStats(thisteam.roster[4].name, season);
    leagueDiv[thisteam.roster[5].name] = individualStats(thisteam.roster[5].name, season);
    fs.writeFileSync('leagueDiv.txt', `${thisteam.name}, ${leagueDiv[thisteam.roster[0].name]}, ${leagueDiv[thisteam.roster[5].name]}, ${leagueDiv[thisteam.roster[1].name]}, ${leagueDiv[thisteam.roster[2].name]}, ${leagueDiv[thisteam.roster[3].name]}, ${leagueDiv[thisteam.roster[4].name]}`, {flag: "a"});
  }
  recordCheck = Object.keys(leagueDiv);
for (let fi=0;fi<recordCheck.length;fi++) {
  let statsarr: any = Object.keys(leagueDiv[recordCheck[fi]]);
  for (let di=1;di<statsarr.length;di++) {
    let statdata = fs.readFileSync(`./dist/src/records/${folderArr[xg]}/Season/${recordFiles[di-1]}.txt`, 'utf8');
    let thisrecord = statdata.match(recordEx);
    if (leagueDiv[recordCheck[fi]][statsarr[di]] > 0) {
      if (thisrecord == null) {
        fs.writeFileSync(`./dist/src/records/${folderArr[xg]}/Season/${recordFiles[di-1]}.txt`, `${recordCheck[fi]} ${leagueDiv[recordCheck[fi]][statsarr[di]]}\n`, {flag: "w"});
      } else {
        let index = thisrecord.length;
          for (let si=0;si<thisrecord.length;si++) {
            let numx= new RegExp(/\d+/);
            let amount = numx.exec(thisrecord[si]);
            let singlerecord = Number(amount);
            if (leagueDiv[recordCheck[fi]][statsarr[di]] > singlerecord) {
              index = si;
              si = 10000;
            } else {
              continue;
            }
          }
          if (index === thisrecord.length && thisrecord.length < 10) {
            fs.writeFileSync(`./dist/src/records/${folderArr[xg]}/Season/${recordFiles[di-1]}.txt`, `${recordCheck[fi]} ${leagueDiv[recordCheck[fi]][statsarr[di]]}\n`, {flag: "a"});
          } else if (index < thisrecord.length && thisrecord.length < 10) {
            fs.writeFileSync(`./dist/src/records/${folderArr[xg]}/Season/${recordFiles[di-1]}.txt`, `${thisrecord![thisrecord.length-1]}\n`, {flag: "a"});
            statdata = fs.readFileSync(`./dist/src/records/${folderArr[xg]}/Season/${recordFiles[di-1]}.txt`, 'utf8');
            let newlist = statdata.match(recordEx);
            for (let bi=thisrecord.length;bi>index;bi--) {
            statdata = statdata.replace(newlist![bi], `${newlist![bi-1]}`);
            }
            statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${leagueDiv[recordCheck[fi]][statsarr[di]]}`);
            fs.writeFileSync(`./dist/src/records/${folderArr[xg]}/Season/${recordFiles[di-1]}.txt`, `${statdata}`, {flag: "w"});
          } else if (index < thisrecord.length && thisrecord.length === 10) {
                for (let ai=9;ai>index;ai--) {
                  statdata = statdata.replace(thisrecord![ai], thisrecord![ai-1]);
                }
                statdata = statdata.replace(`${thisrecord![index]}`, `${recordCheck[fi]} ${leagueDiv[recordCheck[fi]][statsarr[di]]}`);
                fs.writeFileSync(`./dist/src/records/${folderArr[xg]}/Season/${recordFiles[di-1]}.txt`, `${statdata}`, {flag: "w"});
          } else {
          continue;
        }
      }
    }
    }
  }
}
  } catch (err) {
    fs.writeFileSync(`Season Records Error.txt`, `${err}`, {flag: "w"});
  }
}


backButton.hide();

const backBar = new QWidget();
backBar.setObjectName('backBar');
const backBarLayout = new FlexLayout();
backBar.setLayout(backBarLayout);
backBar.setFixedWidth(stacked.width());
backBar.setInlineStyle("flex-direction: 'row'; align-items: 'flex-start';");


backBarLayout.addWidget(backButton);

const menuView = new QWidget();
menuView.setObjectName('menuView');
const menuViewLayout = new FlexLayout();
menuView.setLayout(menuViewLayout);
menuView.setInlineStyle("flex-direction: 'column'; align-items: 'flex-start'; justify-content: 'space-between'; height: 300px; align-self: 'flex-end';");

menuViewLayout.addWidget(gamesView);
menuViewLayout.addWidget(statsbutton);
menuViewLayout.addWidget(addorremoveteamsbutton);
menuViewLayout.addWidget(runOffseasonButton);

const stackedandback = new QWidget();
stackedandback.setObjectName('stackedandback');
const stackedandbackLayout = new FlexLayout();
stackedandback.setLayout(stackedandbackLayout);
stackedandback.setInlineStyle("flex-direction: 'column';");

stackedandbackLayout.addWidget(backBar);
stackedandbackLayout.addWidget(stacked);




rootLayout.addWidget(menuView);
rootLayout.addWidget(stackedandback);
win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #myroot {
      background-image: url(./dist/src/assets/stadium.jpg);
      background-repeat: no-repeat;
      flex: 1;
      height: "100%";
      width: "100%";
      flex-direction: 'row';
      padding: 20%;
    }
    QTabWidget {
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      border: 3px double inset;
      border-color: #cc0000;
      font-size: 10px;
    }
    QPushButton {
      text-align: left;
      background: transparent;
      font-size: 20px;
      font-weight: bold;
      font-family: "Copperplate Gothic Bold";
      color: #fffdd0;
    }
    QPushButton:hover {
      color: #fffff7;
    }
    QPushButton:pressed {
      color: #4169e1;
      position: relative;
      margin-top: 2px;
    }
    QTreeWidgetItem {
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: rgba(0, 102, 178, 75%);
    }
    QComboBox {
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: transparent;
      font-size: 10px;
    }
    QRadioButton {
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: transparent;
      font-size: 10px;
    }
    QScrollBar::handle {
      background-color: rgb(112, 128, 144);
    }
    QScrollBar::down-arrow {
      background-color: rgb(112, 128, 144);
    }
    QScrollBar::up-arrow {
      background-color: rgb(112, 128, 144);
    }
    QScrollBar::left-arrow {
      background-color: rgb(112, 128, 144);
    }
    QScrollBar::right-arrow {
      background-color: rgb(112, 128, 144);
    }
    QLabel {
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      font-size: 10px;
    }
    QScrollArea {
      border: 3px double inset;
      border-color: #cc0000;
    }
    QLineEdit {
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: transparent;
    }
    QTextEdit {
      font-family: 'Century';
      font-weight: bold;
      border: 3px double inset;
      border-color: #cc0000;
      color: #fffdd0;
      background-color: transparent;
    }
    QTreeWidget {
      border: 3px double inset;
      font-family: 'Century';
      color: #fffdd0;
      border-color: #cc0000;
      background-color: rgba(0, 102, 178, 75%);
    }
    #recordLabel {
      height: 10px;
    }
    #mylabel {
      font-size: 16px;
      font-weight: bold;
      padding: 1;
    }
    #gamesView {
      height: "10%";
    }
    #statsbutton {
      height: "10%";
    }
    #offseason{
      height: "10%";
    }
    #addteams {
      height: "5%";
    }
    #stacked {
      flex-wrap: 'wrap';
    }
    #stackedandback {
      justify-content: 'space-between';
      padding-left: 10px;
    }
    #teamStatsView {
      flex-direction: 'row';
      align-items: 'center';
      justify-content: 'space-between';
      align-content: 'stretch';
    }
    #tsvLeftCol {
      flex: 1;
      flex-direction: column;
      align-self: 'stretch';
      justify-content: 'space-between';
      padding-right: 5px;
    }
    #tsvRightCol {
      flex: 4;
      align-self: stretch;
    }
    #logButton {
      flex: 1;
      height: 5px;
      align-self: 'flex-end';
    }
    #watchGame {
      flex-direction: 'column';
      justify-content: 'space-between';
      align-self: 'stretch';
    }
    #watchGameText {
      flex-direction: 'column';
      justify-content: 'center';
      align-content: 'center';
      align-self: 'stretch';
      padding-right: 55px;
      background-color: rgba(0, 102, 178, 75%);
    }
    #wgControl {
      flex-direction: 'column';
      align-content: 'center';
    }
    #wgMiddleBar {
      flex-direction: 'column';
      align-items: 'flex-start';
    }
    #pbWidg {
      flex-direction: 'row';
      align-self: 'stretch';
      justify-content: 'center';
      padding-right: 20px;
    }
    #sliderWidg {
      flex-direction: 'row';
      align-self: 'stretch';
      justify-content: 'center';
      padding-right: 50px;
    }
    #playpauseWidg {
      flex-direction: 'row';
      align-self: 'stretch';
      justify-content: 'center';
      padding-right: 40px;
    }
    #actionLabel {
      align-self: 'stretch';
      text-align: 'center';
    }
    #boxscore {
      width: 400%;
      flex-direction: 'row';
      align-content: 'center';
      justify-content: 'space-between';
      align-self: 'center';
      border: 1px solid;
    }
    #boxscorebox {
      width: 20px;
      background-color: white;
      color: black;
      border: 1px solid;
    }
    #underBoxBar {
      width: 400%;
      height: 20px;
      flex-direction: 'row';
      justify-content: 'space-between';
      align-items: 'flex-start';
      align-self: 'center';
    }
    #nextGameButton {
      text-align: right;
    }
    #watchGameTopBar {
      flex-direction: 'row';
      justify-content: 'space-between';
      align-items: 'flex-end';
      padding-right: 30px;
    }
    #gamestatsscreen {
      flex-direction: 'column';
      justify-content: 'space-between';
    }
    #teamInput {
      flex: 12;
      align-self: 'stretch';
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: transparent;
    }
    #teamview {
      flex-direction: 'column';
      align-items: 'stretch';
      justify-content: 'space-between';
      align-content: 'stretch';
    }
    #prevnextsearch {
      flex-direction: 'column';
     
    }
    #nameOvr {
      flex-direction: 'column';
    }
    #nameovrNext {
      flex-direction: 'row';
      align-items: 'flex-start';
      justify-content: 'space-between';
    }
    #dropMenu {
      align-self: 'stretch';
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: rgba(0, 102, 178, 75%); 
    }
    #teamroster {
      align-self: 'stretch';
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: rgba(0, 102, 178, 75%); 
    }
    #prevnext {
      flex-direction: 'row';
      align-self: 'flex-start';
    }
    #teamnamelabel {
      font-size: 40px;
      font-family: "Copperplate Gothic Bold";
      width: 700px;
    }
    #playerfirstnamelabel {
      font-size: 40px;
      font-family: "Copperplate Gothic Bold";
      width: 600px;
    }
    #playerview {
      flex-direction: 'column';
      justify-content: 'space-between';
    }
    #playerviewTop {
      flex-direction: 'row';
      justify-content: 'space-between';
    }
    #prevnextPlayer {
      flex-direction: 'row';
    }
    #prevnextPlayerSearch {
      flex-direction: 'column';
      align-self: 'flex-start';
    }
    #statsandratings {
      flex-direction: 'row';
      justify-content: 'space-between';
      flex-wrap: 'wrap';
      height: 160px;
    }
    #overallrating {
      font-size: 125px;
      padding-right: 20px;
      flex: 1;
    }
    #playerstats {
      flex-direction: 'column';
      flex-wrap: 'wrap';
      align-items: 'flex-start';
      align-content: 'space-between';
      width: 400px;
      flex: 1;
    }
    #statline {
      flex-direction: 'row';
      align-items: 'flex-start';
      align-content: 'space-between';
    }
    #ratingtable {
      flex-direction: 'column';
      flex: 1;
    }
    #statlabel {
      width: 100px;
    }
    #ratinglabel {
      align-self: 'flex-end';
      width: 50px;
    }
    #stats {
      font-family: 'Century';
      font-weight: bold;
      color: #fffdd0;
      background-color: rgba(0, 102, 178, 75%);
    }
    #statsSelect {
      flex-direction: 'column';
      align-items: 'flex-start';
      justify-content: 'center';
    }
    #sportPhase {
      flex-direction: 'column';
      align-items: 'flex-start';
      justify-content: 'center';
      align-content: 'space-around';
    }
    #schedView {
      flex-direction: 'column';
    }
    #schedule {
      width: 1500px;
      height: 1000px;
      flex-wrap: 'wrap';
      flex-direction: 'column';
      justify-content: 'flex-start';
      align-content: 'flex-start';
      background-color: rgba(0, 102, 178, 75%);
    }
    #scheduleTopBar {
      flex: 1;
    }
    #scheduleBottomBar {
      flex: 1;
    }
    #matchup {
      height: 50%;
      width: 200px;
      padding-bottom: 10%;
      padding-top: 10%;
      border: 1px solid;
      border-color: rgb(112, 128, 144);
      align-items: 'flex-start';
      align-content: 'flex-start';
      flex-wrap: 'wrap';
      flex-direction: 'column';
    }
    #away {
    }
    #home {
    }
    #checkbox {
      padding-top: 6px;
    }
    #scorebox {
      position: absolute;
      color: black;
      width: 15%;
      right: 15%;
      top: 10%;
      background-color: 'white';
    }
    #scorebox2 {
      position: absolute;
      color: black;
      width: 15%;
      right: 15%;
      top: 25%;
      background-color: 'white';
    }
  `
);
win.show();

(global as any).win = win;
} catch (err) {
  fs.writeFileSync('Crash log.txt', `${err}`, {flag: "w"})
}

