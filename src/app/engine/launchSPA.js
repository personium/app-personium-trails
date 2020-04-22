// Login
function(request){
  const tempHeaders = {"Content-Type":"text/html"};
  
  return {
    status: 200,
    headers: tempHeaders,
    body: [
      [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">',
      '</link>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">',
      '<title>Personium App</title>',
      '</head>',
      '<body style="margin: 0px" >',
      '<noscript>You need to enable JavaScript to run this app.</noscript>',
      '<div id="root"></div>',
      '<script type="text/javascript" src="/__/public/bundle.js">',
      '</script>',
      '</body>',
      '</html>',
      ].join('\n')
      // '<html>'+
      // '<HEAD><TITLE>SPA</TITLE></HEAD>' +
      // '<body>' + 
      // '<div id="root"></div>'+
      // '<script src="./__/html/js/app.js"></script>'+
      // '</body>' +
      // '</html>'
    ],
  };
}
