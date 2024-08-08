# pip install opencc-python-reimplemented
from opencc import OpenCC


def main(input_file: str, output_file: str) -> None:
    with open(input_file, "r", encoding="utf-8") as f:
        zh_CN: str = f.read()

    # convert zh_CN to zh_TW
    opencc: OpenCC = OpenCC("s2tw")
    zh_TW: str = opencc.convert(zh_CN)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(zh_TW)


if __name__ == "__main__":
    main("strings.zh-CN.json", "strings.zh-TW_autotranslated.json")
