import urllib
from lxml import html
import requests
from lxml import etree

imagetitle = []
imagetranscript = []
imageurl = []
imagealt = []
imageid = []
n = 1718

def scrape():
    for i in range(n):
        istr = str(i)
        url = 'http://xkcd.com/'
        print (url+istr)
        page = requests.get(url+istr);
        print(page)
        tree = html.fromstring(page.content)
        imagealt.append(tree.xpath('//div[@id="comic"]//img/@title'))
        imagetranscript.append(tree.xpath('//div[@id="transcript"]/text()'))
        imageurl.append(tree.xpath('//div[@id="comic"]//img/@src'))
        imagetitle.append(tree.xpath('//div[@id="comic"]//img/@alt'))
        imageid.append(i)

def maketext():
    f = open('xkcdData.txt','w')
    for i in range(1,n):
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