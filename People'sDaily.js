{
	"translatorID": "6db21c3b-f86d-4980-a564-0a872f485c16",
	"label": "People'sDaily",
	"creator": "hello translator<hellotranslator@zotero.com>",
	"target": "http://paper.people.com.cn/rmrb/html/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-03-22 08:54:49"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 YOUR_NAME <- TODO
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	if (url.includes('renmrb')) {
		return "newspaperArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// TODO: adjust the CSS selector
	var rows = doc.querySelectorAll('h2>a.title[href*="/article/"]');
	for (let row of rows) {
		// TODO: check and maybe adjust
		let href = row.href;
		// TODO: check and maybe adjust
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
    var title = ZU.xpath(doc, "//head/title");  // 返回的所有符合该条件的元素列表
    title = title[0].innerText;  // 因为从网页上看只有一个元素符合这个条件，就把第一个元素取出，它的文本就是标题内容
    var publishDate = ZU.xpath(doc, "//head/meta[@name='publishdate']");  // 也是返回列表
    publishDate = publishDate[0].getAttribute('content');  // 取第一个元素，取得 content 属性值
    var author = ZU.xpath(doc, "//div[@class='article']/p[@class='sec']");
    author = author[0].innerText.split('\n')[0].split(' ')[1];
    var content = ZU.xpath(doc, "//div[@id='ozoom']");
    content = content[0].innerText.trim()
    Z.debug(title);
    Z.debug(publishDate);
    Z.debug(author);
    var newItem = new Zotero.Item("newspaperArticle");  // 新建一个新闻条目，后面把信息填入到对应字段
    newItem.title = title;
    newItem.date = publishDate;
    newItem.url = url;
    newItem.creators.push({lastName:author, creatorType:'author'});  // 创建者信息，参考文本翻译器编写官方文档
    newItem.notes.push({note:content});  // 这里是把内容放到条目下的笔记中
    newItem.complete();  // 最后一定要有这一步，表示收集完成，可以传给 Zotero
}
