const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const $ = require( "jquery" );
const fs = require('fs');
const http = require('http');
const https = require('https');
const { ipcRenderer } = require('electron');
const { clipboard } = require('electron');
const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({ transport: "ipc" });
const os = require('os');

let isCracked = true;
let usrCheck = true;
let remMe = false;
let includeSnapshots = false;
let includeBeta = false;
let includeAlpha = false;
let mcVersList;
let releases;
let hideLauncher = true;
let vList = [];
let tvl = false;
let mcIsOn = false;

let stillHoverCheck = {
    "value": false,
    "left": "",
    "top": "" 
}

let opts = {
    clientPackage: null,
    // For production launchers, I recommend not passing 
    // the getAuth function through the authorization field and instead
    // handling authentication outside before you initialize
    // MCLC so you can handle auth based errors and validation!
    authorization: Authenticator.getAuth("undefined"),
    root: "./.lite_launcher",
    version: {
        number: "1.16.5",
        type: "release"
    },
    memory: {
        max: "6G",
        min: "4G"
    }

    // overrides: {
    //     meta: "https://launchermeta.mojang.com", // List of versions.
    //     resource: "https://resources.download.minecraft.net", // Minecraft resources.
    //     mavenForge: "http://files.minecraftforge.net/maven/", // Forge resources.
    //     defaultRepoForge: "https://libraries.minecraft.net/", // for Forge only, you need to redefine the library url in the version json.
    //     fallbackMaven: "https://search.maven.org/remotecontent?filepath="
    // }
}

window.onload = function () {
    document.getElementById('ls-info-cont').style.display = 'none';
    document.getElementById('ls-info-cont').style.left = '0px';
    document.getElementById('ls-versionlist-cont').style.display = 'none';
    document.getElementById('ls-versionlist-cont').style.left = '0px';

    $.getJSON('https://launchermeta.mojang.com/mc/game/version_manifest.json', function(data) {
        mcVersList = data;
        console.log(data);
        // opts.version.number = data.latest.release;
        opts.version.number = data.latest.release;
        opts.version.type = 'release';
        document.getElementById('l-dropdown-inp-vers').innerHTML = opts.version.number;
        vList = [];
        data.versions.forEach(element => {
            if ( element.type == 'release' || element.type == 'snapshot' || element.type == 'old_beta' || element.type == 'old_alpha' ) { vList.push(element); }
        });
    });

    console.log('RAM: ' + Math.floor(os.totalmem() / 1000000000) + 'G');

    opts.memory.max = Math.floor(Math.floor(os.totalmem() / 1000000000) / 2) + 'G';
    opts.memory.min = '1G';

    console.log('MEM: MAX: ' + opts.memory.max + ' MIN: ' + opts.memory.min);

    if ( process.platform == 'linux' ) {  }
}

document.addEventListener('click', function(event) {
    var isClickInsideA = document.getElementById('ls-versionlist-cont').contains(event.target);
    var isClickInsideB = document.getElementById('l-dropdown-inp-vers').contains(event.target);
  
    if ( !isClickInsideA && tvl == true && !isClickInsideB ) {
        document.getElementById('ls-versionlist-cont').style.display = 'none';
        tvl = false;
    } else {

    }
});

function changeVersion(id, type) {
    opts.version.number = id;
    opts.version.type = type;
    document.getElementById('l-dropdown-inp-vers').innerHTML = id;
    document.getElementById('ls-versionlist-cont').style.display = 'none';
    tvl = false;
}

function doWin (action) {
    if (action == 'minimize') { ipcRenderer.send('minimize-app'); }
    else if (action == 'maximize') { ipcRenderer.send('maximize-app'); }
    else if (action == 'close') { ipcRenderer.send('close-app'); }
    else if (action == 'devtools') { ipcRenderer.send('devtools'); }
}

function OfflineOrOnline() {
    if ( isCracked == true ) {
        isCracked = false;
        document.getElementById('password-inp').classList.remove('inp-disabled');
        document.getElementById('l-checkbox-inp-pass').classList.add('l-cb-filled');
    } else {
        isCracked = true;
        document.getElementById('password-inp').classList.add('inp-disabled');
        document.getElementById('l-checkbox-inp-pass').classList.remove('l-cb-filled');
    }
}

