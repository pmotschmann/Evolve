# pip install opencc-python-reimplemented
from opencc import OpenCC


def main() -> None:
    """
    Reads the content of a Simplified Chinese JSON file, converts it to Traditional Chinese,
    and writes the converted content to a new JSON file.

    This script reads the content of the "strings.zh-CN.json" file, converts the content from
    Simplified Chinese (zh-CN) to Traditional Chinese (zh-TW) using OpenCC, and writes the
    converted content to the "strings.zh-TW_autotranslated.json" file.
    """
    # Read the content of the file
    with open("strings.zh-CN.json", "r", encoding="utf-8") as f:
        zh_CN = f.read()

    # Convert zh_CN to zh_TW and write to a new file
    with open("strings.zh-TW_autotranslated.json", "w", encoding="utf-8") as f:
        zh_TW = OpenCC("s2tw").convert(zh_CN)
        f.write(zh_TW)


if __name__ == "__main__":
    main()
