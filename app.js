const zipInput = document.getElementById("zipInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");
const statusEl = document.getElementById("status");
const followingCountEl = document.getElementById("followingCount");
const followersCountEl = document.getElementById("followersCount");
const unfollowersCountEl = document.getElementById("unfollowersCount");
const resultList = document.getElementById("resultList");
const searchInput = document.getElementById("searchInput");
const igOpenHelpEl = document.getElementById("igOpenHelp");

let latestUnfollowers = [];

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b42318" : "#54707a";
}

function setCounts(following, followers, unfollowers) {
  followingCountEl.textContent = String(following);
  followersCountEl.textContent = String(followers);
  unfollowersCountEl.textContent = String(unfollowers);
}

function normalizeUsername(value) {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

function getInstagramWebProfileUrl(username) {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

function shouldTryInstagramAppOpen() {
  const ua = navigator.userAgent || "";
  const isiPadDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod/i.test(ua) || isiPadDesktopMode;
}

function isIOSOrIPad() {
  const ua = navigator.userAgent || "";
  const isiPadDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(ua) || isiPadDesktopMode;
}

function isInAppBrowser() {
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line|Twitter|TikTok/i.test(ua);
}

function updateOpenHelpText() {
  if (!igOpenHelpEl) {
    return;
  }

  if (!isIOSOrIPad()) {
    igOpenHelpEl.hidden = true;
    return;
  }

  if (isInAppBrowser()) {
    igOpenHelpEl.textContent = "iPhone/iPad: ถ้าไม่เด้งเข้าแอพ IG ให้เปิดหน้านี้ด้วย Safari แล้วกดปุ่ม เปิดในแอพ IG อีกครั้ง";
  } else {
    igOpenHelpEl.textContent = "iPhone/iPad: กดปุ่ม เปิดในแอพ IG เพื่อพยายามเปิดแอพโดยตรง หากเปิดไม่ได้ ระบบจะพาไปหน้าเว็บแทน";
  }

  igOpenHelpEl.hidden = false;
}

function openInstagramProfile(username) {
  const webUrl = getInstagramWebProfileUrl(username);

  if (!shouldTryInstagramAppOpen()) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const deepLink = `instagram://user?username=${encodeURIComponent(username)}`;
  let didHidePage = false;

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      didHidePage = true;
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.location.href = deepLink;

  setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (!didHidePage) {
      window.location.href = webUrl;
    }
  }, 900);
}

function renderList(items) {
  resultList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "ไม่พบรายชื่อที่ไม่ฟอลกลับ";
    resultList.appendChild(empty);
    return;
  }

  for (const username of items) {
    const li = document.createElement("li");

    const itemActions = document.createElement("div");
    itemActions.className = "list-actions";

    const profileLink = document.createElement("a");
    profileLink.className = "profile-link";
    profileLink.textContent = username;
    profileLink.href = getInstagramWebProfileUrl(username);
    profileLink.target = "_blank";
    profileLink.rel = "noopener noreferrer";
    profileLink.addEventListener("click", (event) => {
      event.preventDefault();
      openInstagramProfile(username);
    });

    itemActions.appendChild(profileLink);

    if (shouldTryInstagramAppOpen()) {
      const openInAppBtn = document.createElement("button");
      openInAppBtn.type = "button";
      openInAppBtn.className = "open-app-btn";
      openInAppBtn.textContent = "เปิดในแอพ IG";
      openInAppBtn.addEventListener("click", () => {
        openInstagramProfile(username);
      });
      itemActions.appendChild(openInAppBtn);
    }

    li.appendChild(itemActions);
    resultList.appendChild(li);
  }
}

function parseFollowersJson(rawObj) {
  const followersSet = new Set();

  if (!Array.isArray(rawObj)) {
    return followersSet;
  }

  for (const item of rawObj) {
    if (item && Array.isArray(item.string_list_data)) {
      for (const data of item.string_list_data) {
        const username = normalizeUsername(data?.value);
        if (username) {
          followersSet.add(username);
        }
      }
    }
  }

  return followersSet;
}

