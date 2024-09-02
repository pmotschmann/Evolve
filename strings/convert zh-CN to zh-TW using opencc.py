# pip install opencc-python-reimplemented
from opencc import OpenCC


def main() -> None:
    with open("strings.zh-CN.json", "r", encoding="utf-8") as f:
        zh_CN = f.read()
        
    with open("strings.zh-TW_autotranslated.json", "w", encoding="utf-8") as f:
        zh_TW = OpenCC("s2tw").convert(zh_CN)
        f.write(zh_TW)


if __name__ == "__main__":
    main()
