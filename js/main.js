const videoElement = document.querySelector('video');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [videoSelect];
const canvas = document.getElementById('canvasOutput');

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
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
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
    }
  }, false);
}

videoSelect.onchange = start;

start();


window.onload = function() {
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

  tracking.ColorTracker.registerColor('red', function(r, g, b) {

    /**
     * float hue = c.GetHue();
    float sat = c.GetSaturation();
    float lgt = c.GetLightness();

    if (lgt < 0.2)  return "Blacks";
    if (lgt > 0.8)  return "Whites";

    if (sat < 0.25) return "Grays";

    if (hue < 30)   return "Reds";
    if (hue < 90)   return "Yellows";
    if (hue < 150)  return "Greens";
    if (hue < 210)  return "Cyans";
    if (hue < 270)  return "Blues";
    if (hue < 330)  return "Magentas";
    return "Reds";
     */

    let hslVal = rgbToHsl(r,g,b);
    let hue = hslVal[0];
    let sat = hslVal[1];
    let lgt = hslVal[2];
    if (lgt < 0.4 || lgt>0.6   || sat < 0.25 ){
      return false;
    }
    if (hue < 30 || hue> 330){
      return true;
    }  
  
    // if (r > 200 && g < 100 && b < 100) {
    //   return true;
    // }
    // return false;
  });

  var tracker = new tracking.ColorTracker(['yellow', 'purple','red']);
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