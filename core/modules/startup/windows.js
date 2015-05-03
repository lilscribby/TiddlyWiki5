/*\
title: $:/core/modules/startup/windows.js
type: application/javascript
module-type: startup

Setup root widget handlers for the messages concerned with opening external browser windows

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "windows";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.synchronous = true;

exports.startup = function() {
	$tw.rootWidget.addEventListener("tm-open-window",function(event) {
		// Get the parameters
		var refreshHandler,
			title = event.param || event.tiddlerTitle,
			paramObject = event.paramObject || {},
			template = paramObject.template || "$:/core/templates/single.tiddler.window",
			width = paramObject.width || "700",
			height = paramObject.height || "600";
		// Open the window
		var srcWindow = window.open("","external-" + title,"width=" + width + ",height=" + height),
			srcDocument = srcWindow.document;
		// Check for reopening the same window
		if(srcWindow.haveInitialisedWindow) {
			return;
		}
		// Initialise the document
		srcDocument.write("<html><head></head><body class='tc-body'></body></html>");
		srcDocument.close();
		srcDocument.title = title;
		srcWindow.addEventListener("beforeunload",function(event) {
			$tw.wiki.removeEventListener("change",refreshHandler);
		},false);
		// Set up the styles
		var styleWidgetNode = $tw.wiki.makeTranscludeWidget("$:/core/ui/PageStylesheet",{document: $tw.fakeDocument}),
			styleContainer = $tw.fakeDocument.createElement("style");
		styleWidgetNode.render(styleContainer,null);
		var styleElement = srcDocument.createElement("style");
		styleElement.innerHTML = styleContainer.textContent;
		srcDocument.head.insertBefore(styleElement,srcDocument.head.firstChild);
		// Render the text of the tiddler
		var parser = $tw.wiki.parseTiddler(template),
			widgetNode = $tw.wiki.makeWidget(parser,{document: srcDocument, variables: {currentTiddler: title}});
		widgetNode.render(srcDocument.body,null);
		// Function to handle refreshes
		refreshHandler = function(changes) {
			if(styleWidgetNode.refresh(changes,styleContainer,null)) {
				styleElement.innerHTML = styleContainer.textContent;
			}
			widgetNode.refresh(changes);
		};
		$tw.wiki.addEventListener("change",refreshHandler);
		srcWindow.haveInitialisedWindow = true;
	});
};

})();
