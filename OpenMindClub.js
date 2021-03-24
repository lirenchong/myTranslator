{
	"translatorID": "7f7284d6-1d4c-4505-b38c-984880ab6b92",
	"label": "OpenMindClub",
	"creator": "TanGuangZhi",
	"target": "https://m.openmindclub.com/stu\\/(\\w+)\\/homework/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 12,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-03-24 03:16:28"
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
	but WITHOUT ANY WARRANTY without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/
function detectWeb(doc, url) {
	// TODO: adjust the logic here
	if (url.includes('openmindclub')&&(url.includes('homework'))) {
		return "note"
	}
	else if (getSearchResults(doc, true)) {
		return "multiple"
	}
	return false
}

function getSearchResults(doc, checkOnly) {
	let items = {}
	let found = false
	// TODO: adjust the CSS selector
	let rows = doc.querySelectorAll('h2>a.title[href*="/article/"]')
	for (let row of rows) {
		// TODO: check and maybe adjust
		let href = row.href
		// TODO: check and maybe adjust
		let title = ZU.trimInternal(row.textContent)
		if (!href || !title) continue
		if (checkOnly) return true
		found = true
		items[href] = title
	}
	return found ? items : false
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape)
		})
	}
	else {
		scrape(doc, url)
	}
}

function scrape(doc, url) {
	// 开智
	let titleList = ZU.xpath(doc, "//head/title")
	let title = titleList[0].innerText
	
	// 作业标题
	let homeworkTitleList = ZU.xpath(doc, "//div[@class='top-link-title']/div[@class='top-link-and-title']/span[@class='top-title']")
	let homeworkTitle = homeworkTitleList[0].innerText
	
	// 课程代码与名称
	let classCode=url.match(/\/(\w+)\/homework/g)
	classCode = RegExp.$1 
	let className = "课程名未收录，请联系开发者收录 714763790@qq.com"
	if(classCode.includes('OMLC')){
		let year = classCode.match(/OMLC(\w+)/g)
		year = RegExp.$1 
		className = "人生资本阅读训练营20"+year
	}	
	if(classCode.includes('OMRC')){
		let year = classCode.match(/OMRC(\w+)/g)
		year = RegExp.$1 
		className = "认知与改变阅读训练营20"+year
	}
	if(classCode.includes('IA')){
		let num = classCode.match(/IA(\w+)/g)
		num = RegExp.$1 
		className = "信息分析"+num
	}
	if(classCode.includes('AA')){
		let num = classCode.match(/AA(\w+)/g)
		num = RegExp.$1 
		className = "论证分析"+num
	}
	
	// 昵称与创建时间
	let nicknameTime = ZU.xpath(doc, "//div[@class='avatar-time']/div[@class='nickname-time']/span[@class='time']")
	let nickname = nicknameTime[0].innerText
	let createTime = nicknameTime[1].innerText
	
	// 获取Html结构笔记 
	let note =  ZU.xpath(doc, "//div[@class='assignment-other-answer']/div[@class='new-routes-study-courseHomework-2709']")
	note = note[0].innerHTML
    // TODO 想在这里将html转成Markdown，但zotero translator好像不能掉第三方接口，只能手写正则，后续有时间写上

	// 新建保存条目
	let newItem = new Zotero.Item("webpage")
	newItem.title = classCode+"-"+homeworkTitle
	newItem.date = createTime
	newItem.url = url
	newItem.websiteTitle = title
	newItem.shortTitle = className
	newItem.creators.push({lastName:nickname, creatorType:'nickname'})  // 创建者信息，参考文本翻译器编写官方文档
	newItem.notes.push({note:note})  // 这里是把内容放到条目下的笔记中
	newItem.attachments.push({url:url,document:doc,title:homeworkTitle})
	newItem.complete()  // 最后一定要有这一步，表示收集完成，可以传给 Zotero

	//Z.debug(title)
	//Z.debug(title2)
	//Z.debug(nickname)
	// Z.debug(classCode)
	//Z.debug(createTime)
	// Z.debug(url)
	// Z.debug(doc)
	// Z.debug(note)
	// Z.debug(note[0].innerHTML)

	
}


