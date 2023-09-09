document.getElementById("btn_get").addEventListener("click", function () {
  // アクティブなタブにメッセージを送信
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0]
    chrome.tabs.sendMessage(activeTab.id, { action: "fetch_data" })
  })
})