function RembrMe() {
    if ( remMe == false ) {
        remMe = true;
        document.getElementById('l-checkbox-inp-rme').classList.add('l-cb-filled');
    } else {
        remMe = false;
        document.getElementById('l-checkbox-inp-rme').classList.remove('l-cb-filled');
    }
}

function ToggleSnapshots() {
    if ( includeSnapshots == false ) {
        includeSnapshots = true;
        document.getElementById('l-checkbox-inp-snap').classList.add('l-cb-filled');
    } else {
        includeSnapshots = false;
        document.getElementById('l-checkbox-inp-snap').classList.remove('l-cb-filled');
    }
}

function toggleHideLauncher() {
    if ( hideLauncher == false ) {
        hideLauncher = true;
        document.getElementById('l-checkbox-inp-hide').classList.add('l-cb-filled');
    } else {
        hideLauncher = false;
        document.getElementById('l-checkbox-inp-hide').classList.remove('l-cb-filled');
    }
}

function checkUsernameInp() {
    let username = document.getElementById('username-inp').value;
    // console.log(username);
    if ( !/[^a-zA-Z0-9_]+/.test(username) && !/\s/.test(username) && username != '' && username != undefined ) {
        document.getElementById('username-inp').classList.remove('inp-err');
        document.getElementById('l-enter-btn').classList.remove('inp-disabled');
        usrCheck = true;
        // console.log('tru');
    } else {
        document.getElementById('username-inp').classList.add('inp-err');
        document.getElementById('l-enter-btn').classList.add('inp-disabled');
        usrCheck = false;
        // console.log('nope');
    }
}

function toggleVList(element) {
    if ( tvl == true ) { 
        tvl = false;
        document.getElementById('ls-versionlist-cont').style.display = 'none';
    } else {
        tvl = true;
        let a = $(element).css('width').replace('px', '') / 1;
        let b = $(element).css('height').replace('px', '') / 1;
        let c = $(element).position().left + ($(element).css('margin-left').replace('px', '') / 1);
        // let d = $(element).position().top + ($(element).css('margin-top').replace('px', '') / 1);
        let d = $(element).position().top;

        let wh = window.innerHeight / 1;
        let ww = window.innerWidth / 1;

        document.getElementById('ls-versionlist-cont').style.left = c + 'px';
        document.getElementById('ls-versionlist-cont').style.top = (d + b + 10) + 'px';
        document.getElementById('ls-versionlist-cont').style.display = 'flex';
        document.getElementById('ls-versionlist-cont').style.maxHeight = (wh - (d + b + 10) - 10) + 'px';

        document.getElementById('ls-versionlist-cont').innerHTML = '';
        vList.forEach(y => {
            if ( y.type == 'snapshot' && includeSnapshots == false ) { }
            else if ( y.type == 'old_beta' && includeBeta == false ) { }
            else if ( y.type == 'old_alpha' && includeAlpha == false ) { }
            else {
                document.getElementById('ls-versionlist-cont').innerHTML += '<div class="ls-vl-child" onclick="changeVersion(\'' + y.id + '\', \'' + y.type + '\')">' + y.id + '</div>';
            }
        });

    }
}

function tryMouseEnterCheck() {
    if ( stillHoverCheck.value == true ) {
        document.getElementById('ls-info-cont').style.left = stillHoverCheck.left;
        document.getElementById('ls-info-cont').style.top = stillHoverCheck.top;
        document.getElementById('ls-info-cont').style.display = 'flex';
    }
}

