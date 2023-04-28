async function loadLeftPanel() {
  const currentUrl = window.location.href.split("/").pop();
  
  let response=  await ipcRenderer.sendSync('user', {name:"name", action:"getCookie"})  
  let left_panel_html = [];
  left_panel_html.push(`<div class="container text-center" style="border-bottom: 1px solid gray; padding: 13px !important;"><i class="fa fa-graduation-cap fa-2x"></i>&ensp;<span style="font-size: 2rem;">CSMS</span>   </div>  
<a href="settings.html"  draggable="false" style="text-decoration: none;color:white;"><div class="container text-center" style=" margin-top: 15px !important"><i class="fa fa-user-circle fa-5x" aria-hidden="true"></i></div>
<div class="container text-center" style="margin-top:3px;font-weight: bold; margin-bottom: 13px;">`+response.data+` </div></a> 
  `);

  left_panel_html.push(
    `<div class="container text-center"> <a href="index.html" draggable="false"><button  class="nave-button ` +
      (currentUrl == "index.html" ? "active" : "normal") +
      `"><i class="fa fa-tachometer" aria-hidden="true"></i>&ensp;Dashboard</button></a></div>`
  );

  left_panel_html.push(
    `<div class="container text-center"> <a href="issue.html" draggable="false"><button  class="nave-button ` +
      (currentUrl == "issue.html" ? "active" : "normal") +
      `"><i class="fa fa-cloud-upload"></i>&ensp;Issue Book</button></a></div>`
  );
  left_panel_html.push(
    `<div class="container text-center"> <a href="receive.html" draggable="false"><button  class="nave-button ` +
      (currentUrl == "receive.html" ? "active" : "normal") +
      `"><i class="fa fa-cloud-download"></i>&ensp;Receive Book</button></a></div>`
  );
  
  left_panel_html.push(
    `<div class="container text-center"> <a href="student.html" draggable="false"><button  class="nave-button ` +
      (currentUrl == "student.html" ? "active" : "normal") +
      `"><i class="fa fa-address-card"></i>&ensp;Student</button></a></div>`
  );

  left_panel_html.push(
    `<div class="container text-center"> <a href="master_book.html" draggable="false"><button  class="nave-button ` +
      (currentUrl == "master_book.html" ? "active" : "normal") +
      `"><i class="fa fa-book"></i>&ensp;Master Book</button></a></div>`
  );
  left_panel_html.push(
    `<div class="container text-center"> <a href="child_book.html" draggable="false"><button  class="nave-button ` +
      (currentUrl == "child_book.html" ? "active" : "normal") +
      `"><i class="fa fa-edit"></i>&ensp;Child Book</button></a></div>`
  );

  left_panel_html.push(
    `<div  class="container text-center"> <a href="settings.html"  draggable="false"><button  class="nave-button ` +
      (currentUrl == "settings.html" ? "active" : "normal") +
      `"><i class="fa fa-gears" ></i>&ensp;Settings</button></a></div>`
  );

  left_panel_html.push(
    `<div class="container text-center"> <a href="about.html" draggable="false"><button  class="nave-button ` +
      (currentUrl == "about.html" ? "active" : "normal") +
      `"><i class="fa fa-align-left"></i>&ensp;About</button></a></div>
`
  );

  return left_panel_html.join(" ");
}