function parseFollowingJson(rawObj) {
  const followingSet = new Set();
  const items = Array.isArray(rawObj)
    ? rawObj
    : Array.isArray(rawObj?.relationships_following)
      ? rawObj.relationships_following
      : [];

  for (const item of items) {
    const username = normalizeUsername(item?.title);
    if (username) {
      followingSet.add(username);
    }
  }

  return followingSet;
}

function toSortedArray(setObj) {
  return Array.from(setObj).sort((a, b) => a.localeCompare(b));
}

function toCsvRows(usernames) {
  const header = "username";
  const body = usernames.map((u) => `"${u.replaceAll('"', '""')}"`);
  return [header, ...body].join("\n");
}

async function findAndReadJson(zip) {
  let followersPath = "";
  let followingPath = "";

  for (const path of Object.keys(zip.files)) {
    const clean = path.toLowerCase();
    if (zip.files[path].dir) {
      continue;
    }

    if (!followersPath && clean.endsWith("followers_1.json")) {
      followersPath = path;
    }

    if (!followingPath && clean.endsWith("following.json")) {
      followingPath = path;
    }
  }

  if (!followersPath || !followingPath) {
    throw new Error("หาไฟล์ followers_1.json หรือ following.json ใน ZIP ไม่เจอ");
  }

  const followersText = await zip.file(followersPath).async("string");
  const followingText = await zip.file(followingPath).async("string");

  return {
    followersPath,
    followingPath,
    followersObj: JSON.parse(followersText),
    followingObj: JSON.parse(followingText)
  };
}

async function analyzeZip() {
  const selectedFile = zipInput.files?.[0];
  if (!selectedFile) {
    setStatus("กรุณาเลือกไฟล์ ZIP ก่อน", true);
    return;
  }

  try {
    analyzeBtn.disabled = true;
    searchInput.disabled = true;
    downloadCsvBtn.disabled = true;
    setStatus("กำลังวิเคราะห์ไฟล์ ZIP...");

    const zip = await JSZip.loadAsync(selectedFile);
    const { followersPath, followingPath, followersObj, followingObj } = await findAndReadJson(zip);

    const followersSet = parseFollowersJson(followersObj);
    const followingSet = parseFollowingJson(followingObj);

    const unfollowers = toSortedArray(new Set([...followingSet].filter((u) => !followersSet.has(u))));

    latestUnfollowers = unfollowers;
    setCounts(followingSet.size, followersSet.size, unfollowers.length);
    renderList(unfollowers);

    searchInput.disabled = false;
    downloadCsvBtn.disabled = unfollowers.length === 0;

    setStatus(
      `วิเคราะห์เสร็จ: พบไฟล์ ${followersPath} และ ${followingPath}`
    );
  } catch (error) {
    latestUnfollowers = [];
    renderList([]);
    setCounts(0, 0, 0);
    setStatus(`เกิดข้อผิดพลาด: ${error.message}`, true);
  } finally {
    analyzeBtn.disabled = false;
  }
}

function filterResults() {
  const keyword = normalizeUsername(searchInput.value);
  const filtered = latestUnfollowers.filter((u) => u.includes(keyword));
  renderList(filtered);
}

function downloadCsv() {
  if (!latestUnfollowers.length) {
    return;
  }

  const csvContent = toCsvRows(latestUnfollowers);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "instagram-unfollowers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

zipInput.addEventListener("change", () => {
  const selectedFile = zipInput.files?.[0];
  analyzeBtn.disabled = !selectedFile;

  if (!selectedFile) {
    setStatus("ยังไม่ได้เลือกไฟล์");
    return;
  }

  setStatus(`เลือกไฟล์แล้ว: ${selectedFile.name}`);
});

analyzeBtn.addEventListener("click", analyzeZip);
searchInput.addEventListener("input", filterResults);
downloadCsvBtn.addEventListener("click", downloadCsv);

updateOpenHelpText();
renderList([]);