function mouseEnterCheck(element, info) {
    stillHoverCheck.value = true;
    let a = $(element).css('width').replace('px', '') / 1;
    let b = $(element).css('height').replace('px', '') / 1;
    let c = $(element).position().left + ($(element).css('margin-left').replace('px', '') / 1);
    // let d = $(element).position().top + ($(element).css('margin-top').replace('px', '') / 1);
    let d = $(element).position().top;
    document.getElementById('ls-info-cont').innerHTML = info;
    let e = $('#ls-info-cont').css('width').replace('px', '') / 1;

    stillHoverCheck.left = (a/2 + c - e/2) + 'px';
    stillHoverCheck.top = (b + d + 10) + 'px';

    setTimeout(tryMouseEnterCheck, 500);
}

function mouseLeaveCheck() {
    stillHoverCheck.value = false;
    document.getElementById('ls-info-cont').style.display = 'none';
}

async function lsEnter() {
    let username = document.getElementById('username-inp').value;
    let password = document.getElementById('password-inp').value;
    document.getElementById('l-enter-btn').classList.add('inp-disabled');
    if ( username == undefined || username == '' || usrCheck == false ) {
        document.getElementById('username-inp').classList.add('inp-err');
        document.getElementById('l-enter-btn').classList.add('inp-disabled');
        usrCheck = false;
        document.getElementById('l-enter-btn').classList.remove('inp-disabled');
    } else {
        document.getElementById('ls-loading-bar-cont').style.display = 'inline-block';
        document.getElementById('ls-loading-bar-cont').style.background = 'var(--background-dark-light)';
        document.getElementById('ls-loading-bar').style.display = 'flex';
        document.getElementById('ls-loading-bar').style.width = '50px';
        document.getElementById('ls-loading-bar').style.animation = 'lsLoading 2s infinite';
        document.getElementById('l-enter-btn').classList.add('inp-disabled');
        try { opts.authorization = await Authenticator.getAuth(username, password); }
        catch (err) {
            console.log(err);
            document.getElementById('ls-loading-bar-cont').style.display = 'inline-block';
            document.getElementById('ls-loading-bar-cont').style.background = 'var(--dnd-color)';
            document.getElementById('ls-loading-bar').style.animation = 'none';
            document.getElementById('ls-loading-bar').style.display = 'none';
            document.getElementById('l-enter-btn').classList.remove('inp-disabled');
            return;
        }
        document.getElementById('l-enter-btn').classList.add('inp-disabled');
        mcIsOn = true;
        await launcher.launch(opts);
    }
}

// launcher.launch(opts);

launcher.on('debug', (e) => {
    console.log('Debug >> ' + e);
    if (e.endsWith("java: not found"))  {
        alert('Error: Java Not Installed!');
    }
});
launcher.on('data', (e) => console.log('Data >> ' + e));
launcher.on('download', (e) => { 
    // console.log('Download >> ' + e);
    document.getElementById('ls-loading-bar-cont').style.display = 'inline-block';
    document.getElementById('ls-loading-bar-cont').style.background = 'var(--background-dark-light)';
    document.getElementById('ls-loading-bar').style.display = 'flex';
    document.getElementById('ls-loading-bar').style.animation = 'none';
    document.getElementById('ls-loading-bar').style.width = '0%';
});

launcher.on('download-status', (e) => { 
    // console.log('DS');
    // console.log(e);
    // document.getElementById('sloadbar').style.width = (e.current * 100 / e.total) + '%';
});

launcher.on('progress', (e) => { 
    // console.log('Progress ...............');
    // console.log(e);
    document.getElementById('ls-loading-bar').style.width = (e.task * 90 / e.total + 10) + '%';
});

launcher.on('package-extract', ( )=> {
    console.log('Package Extracted!');
})

launcher.on('arguments', (args) => {
    console.log('Arguments are set: ' + JSON.stringify(args));
    if ( hideLauncher == true ) { ipcRenderer.send('hideLauncher'); }
    document.getElementById('ls-loading-bar-cont').style.display = 'none';
    document.getElementById('ls-loading-bar').style.animation = 'none';
    mcIsOn = true;
    document.getElementById('l-enter-btn').classList.add('inp-disabled');
})

launcher.on('close', () => {
    console.log('Closing...');
    ipcRenderer.send('showLauncher');
    mcIsOn = false;
    document.getElementById('l-enter-btn').classList.remove('inp-disabled');
})