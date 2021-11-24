const videoElement = document.querySelector('video');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [videoSelect];

function gotDevices(deviceInfos) {
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

let streaming = false;
let stream = null;
let vc = null;
let width = 0;
let height=0;

// let lower_green = [40,70,80];
// let upper_green = [70,255,255];

// let lower_red = [0,50,120];
// let upper_red = [10,255,255];

// let lower_blue = [90,60,0];
// let upper_blue = [121,255,255];


function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const videoSource = videoSelect.value;
  const constraints = {
    audio: false,
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints)
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(s){
    window.stream=s;
    videoElement.srcObject=s;
    videoElement.play();
    return navigator.mediaDevices.enumerateDevices();
  })
  .then(gotDevices)
  .catch(handleError);
  videoElement.addEventListener("canplay", function(ev){
    if (!streaming) {
      width = videoElement.clientWidth;
      height = videoElement.clientHeight / (videoElement.clientWidth/width);
      videoElement.setAttribute("width", width);
      videoElement.setAttribute("height", height);
      streaming = true;
    }
  }, false);
}


videoSelect.onchange = start;

start();


window.onload = function() {
  var canvas = document.getElementById('canvas');
  canvas.width=640;
  canvas.height=480;
  var context = canvas.getContext('2d');

  tracking.ColorTracker.registerColor('purple', function(r, g, b) {
    var dx = r - 120;
    var dy = g - 60;
    var dz = b - 210;

    if ((b - g) >= 100 && (r - g) >= 60) {
      return true;
    }
    return dx * dx + dy * dy + dz * dz < 3500;
  });

  var tracker = new tracking.ColorTracker(['yellow', 'purple']);
  tracker.setMinDimension(5);

  tracking.track('#video', tracker);

  tracker.on('track', function(event) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function(rect) {
      if (rect.color === 'custom') {
        rect.color = tracker.customColor;
      }

      context.strokeStyle = rect.color;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = '11px Helvetica';
      context.fillStyle = "#fff";
      context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
      context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    });
  });

  initGUIControllers(tracker);
};