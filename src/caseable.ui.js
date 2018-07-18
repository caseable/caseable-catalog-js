(function($){
  var catalog = require('./caseable.catalog');

  var caseableLogo = "<svg version=\"1.1\" id=\"Ebene_1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "\t viewBox=\"0 0 400 72.8\" style=\"enable-background:new 0 0 400 72.8;\" xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "\t.st0{fill:#505959;}\n" +
    "\t.st1{fill:#6BB3B3;}\n" +
    "</style>\n" +
    "<path id=\"Pfad_740\" class=\"st0\" d=\"M400,43.1c0-0.6-0.1-1.1-0.1-1.7c0-2.5-0.5-5-1.3-7.3c-0.8-2.1-1.9-4.1-3.4-5.8\n" +
    "\tc-1.5-1.7-3.4-3-5.5-3.8c-2.4-1-4.9-1.4-7.5-1.4c-2.6,0-5.3,0.5-7.7,1.5c-2.2,0.9-4.3,2.3-5.9,4.1c-1.7,1.7-3,3.8-3.9,6\n" +
    "\tc-0.9,2.4-1.4,4.9-1.4,7.4c0,2.6,0.4,5.1,1.3,7.5c0.8,2.3,2.1,4.4,3.8,6.1c1.7,1.8,3.8,3.2,6.1,4.2c2.7,1.1,5.5,1.6,8.3,1.5\n" +
    "\tc1.5,0,3-0.1,4.4-0.3c1.2-0.2,2.4-0.4,3.5-0.8c1.1-0.4,2.3-0.9,3.3-1.4c0.9-0.5,1.9-1,3-1.7l-3.2-6c-0.6,0.2-1.3,0.5-1.9,0.7\n" +
    "\tc-0.9,0.3-1.8,0.6-2.8,0.8c-1,0.2-2,0.4-2.9,0.6c-2.2,0.3-4.5,0.3-6.7-0.2c-1.1-0.3-2.2-0.7-3.1-1.4c-1-0.6-1.8-1.4-2.5-2.3\n" +
    "\tc-0.7-0.9-1.2-2-1.5-3.2l0-0.1l-0.2-2.1H400C400,43.7,400,43.4,400,43.1 M372.3,38.1l0.3-1.1c0.2-0.9,0.6-1.7,1-2.5\n" +
    "\tc0.4-0.8,1-1.6,1.8-2.2c0.8-0.7,1.7-1.2,2.7-1.5c1.2-0.4,2.5-0.6,3.8-0.5c1.2,0,2.4,0.2,3.5,0.5l0,0c0.9,0.3,1.7,0.9,2.4,1.5\n" +
    "\tc0.6,0.6,1.1,1.4,1.5,2.2c0.3,0.8,0.6,1.6,0.8,2.5l0.2,1.1L372.3,38.1z M288.8,60.4v-8.1h-5V37.7c0.1-2.2-0.3-4.5-1.1-6.5\n" +
    "\tc-0.7-1.6-1.7-3.1-3.1-4.2c-1.4-1.1-3-1.9-4.8-2.4c-2.1-0.5-4.2-0.8-6.3-0.8c-2.8,0-5.6,0.4-8.3,1.3c-2.4,0.8-4.7,1.9-6.9,3.3\n" +
    "\tl2.7,5.5c1.4-0.7,2.9-1.2,4.4-1.6c2-0.5,4.1-0.7,6.2-0.7c1.1,0,2.1,0.1,3.2,0.3c1,0.2,1.9,0.6,2.7,1.1c0.8,0.5,1.4,1.2,1.8,2\n" +
    "\tC274.8,36,275,37,275,38v2.3l-1.1-0.2c-1.2-0.3-2.5-0.5-3.9-0.7c-1.5-0.2-3-0.3-4.6-0.3c-2,0-4,0.3-6,0.8c-1.6,0.5-3,1.3-4.3,2.3\n" +
    "\tc-1.1,0.9-2,2.1-2.6,3.5c-0.6,1.4-0.9,2.9-0.9,4.5c0,1.5,0.3,3,0.9,4.4c0.6,1.3,1.5,2.5,2.6,3.5c1.2,1.1,2.7,1.9,4.2,2.4\n" +
    "\tc1.9,0.6,3.8,0.9,5.7,0.9c0.8,0,1.6,0,2.3-0.2c0.7-0.1,1.4-0.3,2-0.5c0.7-0.2,1.3-0.5,2-0.8c0.7-0.4,1.4-0.8,2.3-1.3l1.4-0.9v2.8\n" +
    "\tH288.8z M274.7,51.5c-1.2,0.9-2.4,1.6-3.8,2.2c-1.6,0.6-3.3,0.9-5,0.9c-1.6,0.1-3.1-0.4-4.3-1.4c-1-0.9-1.5-2.1-1.5-3.5\n" +
    "\tc0-0.7,0.2-1.4,0.5-2c0.3-0.6,0.7-1.1,1.3-1.4c0.5-0.4,1.1-0.7,1.7-0.9c0.6-0.2,1.3-0.3,1.9-0.3h9.6v6.1L274.7,51.5z M246.3,43.1\n" +
    "\tc0-0.6-0.1-1.1-0.1-1.7c0-2.5-0.5-5-1.3-7.3c-0.8-2.1-1.9-4.1-3.4-5.8c-1.5-1.7-3.4-3-5.5-3.8c-2.4-1-4.9-1.4-7.5-1.4\n" +
    "\tc-2.6,0-5.3,0.5-7.7,1.5c-2.2,0.9-4.3,2.3-5.9,4.1c-1.7,1.7-3,3.8-3.9,6c-0.9,2.4-1.4,4.9-1.4,7.4c0,2.6,0.4,5.1,1.3,7.5\n" +
    "\tc0.8,2.3,2.1,4.4,3.8,6.1c1.7,1.8,3.8,3.2,6.1,4.2c2.7,1.1,5.5,1.6,8.3,1.5c1.5,0,3-0.1,4.4-0.3c1.2-0.2,2.4-0.4,3.5-0.8\n" +
    "\tc1.1-0.4,2.3-0.9,3.3-1.4c0.9-0.5,1.9-1,3-1.7l-3.2-6c-0.6,0.2-1.3,0.5-1.9,0.7c-0.9,0.3-1.8,0.6-2.8,0.8c-1,0.2-2,0.4-2.9,0.6\n" +
    "\tc-2.2,0.3-4.5,0.3-6.7-0.2c-1.1-0.3-2.2-0.7-3.2-1.4c-1-0.6-1.8-1.4-2.5-2.3c-0.7-0.9-1.2-2-1.5-3.2l0-0.1l-0.2-2.1h27.8\n" +
    "\tC246.3,43.7,246.3,43.4,246.3,43.1 M218.6,38.1l0.3-1.1c0.2-0.9,0.6-1.7,1-2.5c0.4-0.8,1-1.6,1.8-2.2c0.8-0.7,1.7-1.2,2.7-1.5\n" +
    "\tc1.2-0.4,2.5-0.6,3.8-0.5c1.2,0,2.4,0.2,3.5,0.5l0,0c0.9,0.3,1.7,0.9,2.4,1.5c0.6,0.6,1.1,1.4,1.5,2.2c0.3,0.8,0.6,1.6,0.8,2.5\n" +
    "\tl0.2,1.1L218.6,38.1z M353.4,5.8v46.5h5.8v8.1h-20.9v-8.1h5.8V13.9h-5.8V5.8H353.4z M311.2,60.6c1.4,0.3,2.8,0.4,4.2,0.4\n" +
    "\tc2.6,0,5.1-0.5,7.4-1.5c2.2-0.9,4.2-2.3,5.8-4c1.6-1.7,2.9-3.7,3.8-6c0.9-2.3,1.4-4.8,1.4-7.3c0-2.5-0.5-5-1.4-7.3\n" +
    "\tc-0.9-2.2-2.2-4.3-3.9-6c-1.7-1.7-3.6-3.1-5.8-4c-2.3-1-4.8-1.5-7.4-1.5c-1.4,0-2.7,0.2-4,0.5c-1.3,0.3-2.6,0.8-3.8,1.4l-1.3,0.6\n" +
    "\tV5.8h-14.6v8.1h5.3v46.5h9.3v-1.5l1.3,0.5C308.6,60,309.9,60.4,311.2,60.6 M306.2,48.4V36.6l0.1-0.2c0.9-1.4,2.1-2.6,3.5-3.4\n" +
    "\tc1.4-0.8,3.1-1.2,4.7-1.2c1.3,0,2.6,0.2,3.8,0.7l0,0c1.2,0.5,2.3,1.2,3.2,2.1c0.9,1,1.7,2.1,2.1,3.4c0.5,1.4,0.8,2.9,0.8,4.4\n" +
    "\tc0,1.5-0.2,2.9-0.8,4.3c-0.5,1.2-1.2,2.4-2.2,3.3c-0.9,0.9-2,1.6-3.2,2.1c-1.2,0.5-2.5,0.7-3.9,0.7c-1.7,0-3.3-0.4-4.8-1.2\n" +
    "\tc-1.4-0.7-2.5-1.8-3.4-3.1L306.2,48.4z M164,60.4v-8.1h-5V37.7c0.1-2.2-0.3-4.5-1.1-6.5c-0.7-1.6-1.7-3.1-3.1-4.2\n" +
    "\tc-1.4-1.1-3-1.9-4.8-2.4c-2.1-0.5-4.2-0.8-6.3-0.8c-2.8,0-5.6,0.4-8.3,1.3c-2.4,0.8-4.7,1.9-6.9,3.3l2.7,5.5\n" +
    "\tc1.4-0.7,2.9-1.2,4.4-1.6c2-0.5,4.1-0.7,6.2-0.7c1.1,0,2.1,0.1,3.2,0.3c1,0.2,1.9,0.6,2.7,1.1c0.8,0.5,1.4,1.2,1.8,2\n" +
    "\tc0.4,0.9,0.7,1.9,0.6,2.9v2.3L149,40c-1.2-0.3-2.5-0.5-3.9-0.7c-1.5-0.2-3-0.3-4.6-0.3c-2,0-4,0.3-6,0.8c-1.6,0.5-3,1.3-4.3,2.3\n" +
    "\tc-1.1,0.9-2,2.1-2.6,3.5c-0.6,1.4-0.9,2.9-0.9,4.5c0,1.5,0.3,3,0.9,4.4c0.6,1.3,1.5,2.5,2.6,3.5c1.2,1.1,2.7,1.9,4.2,2.4\n" +
    "\tc1.9,0.6,3.8,0.9,5.7,0.9c0.8,0,1.6,0,2.3-0.2c0.7-0.1,1.4-0.3,2-0.5c0.7-0.2,1.3-0.5,2-0.8c0.7-0.4,1.4-0.8,2.3-1.3l1.4-0.9v2.8\n" +
    "\tH164z M149.8,51.5c-1.2,0.9-2.4,1.6-3.8,2.2c-1.6,0.6-3.3,0.9-5,0.9c-1.6,0.1-3.1-0.4-4.3-1.4c-1-0.9-1.5-2.1-1.5-3.5\n" +
    "\tc0-0.7,0.2-1.4,0.5-2c0.3-0.6,0.7-1.1,1.3-1.4c0.5-0.4,1.1-0.7,1.7-0.9c0.6-0.2,1.3-0.3,1.9-0.3h9.6v6.1L149.8,51.5z M176.8,58h-6\n" +
    "\tv-8.3h8.5c0.1,0.6,0.4,1.2,0.8,1.7c0.5,0.6,1.2,1.2,1.9,1.6c0.8,0.4,1.6,0.7,2.5,0.9c0.9,0.2,1.9,0.3,2.9,0.3c1.8,0.1,3.6-0.2,5.2-1\n" +
    "\tc1.2-0.5,1.9-1.7,1.9-3c0-0.9-0.3-1.8-1-2.4c-0.9-0.7-1.9-1.2-3-1.4l-7-1.5c-4.2-0.8-7.4-2.2-9.5-4c-2-1.7-3.1-4.3-3-6.9\n" +
    "\tc0-1.6,0.4-3.1,1.1-4.5c0.8-1.4,1.9-2.6,3.2-3.5c1.5-1,3.1-1.8,4.8-2.3c1.9-0.6,4-0.8,6-0.8c1.3,0,2.6,0.1,3.9,0.3\n" +
    "\tc1,0.2,2.1,0.4,3.1,0.7c0.8,0.2,1.6,0.6,2.3,1c0.6,0.3,1.2,0.7,1.8,1.2l0.2,0.2h5.7v8.3h-7.7c-0.1-0.5-0.3-0.9-0.6-1.3\n" +
    "\tc-0.5-0.7-1.2-1.3-2-1.7c-0.9-0.5-1.9-0.8-2.9-1c-1.2-0.3-2.5-0.4-3.8-0.4c-0.6,0-1.2,0-1.8,0.1c-0.6,0.1-1.3,0.3-1.8,0.5\n" +
    "\tc-0.6,0.3-1.1,0.6-1.5,1.1c-0.5,0.6-0.7,1.3-0.7,2c0,0.4,0.1,0.7,0.2,1.1c0.1,0.4,0.4,0.8,0.7,1.1c0.4,0.3,0.8,0.6,1.2,0.8\n" +
    "\tc0.6,0.3,1.2,0.5,1.9,0.6l6.8,1.3c2.1,0.4,4.1,1,6,1.8c1.4,0.6,2.7,1.4,3.8,2.4c0.9,0.8,1.5,1.8,2,2.9c0.4,1.1,0.6,2.3,0.6,3.5\n" +
    "\tc0,1.8-0.4,3.6-1.4,5.2c-0.9,1.5-2.2,2.8-3.7,3.8c-1.6,1-3.4,1.8-5.2,2.3c-1.9,0.5-3.9,0.8-5.9,0.8c-1.2,0-2.4-0.1-3.5-0.2\n" +
    "\tc-1-0.1-1.9-0.4-2.8-0.7c-0.8-0.2-1.5-0.6-2.2-1c-0.6-0.4-1.2-0.8-1.8-1.2L176.8,58z M114.5,26.7h6.6v9.1h-8.7\n" +
    "\tc-1-1.2-2.2-2.1-3.5-2.9c-1.5-0.8-3.2-1.1-4.9-1c-1.4-0.1-2.9,0.1-4.2,0.7c-1.2,0.5-2.3,1.3-3.3,2.2c-0.9,1-1.7,2.1-2.1,3.4\n" +
    "\tc-0.5,1.4-0.8,2.9-0.7,4.4c0,1.4,0.3,2.8,0.8,4.1c0.5,1.2,1.2,2.4,2.2,3.4c0.9,1,2,1.7,3.3,2.2c1.3,0.5,2.7,0.8,4,0.9l0.1,0l0.1,0\n" +
    "\tc1.2-0.1,2.3-0.3,3.4-0.8c1-0.4,1.9-0.9,2.7-1.6c0.8-0.6,1.5-1.4,2-2.2c0.3-0.5,0.7-1,1-1.5l8.3,2.3c-0.5,1.2-1,2.3-1.7,3.4\n" +
    "\tc-1,1.6-2.3,2.9-3.7,4.1c-1.7,1.3-3.5,2.3-5.5,3.1c-2.3,0.8-4.8,1.2-7.2,1.2c-2.6,0-5.2-0.5-7.6-1.5c-2.2-1-4.3-2.3-5.9-4.1\n" +
    "\tc-1.7-1.8-3-3.8-3.9-6.1c-0.9-2.4-1.4-5-1.4-7.5c0-2.5,0.5-5,1.4-7.4c0.9-2.2,2.3-4.2,4-6c1.7-1.7,3.7-3.1,6-4\n" +
    "\tc2.2-0.9,4.5-1.3,6.9-1.3c0.2,0,0.5,0,0.7,0c1.9-0.1,3.8,0.1,5.6,0.7c1.8,0.5,3.6,1.3,5.2,2.4L114.5,26.7z\"/>\n" +
    "<path id=\"Pfad_741\" class=\"st1\" d=\"M48.7,32.1h-6.4c-1.4-1.9-3.6-3-5.9-3c-4,0-7.3,3.3-7.3,7.3c0,4,3.3,7.3,7.3,7.3\n" +
    "\tc2.3,0,4.4-1,5.8-2.8l5.9,1.6c-0.6,1.2-1.4,2.3-2.4,3.2c-2.5,2.5-5.8,3.8-9.3,3.8c-3.5,0-6.8-1.4-9.3-3.8c-2.5-2.5-3.8-5.8-3.8-9.3\n" +
    "\tc0-3.5,1.4-6.8,3.8-9.3c2.5-2.5,5.8-3.8,9.3-3.8c3,0,6,1,8.3,3h4L48.7,32.1z M69.9,22.2c-1.8-4.3-4.5-8.3-7.8-11.6\n" +
    "\tc-3.3-3.3-7.2-6-11.6-7.8C46.1,1,41.3,0,36.4,0c-4.9,0-9.7,1-14.2,2.9c-4.3,1.8-8.3,4.5-11.6,7.8c-3.3,3.3-6,7.2-7.8,11.6\n" +
    "\tC1,26.7,0,31.5,0,36.4c0,4.9,1,9.7,2.9,14.2c1.8,4.3,4.5,8.3,7.8,11.6c3,3,6.6,5.5,10.5,7.3l3.1-5c-3.6-1.5-6.8-3.7-9.5-6.5\n" +
    "\tc-2.8-2.8-5-6.1-6.6-9.7c-1.6-3.8-2.4-7.8-2.4-11.9c0-4.1,0.8-8.1,2.4-11.9c1.5-3.6,3.8-6.9,6.6-9.7c2.8-2.8,6.1-5,9.7-6.6\n" +
    "\tc3.8-1.6,7.8-2.4,11.9-2.4c2.2,0,4.3,0.2,6.4,0.7l-1.6,5.9c-2.4-0.5-4.9-0.6-7.4-0.4c-3.2,0.3-6.3,1.3-9.1,2.8\n" +
    "\tc-2.8,1.5-5.3,3.5-7.4,6c-1.2,1.4-2.3,3-3.1,4.7l5,3.1c1.7-3.7,4.6-6.7,8.2-8.6c2.7-1.5,5.8-2.2,8.9-2.2c1.9,0,3.8,0.3,5.6,0.8\n" +
    "\tc4.8,1.5,8.8,4.8,11.2,9.2c2.4,4.4,2.9,9.6,1.4,14.4C53,47,49.7,51,45.3,53.4c-4.4,2.4-9.6,2.9-14.4,1.4c-4.8-1.5-8.8-4.8-11.2-9.2\n" +
    "\tc-1.9-3.5-2.6-7.4-2.1-11.3L12,32.7c-0.3,2.1-0.4,4.3-0.2,6.5c0.3,3.2,1.3,6.3,2.8,9.1c1.5,2.8,3.5,5.3,6,7.4\n" +
    "\tc2.5,2.1,5.5,3.7,8.6,4.7c2.3,0.7,4.8,1.1,7.2,1.1c0.9,0,1.7,0,2.6-0.1c3.2-0.3,6.3-1.3,9.1-2.8c2.8-1.5,5.3-3.5,7.4-6\n" +
    "\tc2.1-2.5,3.7-5.5,4.7-8.6c1-3.2,1.3-6.5,1-9.8c-0.3-3.2-1.3-6.3-2.8-9.1c-1.5-2.8-3.5-5.3-6-7.4c-1.7-1.4-3.6-2.6-5.6-3.5L49.9,9\n" +
    "\tc3,1.5,5.8,3.5,8.1,5.8c2.8,2.8,5,6.1,6.6,9.7c1.6,3.8,2.4,7.8,2.4,11.9c0,4.1-0.8,8.1-2.4,11.9C63,51.9,60.8,55.2,58,58\n" +
    "\tc-2.8,2.8-6.1,5-9.7,6.6c-3.8,1.6-7.8,2.4-11.9,2.4c-1.9,0-3.8-0.2-5.7-0.5l-1.5,5.6c2.4,0.5,4.8,0.7,7.2,0.7c4.9,0,9.7-1,14.2-2.9\n" +
    "\tc4.3-1.8,8.3-4.5,11.6-7.8c3.3-3.3,6-7.2,7.8-11.6c1.9-4.5,2.9-9.3,2.9-14.2C72.8,31.5,71.8,26.7,69.9,22.2\"/>\n" +
    "</svg>";

  catalog.initialize('http://catalog.caseable.com', 'partner-id', 'eu', 'de');

  function CaseChooser(device) {
    this.device = device;
    this.productTypes = null;
    this.products = null;
    this.currentProductType = null;
    this.currentProducts = [];
  }

  CaseChooser.prototype.init = function(callback) {
    var self = this;
    self.fetchProductTypes(callback);
  };

  CaseChooser.prototype.fetchProductTypes = function(callback) {
    var self = this;
    catalog.getProductTypes(function(error, types) {
      self.currentProductType = {
        "id": "smartphone-hard-case",
        "name": "Smartphone Hard Case",
        "productionTime": {
          "max": 6,
          "min": 3
        },
        "sku": "HC"
      };//types[0];
      self.productTypes = types;

      self.fetchProducts(self.currentProductType, callback);
    });
  };

  CaseChooser.prototype.fetchProducts = function(productType, callback) {
    var self = this;
    catalog.getProducts({type: productType.id, device: self.device}, function(error, products) {
      self.products = products;
      callback();
    });
  };

  CaseChooser.prototype.changeProductType = function(productType, callback) {
    this.currentProductType = productType;
    this.fetchProducts(productType, callback);
  };

  $.fn.caseableWidget = function(device) {
    var self = this;
    var caseChooser = new CaseChooser(device);
    caseChooser.init(function() {
      var wrapper = $('<div/>');
      wrapper.addClass('wrapper');
      renderLogoSection(wrapper);
      renderCategoriesSection(wrapper);
      renderProductTypesSection(wrapper, caseChooser);
      renderProducts(wrapper, caseChooser);

      self.append(wrapper);
    });
    return this;
  };

  function renderProducts(wrapper, caseChooser) {
    wrapper.find('.products').remove();
    var products = $('<div/>');

    products.addClass('products');
    caseChooser.products.forEach(function(product) {
      var productElement = $('<div/>');
      productElement.addClass('product');
      var image = $('<img />');
      image.attr('src', product.thumbnailUrl);
      productElement.append(image);
      products.append(productElement);
    });

    wrapper.append(products);
  }

  function renderLogoSection(wrapper) {
    var logoSection = $('<div/>');
    logoSection.addClass('logo');
    var header = $('<h3></h3>').text('Deine neue Huelle fuer dein Handy');
    logoSection.append(header);
    logoSection.append(caseableLogo);
    wrapper.append(logoSection);
  }

  function renderProductTypesSection(wrapper, caseChooser) {
    wrapper.find('.productTypes').remove();

    var productTypes = $('<div/>');
    productTypes.addClass('productTypes');

    caseChooser.productTypes.forEach(function(type) {
      var typeElement = $('<div/>').text(type.name);
      typeElement.addClass('productType');
      typeElement.on('click', function() {
        caseChooser.changeProductType(type, function() {
          renderProducts(wrapper, caseChooser);
        });
      });
      productTypes.append(typeElement);
    });

    wrapper.append(productTypes);
  }

  function renderCategoriesSection(wrapper) {
    var categories = $('<div/>');
    wrapper.append(categories);
  }

})(jQuery);



