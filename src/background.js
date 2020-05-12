/*
 *
 * Simple Kiosk
 * Copyright (c) 2020 Daniel Sage
 *
 */

// Define and bind the launch listener
chrome.app.runtime.onLaunched.addListener(() => {
  // Request that the system never go to sleep or dim the display
  chrome.power.requestKeepAwake("display")
  
  // Create a new window pointing to our designated page
  chrome.app.window.create("src/application.html", {
    id: "kiosk",
    bounds: {
      width: 1366,
      height: 768
    }
  }, onWindowCreated)
})

let onWindowCreated = async function (window) {
  window.onClosed.addListener(() => {
    chrome.power.releaseKeepAwake()
  })

  // get the current managed policies
  let policies = await getManagedPolicies()

  console.log(policies)
  console.log("pageUrl" in policies)
  console.log(policies.pageUrl)
  console.log(policies["pageUrl"])

  // check if policy contains a URL
  if ("pageUrl" in policies) {
    // get the window
    let window = chrome.app.window.get("kiosk").contentWindow

    // find the page webview on the document
    let webview = window.document.getElementById("page")

    // adjust the URL of the webview to match the newly received data
    webview.src = policies.pageUrl

    // // store the page URL in the window
    // window.contentWindow.policyUrl = policies["pageUrl"]
  }

  // ensure the URL is updated if the policy changes
  chrome.storage.onChanged.addListener((changes, area) => {
    // check if the area is the managed configuration
    if (area === "managed") {
      // check if the changes include the URL
      if ("pageUrl" in changes) {
        // get the window
        let window = chrome.app.window.get("kiosk").contentWindow

        // find the page webview on the document
        let webview = window.document.getElementById("page")

        // adjust the URL of the webview to match the newly received data
        webview.src = changes.pageUrl.newValue
      }
    }
  })

  chrome.power.requestKeepAwake("display")
}

// Define the method to get the managed policies
let getManagedPolicies = () => {
  // create a promise
  let promise = $.Deferred()

  // get all managed policies at once
  chrome.storage.managed.get(null, (data) => {
    // LOG: (managed policies retrieved)
    console.log("Managed policies have been retrieved")

    // resolve the promise
    promise.resolve(data)
  })

  return promise.promise()
}
