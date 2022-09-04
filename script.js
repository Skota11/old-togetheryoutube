const socket = io();
const room_enter = document.getElementById("room_enter")
const room_input = document.getElementById("room_input")
const displayname = document.getElementById("displayname")
const displayid = document.getElementById("youtubeid")
const msgbox = document.getElementById("msgbox")
const messages = document.getElementById("msglist")
const msg_form = document.getElementById("msg_form")
const ytid_input = document.getElementById("ytid")
const main = document.getElementById("main")
let roomname;
let oniframe = false;
const myid = Math.random().toString(32).substring(2);
let nowtime;
let state;
let lastedstate;
let noplaysignal = true;
let count = 0;

const tag = document.createElement('script') // scriptタグを生成
tag.src = "https://www.youtube.com/iframe_api"  // APIのURLを付与
const firstScriptTag = document.getElementsByTagName('script')[0] // 生成したタグをセット
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag) // HTML上に挿入
msg_form.addEventListener("submit", function(e){
    e.preventDefault();
});
msg_form.addEventListener('keypress', key_event);
function key_event(e) {
  console
  if (e.keyCode === 13) {
		socket.emit("msg" , {"room" : roomname , "value" : msgbox.value})

    msgbox.value = "";
	} 
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PAUSED) {
    nowtime = player.getCurrentTime()
    socket.emit("pauce", { "room": roomname, "time": nowtime, "id": myid })
  } else if (event.data == YT.PlayerState.PLAYING) {
    if (noplaysignal) {
      nowtime = player.getCurrentTime()
      socket.emit("play", { "room": roomname, "time": nowtime, "id": myid })
    }
  }
}

function enterroom() {
  roomname = room_input.value;
  socket.emit("join", roomname);

  room_enter.style.display = "none"
  main.style.display = "block"
  displayname.innerHTML = `Room: ${roomname}`
}
function ytidenter() {
  socket.emit('ytid_select', { "room": roomname, "value": ytid_input.value })
}
function msgsend() {
  socket.emit("msg" , {"room" : roomname , "value" : msgbox.value})
}
socket.on("join" , (msg) => {
  createText("誰か入ってきました")
})
socket.on("msg" , (msg) => {
  createText(msg)
})
socket.on("pauce", (time) => {
  if (time.id !== myid) {
    console.log("ポーズの関数です。違うユーザーが変えましたので")
    player.seekTo(time.time)
    player.pauseVideo()
  }

})
socket.on("play", (time) => {
  if (time.id !== myid) {
    player.seekTo(time.time)
    player.playVideo()
    noplaysignal = false;
    setTimeout(function() {
      noplaysignal = true;
    }, 2000);
  }
})
socket.on("ytid_select", (msg) => {
  displayid.innerHTML = `YoutubeId : ${msg}`
  if (oniframe) {
    player.destroy()
    player = new YT.Player('player', { // YT.Playerオブジェクトを作成（'player'は動画の挿入先のid名）
      videoId: msg,
      events: {
        'onStateChange': onPlayerStateChange // プレーヤーの状態が変更されたときに実行
      }
    })
  } else {
    oniframe = true;
    player = new YT.Player('player', { // YT.Playerオブジェクトを作成（'player'は動画の挿入先のid名）
      videoId: msg,
      events: {
        'onStateChange': onPlayerStateChange // プレーヤーの状態が変更されたときに実行
      }
    })
  }
})
async function createText(msg) {
  let div_text = document.createElement('div');
  div_text.id="text"+count; //アニメーション処理で対象の指定に必要なidを設定
  div_text.style="font-size: 40px;";
  count++;
  div_text.style.position = 'fixed'; //テキストのは位置を絶対位置にするための設定
  div_text.style.whiteSpace = 'nowrap' //画面右端での折り返しがなく、画面外へはみ出すようにする
  div_text.style.left = (document.documentElement.clientWidth) + 'px'; //初期状態の横方向の位置は画面の右端に設定
  var random = Math.round( Math.random()*document.documentElement.clientHeight/2 );
  div_text.style.top = random + 'px';  //初期状態の縦方向の位置は画面の上端から下端の間に設定（ランダムな配置に）
  div_text.appendChild(document.createTextNode(msg)); //画面上に表示されるテキストを設定
  document.body.appendChild(div_text); //body直下へ挿入

   //ライブラリを用いたテキスト移動のアニメーション： durationはアニメーションの時間、
   //        横方向の移動距離は「画面の横幅＋画面を流れるテキストの要素の横幅」、移動中に次の削除処理がされないようawait
  await gsap.to("#"+div_text.id, {duration: 15, x: -1*(document.documentElement.clientWidth+div_text.clientWidth)});

  div_text.parentNode.removeChild(div_text); //画面上の移動終了後に削除
}