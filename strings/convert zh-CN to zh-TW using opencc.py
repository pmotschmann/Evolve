# pip install opencc-python-reimplemented
from opencc import OpenCC


with open('strings.zh-CN.json', 'r', encoding='utf-8') as f:
    zh_CN  = f.read()
# convert zh_CN to zh_TW
zh_TW = OpenCC('s2tw').convert(zh_CN)
with open('strings.zh-TW_autotranslated.json', 'w', encoding='utf-8') as f:
    f.write(zh_TW)
