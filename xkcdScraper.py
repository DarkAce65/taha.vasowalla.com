import urllib
from lxml import html
import requests
from lxml import etree

imagetitle = []
imagetranscript = []
imageurl = []
imagealt = []
imageid = []
offset = 1572
n = 1574

def scrape():
	for i in range(offset, n):
		istr = str(i + 1)
		url = 'http://xkcd.com/'
		page = requests.get(url + istr);
		tree = html.fromstring(page.content)
		imagealt[i] = tree.xpath('//div[@id="comic"]//img/@title')
		imagetranscript[i] = tree.xpath('//div[@id="transcript"]/text()')
		imageurl[i] = tree.xpath('//div[@id="comic"]//img/@src')
		imagetitle[i] = tree.xpath('//div[@id="comic"]//img/@alt')
		imageid[i] = i + 1

def maketext():
	f = open('xkcdData.txt','w')
	f.seek(0, 2)
	for i in range(offset, n):
		f.write(str(imageid[i]))
		f.write('\n')
		f.write(str(imagetitle[i]).strip("['']"))
		f.write('\n')
		f.write(str(imageurl[i]).strip("[//'']"))
		f.write('\n')
		f.write(str(imagealt[i]).strip("[]"))
		f.write('\n')
		f.write(str(imagetranscript[i]).strip("[]"))
		f.write('\n')
	f.close()

scrape()
maketext()