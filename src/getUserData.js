export function getCurrentTabUrl() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]?.url || '');
    });
  });
}

export function getCurrentTimestamp() {
  return new Date().toISOString();
}

export function getGoogleEmail() {
  return new Promise((resolve, reject) => {
    chrome.identity.getProfileUserInfo((userInfo) => {
      if (userInfo && userInfo.email) {
        resolve(userInfo.email);
      } else {
        reject("Failed to get email");
      }
    });
  });
}
