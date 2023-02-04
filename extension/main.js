const activeEl = document.getElementById("active");
const originalEl = document.getElementById("original");
const schemeEl = document.getElementById("scheme");
const destinationEl = document.getElementById("destination");
const portEl = document.getElementById("port");
const pathEl = document.getElementById("path");

const checkValid = ({ original, destination, port, scheme, path }) => {
  return original && destination && port && scheme && path;
};

const resetRule = () => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
  });
};

const setRule = ({ original, destination, port, scheme, path }) => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        condition: {
          urlFilter: `*${original}*`,
          resourceTypes: ["main_frame"],
        },
        action: {
          type: "redirect",
          redirect: {
            // url: destination,
            transform: {
              scheme,
              host: destination,
              path,
              port,
            },
          },
        },
      },
    ],
  });
};

const changeSwitch = () => {
  const active = activeEl.checked;

  chrome.storage.local
    .get(["original", "scheme", "destination", "port", "path"])
    .then((result) => {
      if (active && !checkValid(result)) {
        alert("모든 내용을 입력하고 '적용하기'를 눌러주세요.");
        activeEl.checked = false;
        return;
      }

      chrome.storage.local.set({ active }).then(() => {
        console.log("change Switch complete");
      });

      if (active) {
        setRule(result);
      } else {
        resetRule();
      }
    });
};

const saveConfig = () => {
  const original = originalEl.value;
  const scheme = schemeEl.value;
  const destination = destinationEl.value;
  const port = portEl.value;
  const path = pathEl.value;
  const active = activeEl.checked;

  if (active && !checkValid({ original, destination, port, scheme, path })) {
    alert("모든 내용을 입력해주세요.");
    activeEl.checked = false;
    return;
  }

  chrome.storage.local
    .set({ original, scheme, destination, port, path })
    .then(() => {
      console.log("save config complete");
    });

  if (active) {
    setRule({ original, scheme, destination, port, path });
  }

  alert("저장되었습니다.\n");
};

const initInput = () => {
  chrome.storage.local
    .get(["active", "original", "scheme", "destination", "port", "path"])
    .then(({ active, original, scheme, destination, port, path }) => {
      activeEl.checked = active ?? false;
      originalEl.value = original ?? "";
      schemeEl.value = scheme ?? "https";
      destinationEl.value = destination ?? "localhost";
      portEl.value = port ?? 3000;
      pathEl.value = path ?? "/";
    });
};

document.getElementById("active").addEventListener("change", changeSwitch);
document.getElementById("submit").addEventListener("click", saveConfig);

initInput();
